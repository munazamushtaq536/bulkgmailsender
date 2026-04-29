// API Base URL
const API_BASE = '';
console.log('Main-menu.js initialized at', new Date().toLocaleTimeString());

// Current section
let currentSection = 'input';

// Check authentication on load
document.addEventListener('DOMContentLoaded', function () {
    checkAuth();
    setupMenuNavigation();
    setupEventListeners();

    // Sidebar actions
    document.getElementById('sidebar-logout-btn')?.addEventListener('click', logout);
    document.getElementById('sidebar-connect-btn')?.addEventListener('click', logout);

    // Header actions
    document.getElementById('header-logout-btn')?.addEventListener('click', logout);
    document.getElementById('header-connect-btn')?.addEventListener('click', logout);
});

// Check authentication
async function checkAuth() {
    if (typeof chrome !== 'undefined' && chrome.identity && chrome.identity.getAuthToken) {
        chrome.identity.getAuthToken({ interactive: false }, async function (token) {
            if (!chrome.runtime.lastError && token) {
                console.log('[Auth] Token found, fetching user email...');

                const finalize = (email) => {
                    displayUserEmail(email || 'Google User');
                    loadRecipients();
                    loadTemplates();
                    loadSentEmails();
                    loadSchedules();
                    updateStats();
                };

                // Use Gmail Profile API (most reliable since we already authorized gmail scopes)
                console.log('[Auth] Trying Gmail Profile API...');
                fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
                    headers: { 'Authorization': 'Bearer ' + token }
                })
                    .then(response => response.json())
                    .then(profile => {
                        if (profile && profile.emailAddress) {
                            console.log('[Auth] Email found via Gmail API:', profile.emailAddress);
                            finalize(profile.emailAddress);
                        } else {
                            console.log('[Auth] Gmail API returned no email, trying low-level Identity info...');
                            chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, function (info) {
                                finalize(info.email || null);
                            });
                        }
                    })
                    .catch(err => {
                        console.error('[Auth] Gmail API fetch failed:', err);
                        // Last ditch effort
                        chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, function (info) {
                            finalize(info.email || null);
                        });
                    });
            } else {
                window.location.href = 'index.html';
            }
        });
    } else {
        try {
            const response = await fetch(`${API_BASE}/api/check-auth`);
            const data = await response.json();

            if (data.authenticated) {
                displayUserEmail(data.email);
                loadRecipients();
                loadTemplates();
                loadSentEmails();
                loadSchedules();
                updateStats();
            } else {
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = 'index.html';
        }
    }
}

// Display user email
function displayUserEmail(email) {
    const sidebarEmail = document.getElementById('user-email-sidebar');
    const headerEmail = document.getElementById('user-email-header');

    if (sidebarEmail) {
        sidebarEmail.textContent = email;
    }
    if (headerEmail) {
        headerEmail.textContent = `Logged in as: ${email}`;
    }
}

// Setup menu navigation
function setupMenuNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            switchSection(section);

            // Update active state
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// Switch between sections
function switchSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionName;

        // Load section-specific data
        if (sectionName === 'record') {
            updateStats();
            loadSentEmails();
        } else if (sectionName === 'template') {
            loadTemplates();
        } else if (sectionName === 'schedule') {
            loadSchedules();
        } else if (sectionName === 'send') {
            loadTemplates(); // refresh dropdown with saved templates
        }
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Add recipients
    const addRecipientsBtn = document.getElementById('add-recipients-btn');
    if (addRecipientsBtn) {
        addRecipientsBtn.addEventListener('click', addRecipients);
    }

    // CSV upload
    const csvFile = document.getElementById('csv-file');
    if (csvFile) {
        csvFile.addEventListener('change', handleCSVUpload);
    }

    // Clear recipients
    const clearRecipientsBtn = document.getElementById('clear-recipients-btn');
    if (clearRecipientsBtn) {
        clearRecipientsBtn.addEventListener('click', clearRecipients);
    }

    // Send emails
    const sendBtn = document.getElementById('send-btn');
    if (sendBtn) {
        sendBtn.addEventListener('click', sendEmails);
    }

    // Save schedule
    const saveScheduleBtn = document.getElementById('save-schedule-btn');
    if (saveScheduleBtn) {
        saveScheduleBtn.addEventListener('click', saveSchedule);
    }

    // Load template into send section
    const loadTemplateSendBtn = document.getElementById('load-template-btn');
    if (loadTemplateSendBtn) {
        loadTemplateSendBtn.addEventListener('click', loadTemplateIntoSend);
    }

    // Save template
    const saveTemplateBtn = document.getElementById('save-template-btn');
    if (saveTemplateBtn) {
        saveTemplateBtn.addEventListener('click', saveTemplate);
    }

    // Clear template
    const clearTemplateBtn = document.getElementById('clear-template-btn');
    if (clearTemplateBtn) {
        clearTemplateBtn.addEventListener('click', clearTemplate);
    }

    // Save data
    const saveDataBtn = document.getElementById('save-data-btn');
    if (saveDataBtn) {
        saveDataBtn.addEventListener('click', saveData);
    }

    // View sent data
    const viewSentDataBtn = document.getElementById('view-sent-data-btn');
    if (viewSentDataBtn) {
        viewSentDataBtn.addEventListener('click', viewSentData);
    }

    // Clear all history
    const clearAllHistoryBtn = document.getElementById('clear-all-history-btn');
    if (clearAllHistoryBtn) {
        clearAllHistoryBtn.addEventListener('click', clearAllSentHistory);
    }

    // Export all data
    const exportDataBtn = document.getElementById('export-data-btn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportAllData);
    }

    // Exit project
    const exitProjectBtn = document.getElementById('exit-project-btn');
    if (exitProjectBtn) {
        exitProjectBtn.addEventListener('click', exitProject);
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Event delegation for dynamic buttons (CSP-compliant)
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-action');

        if (action === 'load-builtin') {
            loadTemplate(parseInt(btn.getAttribute('data-num')));
        } else if (action === 'edit-recipient') {
            editRecipient(btn.getAttribute('data-email'));
        } else if (action === 'delete-recipient') {
            deleteRecipient(btn.getAttribute('data-email'));
        } else if (action === 'use-template') {
            window.useTemplate(parseInt(btn.getAttribute('data-id')));
        } else if (action === 'edit-template') {
            window.editTemplate(parseInt(btn.getAttribute('data-id')));
        } else if (action === 'delete-template') {
            window.deleteTemplate(parseInt(btn.getAttribute('data-id')));
        } else if (action === 'view-email') {
            window.viewEmailDetails(btn.getAttribute('data-id'));
        } else if (action === 'delete-email') {
            window.deleteSentEmailRecord(btn.getAttribute('data-id'));
        } else if (action === 'fix-status') {
            window.editRecordStatus(btn.getAttribute('data-email'), 'pending');
        } else if (action === 'delete-schedule') {
            window.deleteSchedule(parseInt(btn.getAttribute('data-id')));
        }
    });
}

// Add recipients
async function addRecipients() {
    const input = document.getElementById('recipients-input');
    if (!input) return;

    const emails = input.value.split(/[,\n]/).map(e => e.trim()).filter(e => e);

    if (emails.length === 0) {
        alert('Please enter at least one email address');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/recipients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipients: emails })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            input.value = '';
            await loadRecipients();
            updateStats();
            alert(`Successfully added ${emails.length} recipient(s) to cloud.`);
        } else {
            console.error('API Error details:', data);
            alert(`Failed to add recipients: ${data.error || 'Unknown server error'}\n\nTip: Ensure your Supabase tables are created (see supabase_setup.sql).`);
        }
    } catch (error) {
        console.error('Network or Extension error:', error);
        alert('Could not connect to the recipient service. Check your Vercel URL in extension-api.js or your internet connection.');
    }
}

// Handle CSV upload
async function handleCSVUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (event) {
        const text = event.target.result;
        const emails = text.split(/[\r\n]+/)
            .map(row => row.split(',')[0].trim()) // Assuming email is first col
            .map(e => e.replace(/['"]/g, ''))
            .filter(e => e && e.includes('@'));

        if (emails.length === 0) {
            alert('No valid emails found in CSV');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/recipients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipients: emails })
            });

            const data = await response.json();
            if (data.success) {
                await loadRecipients();
                updateStats();
                alert(`Uploaded ${data.count} recipients from CSV`);
            }
        } catch (error) {
            console.error('Failed to parse CSV client-side:', error);
            alert('Failed to process CSV file');
        }
    };
    reader.readAsText(file);

    // Reset file input
    e.target.value = '';
}

// Load recipients
async function loadRecipients() {
    try {
        const response = await fetch(`${API_BASE}/api/recipients`);
        const data = await response.json();

        const recipientsList = document.getElementById('recipients-list');
        if (!recipientsList) return;

        // Handle error object instead of array
        if (data.error || !Array.isArray(data)) {
            console.error('Failed to load recipients from API:', data);
            recipientsList.innerHTML = `<p class="error-state" style="color: #d32f2f; font-weight: bold; padding: 1rem;">
                ⚠️ ${data.error || 'Server returned invalid data format'}
                <br><small>If you haven't set up Supabase yet, use the provided SQL script.</small>
            </p>`;
            return;
        }

        const recipients = data;

        if (recipients.length === 0) {
            recipientsList.innerHTML = '<p class="empty-state">No recipients added yet</p>';
            return;
        }

        recipientsList.innerHTML = recipients.map(recipient => {
            const statusClass = `status-${recipient.status || 'pending'}`;
            const encodedEmail = encodeURIComponent(recipient.email);
            return `
                <div class="recipient-item" data-email="${recipient.email}">
                    <span class="recipient-email-text">${recipient.email}</span>
                    <div class="recipient-right">
                        <span class="recipient-status ${statusClass}">${recipient.status || 'pending'}</span>
                        <button class="btn-icon btn-edit" data-action="edit-recipient" data-email="${encodedEmail}" title="Edit email">✏️</button>
                        <button class="btn-icon btn-remove" data-action="delete-recipient" data-email="${encodedEmail}" title="Remove recipient">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Failed to load recipients:', error);
    }
}

// Edit a single recipient's email address
window.editRecipient = async function (encodedEmail) {
    const currentEmail = decodeURIComponent(encodedEmail);
    const newEmail = prompt(`Edit email address:`, currentEmail);
    if (!newEmail || newEmail.trim() === currentEmail) return;
    if (!newEmail.includes('@')) {
        alert('Please enter a valid email address.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/recipients/${encodedEmail}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newEmail: newEmail.trim() })
        });
        const data = await response.json();
        if (data.success) {
            await loadRecipients();
            updateStats();
        } else {
            alert('Failed to update recipient: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Failed to edit recipient:', error);
        alert('Failed to edit recipient');
    }
}

// Delete a single recipient
window.deleteRecipient = async function (encodedEmail) {
    const email = decodeURIComponent(encodedEmail);
    if (!confirm(`Remove "${email}" from the recipient list?`)) return;

    try {
        const response = await fetch(`${API_BASE}/api/recipients/${encodedEmail}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
            await loadRecipients();
            updateStats();
        } else {
            alert('Failed to remove recipient: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Failed to delete recipient:', error);
        alert('Failed to remove recipient');
    }
}

// Clear recipients
async function clearRecipients() {
    if (!confirm('Are you sure you want to clear all recipients?')) return;

    try {
        const response = await fetch(`${API_BASE}/api/recipients`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            await loadRecipients();
            updateStats();
            alert('All recipients cleared');
        }
    } catch (error) {
        console.error('Failed to clear recipients:', error);
        alert('Failed to clear recipients');
    }
}


// Helper for RFC 2822 construction (Extension mode)
function createRawEmail(to, subject, body, senderEmail) {
    const str = [
        "Content-Type: text/html; charset=\"UTF-8\"\n",
        "MIME-Version: 1.0\n",
        "Content-Transfer-Encoding: 7bit\n",
        "to: ", to, "\n",
        "from: ", senderEmail || 'me', "\n",
        "subject: ", subject, "\n\n",
        body
    ].join('');
    return btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

// Send emails
async function sendEmails() {
    const subject = document.getElementById('subject-input')?.value;
    const body = document.getElementById('body-input')?.value;
    const delay = parseInt(document.getElementById('delay-input')?.value) || 2000;

    if (!subject || !body) {
        alert('Please fill in both subject and body');
        return;
    }

    // Load recipients for selection
    const recipients = await fetch(`${API_BASE}/api/recipients`).then(r => r.json());

    if (recipients.length === 0) {
        alert('Please add at least one recipient');
        return;
    }

    // Show recipient selection dialog
    const selectedRecipients = await showRecipientSelection(recipients);
    if (!selectedRecipients || selectedRecipients.length === 0) {
        return; // User cancelled or selected none
    }

    if (!confirm(`Send email to ${selectedRecipients.length} selected recipient(s)?`)) return;

    // Show progress
    const progressSection = document.getElementById('progress-section');
    if (progressSection) {
        progressSection.classList.remove('hidden');
    }

    const sendBtn = document.getElementById('send-btn');
    if (sendBtn) {
        sendBtn.disabled = true;
    }

    try {
        if (typeof chrome !== 'undefined' && chrome.identity && chrome.identity.getAuthToken) {
            // --- CLIENT-SIDE EXTENSION SENDING ---
            const token = await new Promise((resolve, reject) => {
                chrome.identity.getAuthToken({ interactive: true }, (t) => {
                    if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                    else resolve(t);
                });
            });

            // Get user email
            const userInfo = await new Promise(resolve => {
                chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, info => resolve(info));
            });
            const senderEmail = userInfo.email || 'me';

            let sent = 0;
            let failed = 0;
            let errors = [];

            for (let i = 0; i < selectedRecipients.length; i++) {
                const targetEmail = selectedRecipients[i];
                const progress = Math.round(((i + 1) / selectedRecipients.length) * 100);

                if (progressSection) progressSection.classList.remove('hidden');
                const progressFill = document.getElementById('progress-fill');
                const progressText = document.getElementById('progress-text');
                if (progressFill) progressFill.style.width = `${progress}%`;
                if (progressText) progressText.textContent = `Sending to ${targetEmail} (${i + 1}/${selectedRecipients.length})...`;

                try {
                    const rawMessage = createRawEmail(targetEmail, subject, body, senderEmail);
                    const res = await fetch("https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ raw: rawMessage })
                    });

                    if (!res.ok) throw new Error(`Gmail API error: ${res.statusText}`);

                    sent++;
                    // Update record via API bridge (which saves to chrome.storage.local)
                    await fetch(`${API_BASE}/api/sent-emails-internal`, {
                        method: 'POST',
                        body: JSON.stringify({
                            recipientEmail: targetEmail,
                            subject,
                            body,
                            status: 'sent',
                            sentAt: new Date().toISOString()
                        })
                    });
                } catch (err) {
                    failed++;
                    errors.push({ email: targetEmail, error: err.message });
                    await fetch(`${API_BASE}/api/sent-emails-internal`, {
                        method: 'POST',
                        body: JSON.stringify({
                            recipientEmail: targetEmail,
                            subject,
                            body,
                            status: 'failed',
                            error: err.message,
                            sentAt: new Date().toISOString()
                        })
                    });
                }

                if (i < selectedRecipients.length - 1 && delay) {
                    await new Promise(r => setTimeout(r, delay));
                }
            }

            // Mock results for consistency
            const results = { total: selectedRecipients.length, sent, failed, errors, senderEmail };
            // Update UI
            await loadRecipients();
            updateStats();
            displayResults(results);
            switchSection('record');

        } else {
            // --- SERVER-SIDE SENDING ---
            const response = await fetch(`${API_BASE}/api/send-emails`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject,
                    body,
                    delay,
                    selectedRecipients: selectedRecipients
                })
            });

            const results = await response.json();
            await loadRecipients();
            updateStats();
            displayResults(results);
            switchSection('record');
        }
    } catch (error) {
        console.error('Failed to send emails:', error);
        alert('Failed to send emails. Please check console for details.');
    } finally {
        if (progressSection) {
            progressSection.classList.add('hidden');
        }
        if (sendBtn) {
            sendBtn.disabled = false;
        }
    }
}

// Show recipient selection dialog
function showRecipientSelection(recipients) {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'recipient-selection-dialog';
        dialog.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;';

        const dialogContent = document.createElement('div');
        dialogContent.className = 'dialog-content';
        dialogContent.style.cssText = 'background: white; padding: 2rem; border-radius: 8px; max-width: 600px; max-height: 80vh; overflow-y: auto;';

        dialogContent.innerHTML = `
            <h3>Select Recipients</h3>
            <div class="recipient-selection-list" style="max-height: 400px; overflow-y: auto; margin: 1rem 0;">
                ${recipients.map(r => `
                    <label class="recipient-checkbox" style="display: block; padding: 0.5rem; border-bottom: 1px solid #eee;">
                        <input type="checkbox" value="${r.email}" ${r.status === 'pending' ? 'checked' : ''} style="margin-right: 0.5rem;">
                        <span>${r.email}</span>
                        <span class="status-badge status-${r.status || 'pending'}" style="float: right; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">${r.status || 'pending'}</span>
                    </label>
                `).join('')}
            </div>
            <div class="dialog-actions" style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                <button class="btn btn-secondary cancel-btn">Cancel</button>
                <button class="btn btn-primary select-btn">Select</button>
            </div>
        `;

        dialog.appendChild(dialogContent);
        document.body.appendChild(dialog);

        // Handle cancel
        dialogContent.querySelector('.cancel-btn').addEventListener('click', () => {
            dialog.remove();
            resolve([]);
        });

        // Handle select
        dialogContent.querySelector('.select-btn').addEventListener('click', () => {
            const selected = Array.from(dialogContent.querySelectorAll('input[type=checkbox]:checked')).map(cb => cb.value);
            dialog.remove();
            resolve(selected);
        });
    });
}

// Display results
function displayResults(results) {
    const resultsSection = document.getElementById('results-section');
    const resultsContent = document.getElementById('results-content');

    if (!resultsSection || !resultsContent) return;

    resultsContent.innerHTML = `
        <div class="results-summary">
            <h3>Summary</h3>
            <p><strong>Total:</strong> ${results.total}</p>
            <p><strong>Sent:</strong> ${results.sent}</p>
            <p><strong>Failed:</strong> ${results.failed}</p>
            ${results.senderEmail ? `<p><strong>From:</strong> ${results.senderEmail}</p>` : ''}
        </div>
        ${results.errors && results.errors.length > 0 ? `
            <div class="errors-list">
                <h3>Errors</h3>
                <ul>
                    ${results.errors.map(e => `<li>${e.email}: ${e.error}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
    `;

    resultsSection.classList.remove('hidden');
}

// Update stats
async function updateStats() {
    try {
        const response = await fetch(`${API_BASE}/api/stats`);
        const stats = await response.json();

        const totalEl = document.getElementById('total-recipients');
        const sentEl = document.getElementById('sent-count');
        const pendingEl = document.getElementById('pending-count');
        const failedEl = document.getElementById('failed-count');

        if (totalEl) totalEl.textContent = stats.total || 0;
        if (sentEl) sentEl.textContent = stats.sent || 0;
        if (pendingEl) pendingEl.textContent = stats.pending || 0;
        if (failedEl) failedEl.textContent = stats.failed || 0;
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Save schedule
async function saveSchedule() {
    const enabled = document.getElementById('enable-schedule')?.checked;
    const date = document.getElementById('schedule-date')?.value;
    const time = document.getElementById('schedule-time')?.value;
    const subject = document.getElementById('schedule-subject')?.value;
    const body = document.getElementById('schedule-body')?.value;

    if (!enabled) {
        alert('Please enable scheduled sending first');
        return;
    }

    if (!date || !time) {
        alert('Please select both date and time');
        return;
    }

    if (!subject || !body) {
        alert('Please fill in both subject and body');
        return;
    }

    // Load recipients for selection
    const recipients = await fetch(`${API_BASE}/api/recipients`).then(r => r.json());

    if (recipients.length === 0) {
        alert('Please add at least one recipient');
        return;
    }

    // Show recipient selection dialog
    const selectedRecipients = await showRecipientSelection(recipients);
    if (!selectedRecipients || selectedRecipients.length === 0) {
        return; // User cancelled or selected none
    }

    try {
        const response = await fetch(`${API_BASE}/api/schedule`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date,
                time,
                subject,
                body,
                selectedRecipients
            })
        });

        const data = await response.json();

        if (data.success) {
            const scheduleStatus = document.getElementById('schedule-status');
            if (scheduleStatus) {
                scheduleStatus.textContent = `Scheduled for ${date} at ${time} to ${selectedRecipients.length} recipient(s)`;
                scheduleStatus.classList.remove('hidden');
            }
            alert('Schedule saved successfully!');
            loadSchedules();
        }
    } catch (error) {
        console.error('Failed to save schedule:', error);
        alert('Failed to save schedule');
    }
}

// Built-in templates data (shared reference)
const BUILTIN_TEMPLATES = {
    1: {
        subject: 'Professional Greeting',
        body: '<p>Dear [Name],</p><p>I hope this email finds you well.</p><p>Best regards,<br>Your Team</p>'
    },
    2: {
        subject: 'Newsletter Update',
        body: '<h2>Newsletter</h2><p>Here are the latest updates...</p>'
    },
    3: {
        subject: 'Special Promotion',
        body: '<h2>Special Offer!</h2><p>Don\'t miss out on this amazing opportunity...</p>'
    }
};

window.loadTemplate = function (templateNum) {
    const template = BUILTIN_TEMPLATES[templateNum];
    if (template) {
        const subjectInput = document.getElementById('subject-input');
        const bodyInput = document.getElementById('body-input');

        if (subjectInput) subjectInput.value = template.subject;
        if (bodyInput) bodyInput.value = template.body;

        // Switch to send section
        switchSection('send');
        document.querySelector('.menu-item[data-section="send"]')?.classList.add('active');
        document.querySelector('.menu-item[data-section="template"]')?.classList.remove('active');
    }
}

// Load selected template directly into the Send section's subject/body
async function loadTemplateIntoSend() {
    const select = document.getElementById('send-template-select');
    if (!select || !select.value) {
        alert('Please select a template first');
        return;
    }

    const value = select.value;

    if (value.startsWith('builtin-')) {
        // Built-in template
        const num = parseInt(value.replace('builtin-', ''));
        const template = BUILTIN_TEMPLATES[num];
        if (template) {
            const subjectInput = document.getElementById('subject-input');
            const bodyInput = document.getElementById('body-input');
            if (subjectInput) subjectInput.value = template.subject;
            if (bodyInput) bodyInput.value = template.body;
        }
    } else {
        // Saved template (ID stored as value)
        try {
            const response = await fetch(`${API_BASE}/api/templates`);
            const templates = await response.json();
            const template = templates.find(t => t.id === parseInt(value));
            if (template) {
                const subjectInput = document.getElementById('subject-input');
                const bodyInput = document.getElementById('body-input');
                if (subjectInput) subjectInput.value = template.subject;
                if (bodyInput) bodyInput.value = template.body;
            }
        } catch (error) {
            console.error('Failed to load template:', error);
            alert('Failed to load template');
        }
    }

    // Reset dropdown
    select.value = '';
    alert('Template loaded into compose area!');
}

// Save template (Handles both Create and Update)
async function saveTemplate() {
    const saveBtn = document.getElementById('save-template-btn');
    const editId = saveBtn?.dataset.editId;

    if (editId) {
        return await updateTemplate(editId);
    }

    const name = document.getElementById('template-name')?.value;
    const subject = document.getElementById('template-subject')?.value;
    const body = document.getElementById('template-body')?.value;

    if (!name || !subject || !body) {
        alert('Please fill in all template fields');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/templates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, subject, body })
        });
        const data = await response.json();
        if (data.success) {
            alert('Template saved successfully!');
            clearTemplate();
            loadTemplates();
        }
    } catch (error) {
        console.error('Failed to save template:', error);
        alert('Failed to save template');
    }
}

// Load templates
async function loadTemplates() {
    try {
        const response = await fetch(`${API_BASE}/api/templates`);
        let templates = await response.json();

        if (!Array.isArray(templates)) {
            console.warn('Templates is not an array:', templates);
            templates = [];
        }

        const templatesGrid = document.querySelector('.templates-grid');
        if (templatesGrid) {
            // Clear existing custom templates (keep predefined ones)
            const existingCustom = templatesGrid.querySelectorAll('.template-card.custom');
            existingCustom.forEach(card => card.remove());

            // Add saved templates
            templates.filter(t => t && typeof t === 'object').forEach(template => {
                const templateCard = document.createElement('div');
                templateCard.className = 'template-card custom';
                templateCard.innerHTML = `
                    <h3>${template.name || 'Unnamed'}</h3>
                    <p>${template.subject || '(No Subject)'}</p>
                    <div class="template-actions">
                        <button class="btn btn-secondary" data-action="use-template" data-id="${template.id}">Use Template</button>
                        <button class="btn btn-secondary" data-action="edit-template" data-id="${template.id}">Edit</button>
                        <button class="btn btn-danger" data-action="delete-template" data-id="${template.id}">Delete</button>
                    </div>
                `;
                templatesGrid.appendChild(templateCard);
            });
        }

        // Also update the template dropdown in the Send section
        const sendSelect = document.getElementById('send-template-select');
        if (sendSelect) {
            // Remove previously added saved template options
            const savedOptions = sendSelect.querySelectorAll('option.saved-template-option');
            savedOptions.forEach(opt => opt.remove());

            // Add saved templates as options
            templates.filter(t => t && typeof t === 'object').forEach(template => {
                const option = document.createElement('option');
                option.value = template.id;
                option.className = 'saved-template-option';
                option.textContent = `💾 ${template.name || 'Unnamed'} – ${template.subject || '(No Subject)'}`;
                sendSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load templates error:', error);
    }
}

// Make functions global for onclick handlers
window.useTemplate = async function (templateId) {
    try {
        const response = await fetch(`${API_BASE}/api/templates`);
        const templates = await response.json();
        const template = templates.find(t => t.id === templateId);

        if (template) {
            const subjectInput = document.getElementById('subject-input');
            const bodyInput = document.getElementById('body-input');

            if (subjectInput) subjectInput.value = template.subject;
            if (bodyInput) bodyInput.value = template.body;

            // Switch to send section
            switchSection('send');
            document.querySelector('.menu-item[data-section="send"]')?.classList.add('active');
            document.querySelector('.menu-item[data-section="template"]')?.classList.remove('active');
        }
    } catch (error) {
        console.error('Failed to load template:', error);
    }
}

window.editTemplate = async function (templateId) {
    try {
        const response = await fetch(`${API_BASE}/api/templates`);
        const templates = await response.json();
        const template = templates.find(t => t.id === templateId);

        if (template) {
            const nameInput = document.getElementById('template-name');
            const subjectInput = document.getElementById('template-subject');
            const bodyInput = document.getElementById('template-body');

            if (nameInput) nameInput.value = template.name;
            if (subjectInput) subjectInput.value = template.subject;
            if (bodyInput) bodyInput.value = template.body;

            // Update save button UI to edit mode
            const saveBtn = document.getElementById('save-template-btn');
            if (saveBtn) {
                saveBtn.dataset.editId = templateId;
                saveBtn.textContent = 'Update Template';
            }
        }
    } catch (error) {
        console.error('Failed to load template for editing:', error);
    }
}

// Update template
async function updateTemplate(templateId) {
    const name = document.getElementById('template-name')?.value;
    const subject = document.getElementById('template-subject')?.value;
    const body = document.getElementById('template-body')?.value;

    if (!name || !subject || !body) {
        alert('Please fill in all template fields');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/templates/${templateId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, subject, body })
        });

        const data = await response.json();

        if (data.success) {
            alert('Template updated successfully!');
            clearTemplate();
            loadTemplates();

            // Reset save button
            const saveBtn = document.getElementById('save-template-btn');
            if (saveBtn) {
                saveBtn.dataset.editId = '';
                saveBtn.textContent = 'Save Template';
            }
        }
    } catch (error) {
        console.error('Failed to update template:', error);
        alert('Failed to update template');
    }
}

window.deleteTemplate = async function (templateId) {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
        const response = await fetch(`${API_BASE}/api/templates/${templateId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            alert('Template deleted successfully!');
            loadTemplates();
        }
    } catch (error) {
        console.error('Failed to delete template:', error);
        alert('Failed to delete template');
    }
}

// Clear template
function clearTemplate() {
    const nameInput = document.getElementById('template-name');
    const subjectInput = document.getElementById('template-subject');
    const bodyInput = document.getElementById('template-body');

    if (nameInput) nameInput.value = '';
    if (subjectInput) subjectInput.value = '';
    if (bodyInput) bodyInput.value = '';
}

// Save data
// Save all data (triggers server-side persistence)
async function saveData() {
    try {
        // Since the backend already saves on every change, we can just fetch status or give feedback
        const response = await fetch(`${API_BASE}/api/stats`);
        if (response.ok) {
            alert('All data (Recipients, Templates, and History) has been permanently saved to the server database (data.json).');
        }
    } catch (error) {
        console.error('Failed to verify save:', error);
        alert('Data is auto-saved on every change!');
    }
}

// Export all data for backup
async function exportAllData() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        try {
            const data = await new Promise(resolve => chrome.storage.local.get(null, resolve));
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fire-mail-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error('Failed to export data:', error);
            alert('Failed to export data');
        }
    } else {
        window.location.href = `${API_BASE}/api/export-data`;
    }
}

// View sent data
async function viewSentData() {
    await loadSentEmails();
}

// Load sent emails
async function loadSentEmails() {
    try {
        const response = await fetch(`${API_BASE}/api/sent-emails?_t=${Date.now()}`);
        let sentEmails = await response.json();

        if (!Array.isArray(sentEmails)) {
            console.warn('Sent emails is not an array:', sentEmails);
            sentEmails = [];
        }

        const sentDataContent = document.getElementById('sent-data-content');
        if (!sentDataContent) return;

        const validEmails = sentEmails.filter(e => e && typeof e === 'object');

        if (validEmails.length === 0) {
            sentDataContent.innerHTML = '<p class="empty-state">No sent data available</p>';
            return;
        }

        // Group by status
        const successful = validEmails.filter(e => e.status === 'sent');
        const failed = validEmails.filter(e => e.status === 'failed');

        sentDataContent.innerHTML = `
            <div class="sent-emails-summary">
                <div class="summary-card success">
                    <h4>✅ Successfully Sent</h4>
                    <p class="count">${successful.length}</p>
                </div>
                <div class="summary-card failed">
                    <h4>❌ Failed</h4>
                    <p class="count">${failed.length}</p>
                </div>
            </div>
            <div class="sent-emails-table">
                <table>
                    <thead>
                        <tr>
                            <th>Recipient</th>
                            <th>Subject</th>
                            <th>Status</th>
                            <th>Sent At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${validEmails.map(email => `
                            <tr class="email-row status-${email.status || 'unknown'}">
                                <td>${email.recipientEmail || 'Unknown'}</td>
                                <td>${email.subject || '(No Subject)'}</td>
                                <td>
                                    <span class="status-badge status-${email.status || 'unknown'}">
                                        ${email.status === 'sent' ? '✅ Sent' : '❌ Failed'}
                                    </span>
                                </td>
                                <td>${email.sentAt ? new Date(email.sentAt).toLocaleString() : 'Date unknown'}</td>
                                <td>
                                    <div class="row-actions">
                                        <button class="btn btn-small" data-action="view-email" data-id="${email.id}" title="View email details">👁️</button>
                                        <button class="btn btn-small btn-danger" data-action="delete-email" data-id="${email.id}" title="Remove from history">🗑️</button>
                                        ${email.status === 'failed' ? `<button class="btn btn-small" data-action="fix-status" data-email="${email.recipientEmail}" title="Fix and retry">✏️</button>` : ''}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Failed to load sent emails error:', error);
        const sentDataContent = document.getElementById('sent-data-content');
        if (sentDataContent) {
            sentDataContent.innerHTML = '<p class="empty-state">Failed to load sent data</p>';
        }
    }
}

// View email details in a modal
window.viewEmailDetails = async function (emailId) {
    try {
        const response = await fetch(`${API_BASE}/api/sent-emails`);
        const sentEmails = await response.json();
        const email = sentEmails.find(e => e.id.toString() === emailId.toString());

        if (!email) {
            alert('Email details not found');
            return;
        }

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10001; display: flex; align-items: center; justify-content: center;';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = 'background: white; padding: 2rem; border-radius: 15px; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.5);';

        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                <h2 style="margin:0; color: #ff6b35;">Email Details</h2>
                <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">✕</button>
            </div>
            <div style="display: grid; gap: 1rem; text-align: left;">
                <p><strong>To:</strong> ${email.recipientEmail}</p>
                <p><strong>From:</strong> ${email.senderEmail || 'Your Account'}</p>
                <p><strong>Sent At:</strong> ${new Date(email.sentAt).toLocaleString()}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${email.status}">${email.status === 'sent' ? '✅ Sent' : '❌ Failed'}</span></p>
                ${email.error ? `<p style="color: #dc3545;"><strong>Error:</strong> ${email.error}</p>` : ''}
                <hr style="border: 0; border-top: 1px solid #eee; margin: 1rem 0;">
                <p><strong>Subject:</strong> ${email.subject}</p>
                <div style="border: 1px solid #eee; border-radius: 8px; padding: 1rem; background: #fdfdfd; max-height: 400px; overflow-y: auto;">
                    ${email.body.replace(/\n/g, '<br>')}
                </div>
            </div>
            <div style="text-align: right; margin-top: 1.5rem;">
                <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary">Close</button>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

    } catch (error) {
        console.error('Failed to view email details:', error);
        alert('Failed to load email details');
    }
}

// Delete individual sent record
window.deleteSentEmailRecord = async function (id) {
    if (!confirm('Are you sure you want to remove this record from history?')) return;

    try {
        const response = await fetch(`${API_BASE}/api/sent-emails/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        if (data.success) {
            await loadSentEmails();
            updateStats();
        } else {
            alert('Failed to remove record');
        }
    } catch (error) {
        console.error('Failed to delete sent email:', error);
        alert('Failed to remove record');
    }
}

// Clear all history
async function clearAllSentHistory() {
    if (!confirm('Are you sure you want to clear the ENTIRE sent email history? This cannot be undone.')) return;

    try {
        const response = await fetch(`${API_BASE}/api/sent-emails`, {
            method: 'DELETE'
        });

        const data = await response.json();
        if (data.success) {
            await loadSentEmails();
            updateStats();
            alert('All history cleared successfully!');
        }
    } catch (error) {
        console.error('Failed to clear history:', error);
        alert('Failed to clear history');
    }
}

// Edit record status (usually to retry a failed email)
window.editRecordStatus = async function (email, newStatus) {
    let targetEmail = email;

    if (newStatus === 'pending') {
        const fixEmail = confirm(`Fix email address "${email}" before retrying?`);
        if (fixEmail) {
            const freshEmail = prompt("Enter corrected email address:", email);
            if (!freshEmail || !freshEmail.includes('@')) {
                if (freshEmail !== null) alert('Invalid email address.');
                return;
            }
            targetEmail = freshEmail.trim();
        }
    }

    try {
        const response = await fetch(`${API_BASE}/api/recipients/${encodeURIComponent(email)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, newEmail: targetEmail })
        });

        const data = await response.json();

        if (data.success) {
            alert(newStatus === 'pending' ? 'Record moved back to pending and ready for retry!' : 'Record updated successfully!');
            await loadRecipients();
            await loadSentEmails();
            updateStats();
        }
    } catch (error) {
        console.error('Failed to update record:', error);
        alert('Failed to update record');
    }
}

// Load schedules
async function loadSchedules() {
    try {
        const response = await fetch(`${API_BASE}/api/schedule`);
        let schedules = await response.json();

        // Ensure schedules is an array
        if (!Array.isArray(schedules)) {
            console.warn('Schedules is not an array:', schedules);
            schedules = [];
        }

        // Display schedules if there's a container
        const scheduleList = document.getElementById('schedule-list');
        if (scheduleList) {
            const validSchedules = schedules.filter(s => s && typeof s === 'object');

            if (validSchedules.length === 0) {
                scheduleList.innerHTML = '<p class="empty-state">No scheduled emails</p>';
            } else {
                scheduleList.innerHTML = validSchedules.map(schedule => `
                    <div class="schedule-item">
                        <div class="schedule-info">
                            <h4>${schedule.subject || '(No Subject)'}</h4>
                            <p>Scheduled for: ${schedule.scheduledAt ? new Date(schedule.scheduledAt).toLocaleString() : 'Not set'}</p>
                            <p>Status: <span class="status-badge status-${schedule.status || 'pending'}">${schedule.status || 'pending'}</span></p>
                            <p>Recipients: ${schedule.selectedRecipients ? schedule.selectedRecipients.length : 0}</p>
                        </div>
                        <button class="btn btn-danger btn-small" data-action="delete-schedule" data-id="${schedule.id}">Delete</button>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Failed to load schedules error:', error);
    }
}

window.deleteSchedule = async function (scheduleId) {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
        const response = await fetch(`${API_BASE}/api/schedule/${scheduleId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            alert('Schedule deleted successfully!');
            loadSchedules();
        }
    } catch (error) {
        console.error('Failed to delete schedule:', error);
        alert('Failed to delete schedule');
    }
}

// Exit project
function exitProject() {
    if (confirm('Are you sure you want to close the project? This will log you out.')) {
        logout();
    }
}

// Logout
function logout() {
    console.log('[Logout] Starting logout process...');
    chrome.identity.getAuthToken({ 'interactive': false }, function (current_token) {
        if (!chrome.runtime.lastError && current_token) {
            // Revoke the token on Google's servers to force the account chooser next time
            fetch('https://accounts.google.com/o/oauth2/revoke?token=' + current_token)
                .then(() => {
                    console.log('[Logout] Token revoked at Google');
                    chrome.identity.removeCachedAuthToken({ token: current_token }, function () {
                        console.log('[Logout] Token removed from cache');
                        window.location.href = 'index.html?logout=true';
                    });
                })
                .catch(err => {
                    console.error('[Logout] Revoke failed', err);
                    // Fallback to just clearing cache
                    chrome.identity.removeCachedAuthToken({ token: current_token }, function () {
                        window.location.href = 'index.html?logout=true';
                    });
                });
        } else {
            console.log('[Logout] No active token found in cache');
            window.location.href = 'index.html?logout=true';
        }
    });
}

// Global scope for onclick handlers
window.loadTemplate = loadTemplate;
window.useTemplate = useTemplate;
window.editTemplate = editTemplate;
window.viewSentData = viewSentData;
window.loadSentEmails = loadSentEmails;
window.viewEmailDetails = viewEmailDetails;
window.deleteSentEmailRecord = deleteSentEmailRecord;
window.clearAllSentHistory = clearAllSentHistory;
window.editRecordStatus = editRecordStatus;
window.deleteSchedule = deleteSchedule;
window.logout = logout;
window.exitProject = exitProject;

