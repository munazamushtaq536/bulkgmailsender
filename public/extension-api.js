// Extension configuration
// 🔧 UPDATE VERCEL_URL below with your actual Vercel deployment URL!
const CONFIG = {
    USE_VERCEL: true,        // Enabled — routes all /api/ calls to Vercel
    VERCEL_URL: 'https://your-fire-mail-app.vercel.app', // ← Replace with your Vercel URL
    API_MOCK_ENABLED: false  // Disabled — using real Vercel + Supabase backend
};

const originalFetch = window.fetch;

// Chrome storage helper
const storage = {
    get: (key) => new Promise(resolve => chrome.storage.local.get(key, res => resolve(res[key]))),
    set: (key, value) => new Promise(resolve => chrome.storage.local.set({ [key]: value }, resolve)),
    getAll: () => new Promise(resolve => chrome.storage.local.get(null, resolve))
};

// Intercept fetch
window.fetch = async function (url, options = {}) {
    // If Vercel is enabled, rewrite /api calls to the remote URL
    if (CONFIG.USE_VERCEL && typeof url === 'string' && url.includes('/api/')) {
        const remoteUrl = url.replace(/.*\/api\//, CONFIG.VERCEL_URL + '/api/');
        console.log('[Extension API] Routing to Vercel:', remoteUrl);
        return originalFetch(remoteUrl, options);
    }

    // Normal mock interception for local mode
    if (CONFIG.API_MOCK_ENABLED && typeof url === 'string' && url.includes('/api/')) {
        return handleMockApi(url, options);
    }

    return originalFetch(url, options);
};

// Initialize default data if empty
async function initStorage() {
    const data = await storage.getAll();
    if (!data.recipients) await storage.set('recipients', []);
    if (!data.templates) await storage.set('templates', []);
    if (!data.sentEmails) await storage.set('sentEmails', []);
    if (!data.scheduledEmails) await storage.set('scheduledEmails', []);
}
initStorage();

// Retrieve OAuth token
function getAuthToken(interactive = true) {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive }, function (token) {
            if (chrome.runtime.lastError) {
                const errMsg = chrome.runtime.lastError.message;
                alert("Gmail Connection Error: " + errMsg + "\n\nTip: Ensure your Extension ID is authorized in the Google Cloud Console and the Client ID in manifest.json is correct.");
                reject(chrome.runtime.lastError);
            } else {
                resolve(token);
            }
        });
    });
}

function getEmailFromToken(token) {
    return new Promise((resolve) => {
        chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, function (info) {
            resolve(info.email || 'Extension User');
        });
    });
}


// Mock response creator
function mockResponse(data, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => data
    };
}

async function handleMockApi(url, options) {
    console.log('[Extension API] Intercepting fetch:', url);
    const path = url.split('/api')[1].split('?')[0];
    const method = options.method || 'GET';
    const body = options.body && typeof options.body === 'string' ? JSON.parse(options.body) : options.body;

    // Check Auth
    if (path === '/check-auth' && method === 'GET') {
        try {
            const token = await getAuthToken(false);
            const email = await getEmailFromToken(token);
            return mockResponse({ authenticated: true, email: email });
        } catch (e) {
            return mockResponse({ authenticated: false });
        }
    }

    // Auth redirection mock (since extension handles OAuth, we just trigger it)
    if (path === '/auth/google' || url.includes('/auth/google')) {
        // Should not be called because we replace login logic, but just in case
        await getAuthToken(true);
        return mockResponse({ success: true });
    }

    // --- RECIPIENTS ---
    if (path === '/recipients') {
        if (method === 'GET') {
            const recipients = await storage.get('recipients') || [];
            return mockResponse(recipients);
        }
        if (method === 'POST') {
            const newEmails = body.recipients || [];
            let recipients = await storage.get('recipients') || [];
            newEmails.forEach(email => {
                if (!recipients.find(r => r.email === email)) {
                    recipients.push({ email, status: 'pending', id: Date.now() + Math.random() });
                }
            });
            await storage.set('recipients', recipients);
            return mockResponse({ success: true, count: newEmails.length });
        }
        if (method === 'DELETE') {
            await storage.set('recipients', []);
            return mockResponse({ success: true });
        }
    }

    // SINGLE RECIPIENT
    if (path.startsWith('/recipients/') && method === 'PUT') {
        const emailToEdit = decodeURIComponent(path.split('/recipients/')[1]);
        const newEmail = body.newEmail;
        let recipients = await storage.get('recipients') || [];
        const r = recipients.find(x => x.email === emailToEdit);
        if (r) r.email = newEmail;
        await storage.set('recipients', recipients);
        return mockResponse({ success: true });
    }
    if (path.startsWith('/recipients/') && method === 'DELETE') {
        const emailToDelete = decodeURIComponent(path.split('/recipients/')[1]);
        let recipients = await storage.get('recipients') || [];
        recipients = recipients.filter(x => x.email !== emailToDelete);
        await storage.set('recipients', recipients);
        return mockResponse({ success: true });
    }

    // --- TEMPLATES ---
    if (path === '/templates') {
        if (method === 'GET') {
            return mockResponse(await storage.get('templates') || []);
        }
        if (method === 'POST') {
            let templates = await storage.get('templates') || [];
            const newTemplate = {
                id: Date.now(),
                name: body.name,
                subject: body.subject,
                body: body.body,
                createdAt: new Date().toISOString()
            };
            templates.push(newTemplate);
            await storage.set('templates', templates);
            return mockResponse({ success: true, template: newTemplate });
        }
    }
    if (path.startsWith('/templates/')) {
        const id = parseInt(path.split('/templates/')[1]);
        let templates = await storage.get('templates') || [];
        if (method === 'PUT') {
            const t = templates.find(x => x.id === id);
            if (t) {
                t.name = body.name; t.subject = body.subject; t.body = body.body;
            }
            await storage.set('templates', templates);
            return mockResponse({ success: true });
        }
        if (method === 'DELETE') {
            templates = templates.filter(x => x.id !== id);
            await storage.set('templates', templates);
            return mockResponse({ success: true });
        }
    }

    // --- STATS ---
    if (path === '/stats' && method === 'GET') {
        const recipients = await storage.get('recipients') || [];
        return mockResponse({
            total: recipients.length,
            sent: recipients.filter(r => r.status === 'sent').length,
            pending: recipients.filter(r => r.status === 'pending').length,
            failed: recipients.filter(r => r.status === 'failed').length
        });
    }

    // --- SCHEDULES ---
    if (path === '/schedule') {
        if (method === 'GET') {
            return mockResponse(await storage.get('scheduledEmails') || []);
        }
        if (method === 'POST') {
            let schedules = await storage.get('scheduledEmails') || [];
            const newSchedule = {
                id: Date.now(),
                ...body,
                scheduledAt: `${body.date}T${body.time}`,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            schedules.push(newSchedule);
            await storage.set('scheduledEmails', schedules);
            return mockResponse({ success: true, schedule: newSchedule });
        }
    }
    if (path.startsWith('/schedule/')) {
        const id = parseInt(path.split('/schedule/')[1]);
        if (method === 'DELETE') {
            let schedules = await storage.get('scheduledEmails') || [];
            schedules = schedules.filter(x => x.id !== id);
            await storage.set('scheduledEmails', schedules);
            return mockResponse({ success: true });
        }
    }

    // --- SENT EMAILS ---
    if (path === '/sent-emails' && method === 'GET') {
        return mockResponse(await storage.get('sentEmails') || []);
    }
    if (path === '/sent-emails' && method === 'DELETE') {
        await storage.set('sentEmails', []);
        return mockResponse({ success: true });
    }
    if (path === '/sent-emails-internal' && method === 'POST') {
        let sentEmails = await storage.get('sentEmails') || [];
        const newRecord = {
            id: Date.now() + Math.random(),
            ...body
        };
        sentEmails.push(newRecord);
        await storage.set('sentEmails', sentEmails);
        return mockResponse({ success: true, record: newRecord });
    }
    if (path.startsWith('/sent-emails/') && method === 'DELETE') {
        const id = path.split('/sent-emails/')[1];
        let sentEmails = await storage.get('sentEmails') || [];
        sentEmails = sentEmails.filter(x => x.id.toString() !== id.toString());
        await storage.set('sentEmails', sentEmails);
        return mockResponse({ success: true });
    }

    // --- CSV UPLOAD (MOCK - handled elsewhere for actual file input, but in case they use this route) ---
    if (path === '/upload-csv' && method === 'POST') {
        // Since FormData cannot easily be sent/intercepted as JSON, we should patch the handleCSVUpload in main-menu.js 
        // to parse client-side. We will mock a response just in case.
        return mockResponse({ success: false, error: "CSV parsed client side" });
    }

    // --- SEND EMAILS ---
    if (path === '/send-emails' && method === 'POST') {
        try {
            const token = await getAuthToken(true);
            const userEmail = await getEmailFromToken(token);
            const recipients = await storage.get('recipients') || [];
            const { subject, body: emailBody, delay, selectedRecipients } = body;

            let sent = 0;
            let failed = 0;
            let errors = [];
            let sentRecords = await storage.get('sentEmails') || [];

            for (let i = 0; i < selectedRecipients.length; i++) {
                const targetEmail = selectedRecipients[i];
                const rIndex = recipients.findIndex(r => r.email === targetEmail);

                try {
                    // Create raw email
                    let rawEmail = "To: " + targetEmail + "\n";
                    rawEmail += "From: " + userEmail + "\n";
                    rawEmail += "Subject: " + subject + "\n";
                    rawEmail += "Content-Type: text/html; charset=utf-8\n\n";
                    rawEmail += emailBody;

                    const encodedEmail = btoa(unescape(encodeURIComponent(rawEmail)))
                        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

                    const res = await originalFetch('https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ raw: encodedEmail })
                    });

                    if (!res.ok) throw new Error("Gmail API error: " + res.statusText);

                    if (rIndex > -1) recipients[rIndex].status = 'sent';
                    sent++;

                    sentRecords.push({
                        id: Date.now() + Math.random(),
                        recipientEmail: targetEmail,
                        subject,
                        body: emailBody, // Store body for detail view
                        status: 'sent',
                        sentAt: new Date().toISOString()
                    });
                } catch (err) {
                    if (rIndex > -1) recipients[rIndex].status = 'failed';
                    failed++;
                    errors.push({ email: targetEmail, error: err.message });
                    sentRecords.push({
                        id: Date.now() + Math.random(),
                        recipientEmail: targetEmail,
                        subject,
                        body: emailBody, // Store body for detail view
                        status: 'failed',
                        error: err.message,
                        sentAt: new Date().toISOString()
                    });
                }

                // Keep UI synced
                await storage.set('recipients', recipients);
                await storage.set('sentEmails', sentRecords);

                // Delay
                if (i < selectedRecipients.length - 1 && delay) {
                    await new Promise(r => setTimeout(r, delay));
                }
            }
            return mockResponse({ total: selectedRecipients.length, sent, failed, errors });
        } catch (e) {
            return mockResponse({ error: e.message }, 500);
        }
    }

    return mockResponse({ error: 'Endpoint not mocked' }, 404);
};
