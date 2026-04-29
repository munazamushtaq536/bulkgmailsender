// API Base URL
const API_BASE = '';
console.log('App.js initialized at', new Date().toLocaleTimeString());

// Check authentication on load
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('logout') === 'true') {
        console.log('[CheckAuth] Logout flag detected, staying on auth screen');
        showAuthSection();
    } else {
        checkAuth();
    }
});

// Check authentication on load
async function checkAuth() {
    if (typeof chrome !== 'undefined' && chrome.identity && chrome.identity.getAuthToken) {
        chrome.identity.getAuthToken({ interactive: false }, async function (token) {
            if (!chrome.runtime.lastError && token) {
                console.log('[Auth] Token found, fetching user email...');

                const finalize = (email) => {
                    showMainContent(email || 'Google User');
                    loadRecipients();
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
                showAuthSection();
            }
        });
    } else {
        try {
            const response = await fetch(`${API_BASE}/api/check-auth`);
            const data = await response.json();

            if (data.authenticated) {
                showMainContent(data.email);
                loadRecipients();
                updateStats();
            } else {
                showAuthSection();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            showAuthSection();
        }
    }
}

// Show auth section
function showAuthSection() {
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('main-content').classList.add('hidden');
}

// Show main content
function showMainContent(userEmail) {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');

    // Display user email if available
    if (userEmail) {
        const header = document.querySelector('header');
        const existingEmail = document.getElementById('user-email-display');
        if (!existingEmail && header) {
            const emailDisplay = document.createElement('p');
            emailDisplay.id = 'user-email-display';
            emailDisplay.className = 'user-email';
            emailDisplay.textContent = `Logged in as: ${userEmail}`;
            emailDisplay.style.cssText = 'color: #ff6b35; font-weight: 600; margin-top: 10px; font-size: 0.9rem;';
            header.appendChild(emailDisplay);
        } else if (existingEmail) {
            existingEmail.textContent = `Logged in as: ${userEmail}`;
        }
    }

    // In extension mode, directly navigate to main menu if authenticated
    window.location.href = 'main-menu.html';
}

// Auth button handler
document.getElementById('auth-btn').addEventListener('click', async () => {
    if (typeof chrome !== 'undefined' && chrome.identity && chrome.identity.getAuthToken) {
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
            if (chrome.runtime.lastError) {
                console.error('Auth failed:', chrome.runtime.lastError);
                alert("Authentication failed: " + chrome.runtime.lastError.message);
                return;
            }
            if (token) {
                // Successfully got token, proceed to main menu
                window.location.href = 'main-menu.html';
            }
        });
    } else {
        try {
            await fetch('/api/auth/google');
            window.location.href = 'main-menu.html';
        } catch (e) {
            console.error(e);
            alert("Connection attempt failed. Please check your network.");
        }
    }
});

// Add recipients
document.getElementById('add-recipients-btn').addEventListener('click', async () => {
    const input = document.getElementById('recipients-input').value;
    const emails = input.split(/[,\n]/).map(e => e.trim()).filter(e => e);

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
            document.getElementById('recipients-input').value = '';
            await loadRecipients();
            updateStats();
            alert(`Successfully added ${emails.length} recipient(s) to cloud.`);
        } else {
            console.error('API Error details:', data);
            alert(`Failed to add recipients: ${data.error || 'Unknown server error'}\n\nTip: Ensure your Supabase tables are created.`);
        }
    } catch (error) {
        console.error('Network or Extension error:', error);
        alert('Could not connect to the recipient service. Check your Vercel URL in extension-api.js or your internet connection.');
    }
});

// CSV upload
document.getElementById('csv-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('csv', file);

    try {
        const response = await fetch(`${API_BASE}/api/upload-csv`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            await loadRecipients();
            updateStats();
            alert(`Uploaded ${data.count} recipients from CSV`);
            e.target.value = '';
        } else {
            alert('Failed to upload CSV');
        }
    } catch (error) {
        console.error('CSV upload failed:', error);
        alert('Failed to upload CSV');
    }
});

// Load recipients
async function loadRecipients() {
    try {
        const response = await fetch(`${API_BASE}/api/recipients`);
        const recipients = await response.json();

        displayRecipients(recipients);
    } catch (error) {
        console.error('Failed to load recipients:', error);
    }
}

// Display recipients
function displayRecipients(recipients) {
    const list = document.getElementById('recipients-list');

    if (recipients.length === 0) {
        list.innerHTML = '<p class="empty-state">No recipients added yet</p>';
        return;
    }

    list.innerHTML = recipients.map(recipient => `
        <div class="recipient-item ${recipient.status}">
            <span class="recipient-email">${recipient.email}</span>
            <span class="recipient-status ${recipient.status}">${recipient.status}</span>
        </div>
    `).join('');
}

// Clear recipients
document.getElementById('clear-recipients-btn').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to clear all recipients?')) return;

    try {
        const response = await fetch(`${API_BASE}/api/recipients`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            await loadRecipients();
            updateStats();
            alert('Recipients cleared');
        }
    } catch (error) {
        console.error('Failed to clear recipients:', error);
        alert('Failed to clear recipients');
    }
});

// Send emails
document.getElementById('send-btn').addEventListener('click', async () => {
    const subject = document.getElementById('subject-input').value;
    const body = document.getElementById('body-input').value;
    const delay = parseInt(document.getElementById('delay-input').value) || 2000;

    if (!subject || !body) {
        alert('Please fill in both subject and body');
        return;
    }

    const recipientsList = document.getElementById('recipients-list');
    const totalRecipients = recipientsList.querySelectorAll('.recipient-item').length;

    if (totalRecipients === 0) {
        alert('Please add at least one recipient');
        return;
    }

    if (!confirm(`Send email to ${totalRecipients} recipients?`)) return;

    // Show progress
    const progressSection = document.getElementById('progress-section');
    progressSection.classList.remove('hidden');
    document.getElementById('send-btn').disabled = true;

    try {
        const response = await fetch(`${API_BASE}/api/send-emails`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, body, delay })
        });

        const results = await response.json();

        // Update recipients display
        await loadRecipients();
        updateStats();

        // Show results
        displayResults(results);

    } catch (error) {
        console.error('Failed to send emails:', error);
        alert('Failed to send emails. Please check console for details.');
    } finally {
        progressSection.classList.add('hidden');
        document.getElementById('send-btn').disabled = false;
    }
});

// Display results
function displayResults(results) {
    const resultsSection = document.getElementById('results-section');
    const resultsContent = document.getElementById('results-content');

    let html = `
        <div class="result-item success">
            <strong>✅ Successfully Sent:</strong> ${results.sent} emails
        </div>
    `;

    if (results.failed > 0) {
        html += `
            <div class="result-item error">
                <strong>❌ Failed:</strong> ${results.failed} emails
            </div>
        `;

        if (results.errors && results.errors.length > 0) {
            html += '<h3>Errors:</h3>';
            results.errors.forEach(error => {
                html += `
                    <div class="result-item error">
                        <strong>${error.email}:</strong> ${error.error}
                    </div>
                `;
            });
        }
    }

    resultsContent.innerHTML = html;
    resultsSection.classList.remove('hidden');
}

// Update stats
async function updateStats() {
    try {
        const response = await fetch(`${API_BASE}/api/stats`);
        const stats = await response.json();

        document.getElementById('total-recipients').textContent = stats.total;
        document.getElementById('sent-count').textContent = stats.sent;
        document.getElementById('pending-count').textContent = stats.pending;
        document.getElementById('failed-count').textContent = stats.failed;
    } catch (error) {
        console.error('Failed to update stats:', error);
    }
}

// Initialize
setInterval(updateStats, 5000); // Update stats every 5 seconds

