require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prevent caching for API routes
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// In-memory storage with persistence
const DATA_FILE = path.join(__dirname, 'data.json');
let storage = {
  auth: new Map(),
  recipients: [],
  emailQueue: [],
  templates: [],
  sentEmails: [],
  scheduledEmails: []
};

// Persistence functions
function saveToDisk() {
  try {
    const dataToSave = {
      recipients: storage.recipients,
      templates: storage.templates,
      sentEmails: storage.sentEmails,
      scheduledEmails: storage.scheduledEmails
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2));
  } catch (err) {
    console.error('Error saving data to disk:', err);
  }
}

function loadFromDisk() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      storage.recipients = data.recipients || [];
      storage.templates = data.templates || [];
      storage.sentEmails = data.sentEmails || [];
      storage.scheduledEmails = data.scheduledEmails || [];
      console.log('Data loaded from disk successfully');
    }
  } catch (err) {
    console.error('Error loading data from disk:', err);
  }
}

// Initial load
loadFromDisk();

// Gmail OAuth Configuration
const CLIENT_ID = process.env.CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/oauth2callback';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Routes - MUST be before express.static to take precedence
app.get('/', (req, res) => {
  // Disable caching for dashboard
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Static files - MUST be after routes
app.use(express.static('public'));

app.get('/dashboard', (req, res) => {
  // Disable caching for main menu
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, 'public', 'main-menu.html'));
});

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// OAuth Routes
app.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.compose'
    ],
    prompt: 'consent'
  });
  res.redirect(authUrl);
});

app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);

    // Store tokens
    const sessionId = Date.now().toString();

    // Get user profile to get email address
    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });

    // Store tokens with email info
    storage.auth.set(sessionId, {
      tokens,
      email: profile.data.emailAddress || process.env.SENDER_EMAIL || 'unknown@example.com'
    });

    res.cookie('sessionId', sessionId, { httpOnly: true, secure: false });
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error getting token:', error);
    res.redirect('/dashboard?error=authentication_failed');
  }
});

// Check authentication
app.get('/api/check-auth', (req, res) => {
  const sessionId = req.cookies.sessionId;
  const authData = storage.auth.get(sessionId);

  if (authData && authData.tokens) {
    res.json({
      authenticated: true,
      email: authData.email || process.env.SENDER_EMAIL || 'unknown@example.com'
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Recipient Management
app.post('/api/recipients', (req, res) => {
  const { recipients } = req.body;

  if (Array.isArray(recipients)) {
    // Add new recipients
    const newRecipients = recipients.map(email => ({
      email: email.trim(),
      status: 'pending'
    }));
    storage.recipients.push(...newRecipients);
    saveToDisk();
    res.json({ success: true, count: storage.recipients.length });
  } else {
    res.status(400).json({ error: 'Invalid recipients format' });
  }
});

app.get('/api/recipients', (req, res) => {
  res.json(storage.recipients);
});

app.delete('/api/recipients', (req, res) => {
  storage.recipients = [];
  saveToDisk();
  res.json({ success: true });
});

// CSV Upload
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload-csv', upload.single('csv'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  const emails = [];

  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on('data', (row) => {
      // Handle different CSV formats
      const email = row.email || row.Email || row.EMAIL || row[0];
      if (email && email.includes('@')) {
        emails.push({ email: email.trim(), status: 'pending' });
        results.push(row);
      }
    })
    .on('end', () => {
      storage.recipients = [...storage.recipients, ...emails];
      saveToDisk();
      fs.unlinkSync(req.file.path);
      res.json({ success: true, count: emails.length, total: storage.recipients.length });
    })
    .on('error', (error) => {
      console.error('CSV parsing error:', error);
      res.status(500).json({ error: 'Failed to parse CSV' });
    });
});

// Send Emails
app.post('/api/send-emails', async (req, res) => {
  const sessionId = req.cookies.sessionId;
  const authData = storage.auth.get(sessionId);

  if (!authData || !authData.tokens) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { subject, body, delay = 2000, selectedRecipients } = req.body;

  if (!subject || !body) {
    return res.status(400).json({ error: 'Subject and body are required' });
  }

  // Use selected recipients if provided, otherwise use all recipients
  let recipientsToSend = [];
  if (selectedRecipients && Array.isArray(selectedRecipients) && selectedRecipients.length > 0) {
    recipientsToSend = storage.recipients.filter(r => selectedRecipients.includes(r.email));
  } else {
    recipientsToSend = storage.recipients.filter(r => r.status === 'pending');
  }

  if (recipientsToSend.length === 0) {
    return res.status(400).json({ error: 'No recipients selected' });
  }

  // Set up Gmail client
  oauth2Client.setCredentials(authData.tokens);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Get sender email from authenticated account
  const senderEmail = authData.email || process.env.SENDER_EMAIL || 'mmmushtaq526@gmail.com';

  // Start sending process
  const results = {
    total: recipientsToSend.length,
    sent: 0,
    failed: 0,
    errors: [],
    senderEmail: senderEmail,
    sentEmails: []
  };

  // Send emails with delay
  for (let i = 0; i < recipientsToSend.length; i++) {
    const recipient = recipientsToSend[i];

    try {
      const emailContent = createEmail(subject, body, recipient.email, senderEmail);
      const raw = Buffer.from(emailContent).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: raw
        }
      });

      recipient.status = 'sent';
      results.sent++;

      // Store sent email record
      const sentRecord = {
        id: Date.now() + i,
        recipientEmail: recipient.email,
        subject: subject,
        body: body,
        senderEmail: senderEmail,
        status: 'sent',
        sentAt: new Date().toISOString()
      };
      storage.sentEmails.push(sentRecord);
      results.sentEmails.push(sentRecord);
    } catch (error) {
      recipient.status = 'failed';
      results.failed++;
      results.errors.push({ email: recipient.email, error: error.message });

      // Store failed email record
      const failedRecord = {
        id: Date.now() + i,
        recipientEmail: recipient.email,
        subject: subject,
        body: body,
        senderEmail: senderEmail,
        status: 'failed',
        error: error.message,
        sentAt: new Date().toISOString()
      };
      storage.sentEmails.push(failedRecord);
    }

    // Rate limiting delay
    if (i < recipientsToSend.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  saveToDisk();
  res.json(results);
});

// Helper function to create email
function createEmail(subject, body, recipientEmail, senderEmail) {
  const message = [
    `From: ${senderEmail}`,
    `To: ${recipientEmail}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    '',
    body
  ].join('\n');

  return message;
}

// Get sending stats
app.get('/api/stats', (req, res) => {
  const stats = {
    total: storage.recipients.length,
    sent: storage.recipients.filter(r => r.status === 'sent').length,
    pending: storage.recipients.filter(r => r.status === 'pending').length,
    failed: storage.recipients.filter(r => r.status === 'failed').length
  };
  res.json(stats);
});

// Template Management
app.post('/api/templates', (req, res) => {
  const { name, subject, body } = req.body;

  if (!name || !subject || !body) {
    return res.status(400).json({ error: 'Name, subject, and body are required' });
  }

  const template = {
    id: Date.now(),
    name: name.trim(),
    subject: subject.trim(),
    body: body.trim(),
    createdAt: new Date().toISOString()
  };

  storage.templates.push(template);
  saveToDisk();
  res.json({ success: true, template });
});

app.get('/api/templates', (req, res) => {
  res.json(storage.templates);
});

app.put('/api/templates/:id', (req, res) => {
  const { id } = req.params;
  const { name, subject, body } = req.body;

  const templateIndex = storage.templates.findIndex(t => t.id === parseInt(id));
  if (templateIndex === -1) {
    return res.status(404).json({ error: 'Template not found' });
  }

  storage.templates[templateIndex] = {
    ...storage.templates[templateIndex],
    name: name || storage.templates[templateIndex].name,
    subject: subject || storage.templates[templateIndex].subject,
    body: body || storage.templates[templateIndex].body,
    updatedAt: new Date().toISOString()
  };

  saveToDisk();
  res.json({ success: true, template: storage.templates[templateIndex] });
});

app.delete('/api/templates/:id', (req, res) => {
  const { id } = req.params;
  const templateIndex = storage.templates.findIndex(t => t.id === parseInt(id));

  if (templateIndex === -1) {
    return res.status(404).json({ error: 'Template not found' });
  }

  storage.templates.splice(templateIndex, 1);
  saveToDisk();
  res.json({ success: true });
});

// Sent Emails History
app.get('/api/sent-emails', (req, res) => {
  res.json(storage.sentEmails);
});

app.delete('/api/sent-emails/:id', (req, res) => {
  const { id } = req.params;
  const index = storage.sentEmails.findIndex(e => e.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }

  storage.sentEmails.splice(index, 1);
  saveToDisk();
  res.json({ success: true });
});

app.delete('/api/sent-emails', (req, res) => {
  storage.sentEmails = [];
  saveToDisk();
  res.json({ success: true });
});

// Update recipient email or status
app.put('/api/recipients/:email', (req, res) => {
  const { email } = req.params;
  const { status, newEmail } = req.body;

  const recipientIndex = storage.recipients.findIndex(r => r.email === decodeURIComponent(email));
  if (recipientIndex === -1) {
    return res.status(404).json({ error: 'Recipient not found' });
  }

  if (newEmail && newEmail.trim()) {
    storage.recipients[recipientIndex].email = newEmail.trim();
  }
  if (status) {
    storage.recipients[recipientIndex].status = status;
  }

  saveToDisk();
  res.json({ success: true, recipient: storage.recipients[recipientIndex] });
});

// Full data export for backup
app.get('/api/export-data', (req, res) => {
  const data = {
    recipients: storage.recipients,
    templates: storage.templates,
    sentEmails: storage.sentEmails,
    scheduledEmails: storage.scheduledEmails
  };
  res.setHeader('Content-disposition', 'attachment; filename=fire-mail-backup.json');
  res.setHeader('Content-type', 'application/json');
  res.write(JSON.stringify(data, null, 2));
  res.end();
});

// Delete a single recipient by email
app.delete('/api/recipients/:email', (req, res) => {
  const { email } = req.params;
  const decodedEmail = decodeURIComponent(email);
  const index = storage.recipients.findIndex(r => r.email === decodedEmail);

  if (index === -1) {
    return res.status(404).json({ error: 'Recipient not found' });
  }

  storage.recipients.splice(index, 1);
  saveToDisk();
  res.json({ success: true });
});

// Schedule Management
app.post('/api/schedule', async (req, res) => {
  const sessionId = req.cookies.sessionId;
  const authData = storage.auth.get(sessionId);

  if (!authData || !authData.tokens) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { date, time, subject, body, selectedRecipients } = req.body;

  if (!date || !time || !subject || !body) {
    return res.status(400).json({ error: 'Date, time, subject, and body are required' });
  }

  const scheduleDateTime = new Date(`${date}T${time}`);
  const now = new Date();

  if (scheduleDateTime <= now) {
    return res.status(400).json({ error: 'Schedule date/time must be in the future' });
  }

  const schedule = {
    id: Date.now(),
    date,
    time,
    scheduledAt: scheduleDateTime.toISOString(),
    subject,
    body,
    selectedRecipients: selectedRecipients || [],
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };

  storage.scheduledEmails.push(schedule);

  // Schedule the email sending
  const delay = scheduleDateTime.getTime() - now.getTime();
  setTimeout(async () => {
    await executeScheduledEmail(schedule.id, authData);
  }, delay);

  res.json({ success: true, schedule });
});

async function executeScheduledEmail(scheduleId, authData) {
  const schedule = storage.scheduledEmails.find(s => s.id === scheduleId);
  if (!schedule || schedule.status !== 'scheduled') {
    return;
  }

  schedule.status = 'executing';

  try {
    oauth2Client.setCredentials(authData.tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const senderEmail = authData.email || process.env.SENDER_EMAIL || 'mmmushtaq526@gmail.com';

    let recipientsToSend = [];
    if (schedule.selectedRecipients && schedule.selectedRecipients.length > 0) {
      recipientsToSend = storage.recipients.filter(r => schedule.selectedRecipients.includes(r.email));
    } else {
      recipientsToSend = storage.recipients.filter(r => r.status === 'pending');
    }

    for (const recipient of recipientsToSend) {
      try {
        const emailContent = createEmail(schedule.subject, schedule.body, recipient.email, senderEmail);
        const raw = Buffer.from(emailContent).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

        await gmail.users.messages.send({
          userId: 'me',
          requestBody: { raw: raw }
        });

        recipient.status = 'sent';

        const sentRecord = {
          id: Date.now(),
          recipientEmail: recipient.email,
          subject: schedule.subject,
          body: schedule.body,
          senderEmail: senderEmail,
          status: 'sent',
          sentAt: new Date().toISOString(),
          scheduled: true
        };
        storage.sentEmails.push(sentRecord);
      } catch (error) {
        recipient.status = 'failed';
        const failedRecord = {
          id: Date.now(),
          recipientEmail: recipient.email,
          subject: schedule.subject,
          body: schedule.body,
          senderEmail: senderEmail,
          status: 'failed',
          error: error.message,
          sentAt: new Date().toISOString(),
          scheduled: true
        };
        storage.sentEmails.push(failedRecord);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    schedule.status = 'completed';
    saveToDisk(); // Persist sent/failed records from schedule
  } catch (error) {
    schedule.status = 'failed';
    schedule.error = error.message;
    saveToDisk();
  }
}

app.get('/api/schedule', (req, res) => {
  res.json(storage.scheduledEmails);
});

app.delete('/api/schedule/:id', (req, res) => {
  const { id } = req.params;
  const scheduleIndex = storage.scheduledEmails.findIndex(s => s.id === parseInt(id));

  if (scheduleIndex === -1) {
    return res.status(404).json({ error: 'Schedule not found' });
  }

  storage.scheduledEmails.splice(scheduleIndex, 1);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

