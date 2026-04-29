const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

let supabase;
try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
        supabase = createClient(supabaseUrl, supabaseKey);
    } else {
        console.error('[Supabase] Missing environment variables!');
    }
} catch (e) {
    console.error('[Supabase] Client Initialization Failed:', e);
}

// --- API ROUTES ---

app.get('/api/check-auth', async (req, res) => {
    res.json({
        authenticated: true,
        backend: "Supabase + Vercel",
        supabase_initialized: !!supabase,
        env_vars: {
            url: !!process.env.SUPABASE_URL,
            key: !!process.env.SUPABASE_ANON_KEY
        }
    });
});

// --- RECIPIENTS ---
app.get('/api/recipients', async (req, res) => {
    const { data, error } = await supabase
        .from('recipients')
        .select('*');

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

app.post('/api/recipients', async (req, res) => {
    const { recipients: emails } = req.body;
    if (!Array.isArray(emails)) return res.status(400).json({ error: 'Recipients must be an array' });

    const insertData = emails.map(email => ({
        email: typeof email === 'string' ? email : email.email,
        status: 'pending'
    }));

    const { data, error } = await supabase
        .from('recipients')
        .upsert(insertData, { onConflict: 'email' });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, count: insertData.length });
});

app.delete('/api/recipients', async (req, res) => {
    const { error } = await supabase
        .from('recipients')
        .delete()
        .neq('email', 'placeholder@example.com'); // Delete all

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

// Single Recipient Actions
app.delete('/api/recipients/:email', async (req, res) => {
    const { error } = await supabase
        .from('recipients')
        .delete()
        .eq('email', req.params.email);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

app.put('/api/recipients/:email', async (req, res) => {
    const { status, newEmail } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (newEmail) updateData.email = newEmail;

    const { error } = await supabase
        .from('recipients')
        .update(updateData)
        .eq('email', req.params.email);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

// --- TEMPLATES ---
app.get('/api/templates', async (req, res) => {
    const { data, error } = await supabase
        .from('templates')
        .select('*');

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

app.post('/api/templates', async (req, res) => {
    const { name, subject, body } = req.body;
    const { data, error } = await supabase
        .from('templates')
        .insert([{ name, subject, body }])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, template: data[0] });
});

app.put('/api/templates/:id', async (req, res) => {
    const { name, subject, body } = req.body;
    const { error } = await supabase
        .from('templates')
        .update({ name, subject, body })
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

app.delete('/api/templates/:id', async (req, res) => {
    const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

// --- STATS ---
app.get('/api/stats', async (req, res) => {
    const { data: recipients, error } = await supabase
        .from('recipients')
        .select('status');

    if (error) return res.status(500).json({ error: error.message });

    const stats = {
        total: recipients.length,
        sent: recipients.filter(r => r.status === 'sent').length,
        pending: recipients.filter(r => r.status === 'pending').length,
        failed: recipients.filter(r => r.status === 'failed').length
    };
    res.json(stats);
});

// --- SENT EMAILS ---
app.get('/api/sent-emails', async (req, res) => {
    const { data, error } = await supabase
        .from('sent_history')
        .select('*')
        .order('sent_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    // Normalize column names to camelCase for the frontend
    const normalized = (data || []).map(r => ({
        id: r.id,
        recipientEmail: r.recipient_email,
        subject: r.subject,
        body: r.body,
        status: r.status,
        error: r.error,
        sentAt: r.sent_at
    }));
    res.json(normalized);
});

app.post('/api/sent-emails-internal', async (req, res) => {
    const { recipientEmail, subject, body, status, error, sentAt } = req.body;
    const insertData = {
        recipient_email: recipientEmail,
        subject,
        body,
        status,
        error: error || null,
        sent_at: sentAt || new Date().toISOString()
    };
    const { data, error: dbError } = await supabase
        .from('sent_history')
        .insert([insertData]);

    if (dbError) return res.status(500).json({ error: dbError.message });
    res.json({ success: true });
});

// --- SCHEDULES ---
app.get('/api/schedule', async (req, res) => {
    const { data, error } = await supabase
        .from('schedules')
        .select('*');

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

app.post('/api/schedule', async (req, res) => {
    const { date, time, subject, body, selectedRecipients } = req.body;
    const insertData = {
        date,
        time,
        scheduled_at: date && time ? `${date}T${time}` : null,
        subject,
        body,
        selected_recipients: selectedRecipients || [],
        status: 'pending'
    };
    const { data, error } = await supabase
        .from('schedules')
        .insert([insertData]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, schedule: data ? data[0] : insertData });
});

app.delete('/api/schedule/:id', async (req, res) => {
    const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});


// Error Handler
app.use((err, req, res, next) => {
    console.error('[Server Error]', err);
    res.status(500).json({ 
        error: 'Backend Error', 
        message: err.message,
        hint: 'Check Supabase connection and environment variables.' 
    });
});

// Export for Vercel
module.exports = app;
