const express = require('express');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');
const { Redis } = require('@upstash/redis');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Neon Postgres and Upstash Redis connections
// Note: Fallback to dummy strings if not provided so it doesn't crash on boot,
// but endpoints will error if no valid connection details exist.
const sql = neon(process.env.POSTGRES_URL || 'postgres://dummy:dummy@dummy/dummy');
const kv = process.env.KV_REST_API_URL ? new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN || '',
}) : null;

// --- VERIFICATION ---
app.get('/api/check-auth', async (req, res) => {
    try {
        await sql`SELECT 1`;
        res.json({
            authenticated: true,
            backend: "Vercel Neon Postgres + Upstash KV",
            online: true
        });
    } catch (e) {
        res.status(500).json({ error: e.message, online: false });
    }
});

// --- INIT DB ---
app.get('/api/init-db', async (req, res) => {
    try {
        await sql`CREATE TABLE IF NOT EXISTS recipients (
            email VARCHAR(255) PRIMARY KEY,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`;

        await sql`CREATE TABLE IF NOT EXISTS templates (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            body TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`;

        await sql`CREATE TABLE IF NOT EXISTS sent_history (
            id SERIAL PRIMARY KEY,
            recipient_email VARCHAR(255) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            body TEXT,
            status VARCHAR(50) NOT NULL,
            error TEXT,
            sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`;

        await sql`CREATE TABLE IF NOT EXISTS schedules (
            id SERIAL PRIMARY KEY,
            date VARCHAR(50) NOT NULL,
            time VARCHAR(50) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            body TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`;

        res.json({ success: true, message: "Database tables initialized successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- RECIPIENTS ---
app.get('/api/recipients', async (req, res) => {
    try {
        const rows = await sql`SELECT * FROM recipients ORDER BY created_at DESC`;
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/recipients', async (req, res) => {
    try {
        const { recipients: emails } = req.body;
        if (!Array.isArray(emails)) return res.status(400).json({ error: 'Recipients must be an array' });

        let count = 0;
        for (const emailData of emails) {
            const email = typeof emailData === 'string' ? emailData : emailData.email;
            await sql`
                INSERT INTO recipients (email, status) 
                VALUES (${email}, 'pending') 
                ON CONFLICT (email) DO UPDATE SET status = 'pending'
            `;
            count++;
        }
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/recipients', async (req, res) => {
    try {
        await sql`DELETE FROM recipients`;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/recipients/:email', async (req, res) => {
    try {
        await sql`DELETE FROM recipients WHERE email = ${req.params.email}`;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/recipients/:email', async (req, res) => {
    try {
        const { status, newEmail } = req.body;
        const currentEmail = req.params.email;

        if (status && newEmail) {
            await sql`UPDATE recipients SET status = ${status}, email = ${newEmail} WHERE email = ${currentEmail}`;
        } else if (status) {
            await sql`UPDATE recipients SET status = ${status} WHERE email = ${currentEmail}`;
        } else if (newEmail) {
             await sql`UPDATE recipients SET email = ${newEmail} WHERE email = ${currentEmail}`;
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- TEMPLATES ---
app.get('/api/templates', async (req, res) => {
    try {
        const rows = await sql`SELECT * FROM templates ORDER BY created_at DESC`;
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/templates', async (req, res) => {
    try {
        const { name, subject, body } = req.body;
        const rows = await sql`
            INSERT INTO templates (name, subject, body) 
            VALUES (${name}, ${subject}, ${body}) 
            RETURNING *
        `;
        res.json({ success: true, template: rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/templates/:id', async (req, res) => {
    try {
        const { name, subject, body } = req.body;
        await sql`
            UPDATE templates SET name = ${name}, subject = ${subject}, body = ${body} 
            WHERE id = ${req.params.id}
        `;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/templates/:id', async (req, res) => {
    try {
        await sql`DELETE FROM templates WHERE id = ${req.params.id}`;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- STATS ---
app.get('/api/stats', async (req, res) => {
    try {
        const rows = await sql`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
            FROM recipients
        `;
        
        res.json({
            total: parseInt(rows[0].total) || 0,
            sent: parseInt(rows[0].sent) || 0,
            pending: parseInt(rows[0].pending) || 0,
            failed: parseInt(rows[0].failed) || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SENT EMAILS ---
app.get('/api/sent-emails', async (req, res) => {
    try {
        const rows = await sql`SELECT * FROM sent_history ORDER BY sent_at DESC`;
        // map db columns to js keys
        const formattedRows = rows.map(r => ({
            id: r.id,
            recipientEmail: r.recipient_email,
            subject: r.subject,
            body: r.body,
            status: r.status,
            error: r.error,
            sentAt: r.sent_at
        }));
        res.json(formattedRows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/sent-emails-internal', async (req, res) => {
    try {
        const { recipientEmail, subject, body, status, error, sentAt } = req.body;
        const sendDate = sentAt || new Date().toISOString();
        await sql`
            INSERT INTO sent_history (recipient_email, subject, body, status, error, sent_at)
            VALUES (${recipientEmail}, ${subject}, ${body}, ${status}, ${error}, ${sendDate})
        `;
        res.json({ success: true });
    } catch (dbError) {
        res.status(500).json({ error: dbError.message });
    }
});

// --- SCHEDULES ---
app.get('/api/schedule', async (req, res) => {
    try {
        const rows = await sql`SELECT * FROM schedules ORDER BY created_at DESC`;
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/schedule', async (req, res) => {
    try {
        const { date, time, subject, body } = req.body;
        const rows = await sql`
            INSERT INTO schedules (date, time, subject, body)
            VALUES (${date}, ${time}, ${subject}, ${body})
            RETURNING *
        `;
        res.json({ success: true, schedule: rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/schedule/:id', async (req, res) => {
    try {
        await sql`DELETE FROM schedules WHERE id = ${req.params.id}`;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- KV REMOTE DATA / SETTINGS ---
app.get('/api/settings', async (req, res) => {
    try {
        if (!kv) return res.status(500).json({ error: "KV not configured" });
        const settings = await kv.get('app_settings') || {};
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/settings', async (req, res) => {
    try {
        if (!kv) return res.status(500).json({ error: "KV not configured" });
        await kv.set('app_settings', req.body);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export for Vercel
module.exports = app;
