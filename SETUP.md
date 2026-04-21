# Setup Instructions for Bulk Gmail Sender

## Step 1: Install Node.js

If you don't have Node.js installed, download it from: https://nodejs.org/

Install the LTS (Long Term Support) version.

## Step 2: Install Dependencies

Open a terminal in this directory and run:

```bash
npm install
```

This will install all required packages:
- express (web server)
- googleapis (Gmail API)
- multer (file uploads)
- csv-parser (CSV parsing)
- Other dependencies

## Step 3: Set Up Google Cloud Project

### 3.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Bulk Gmail Sender"
4. Click "Create"

### 3.2 Enable Gmail API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click on it and press "Enable"

### 3.3 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" (for personal use) or "Internal" (for G Suite)
   - Fill in App name: "Bulk Gmail Sender"
   - Add your email as user support email
   - Add your email as developer contact
   - Click "Save and Continue" through all steps
4. Back to credentials:
   - Select application type: "Web application"
   - Name: "Bulk Gmail Sender Client"
   - Authorized redirect URIs: 
     ```
     http://localhost:3000/oauth2callback
     ```
   - Click "Create"
5. **Copy your Client ID and Client Secret**

### 3.4 Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Open `.env` and replace with your credentials:
   ```
   CLIENT_ID=paste_your_client_id_here
   CLIENT_SECRET=paste_your_client_secret_here
   REDIRECT_URI=http://localhost:3000/oauth2callback
   PORT=3000
   ```

## Step 4: Run the Application

Start the server:

```bash
npm start
```

Or for development (auto-restart on changes):

```bash
npm run dev
```

## Step 5: Access the Application

1. Open your browser and go to: http://localhost:3000
2. Click "Connect Gmail Account"
3. Sign in with your Google account
4. Grant permissions for sending emails
5. You'll be redirected back to the app

## Step 6: Start Sending

1. **Add Recipients:**
   - Method 1: Type emails manually (one per line or comma-separated)
   - Method 2: Click "Upload CSV" and select `sample_recipients.csv` to test
   
2. **Compose Email:**
   - Enter subject
   - Write email body (HTML is supported)
   - Set delay (recommended: 2000ms)

3. **Send:**
   - Click "Send Emails"
   - Monitor progress in real-time
   - Check results when complete

## Troubleshooting

### "Cannot find module" error
- Make sure you ran `npm install`
- Check that Node.js is properly installed

### "Failed to authenticate" error
- Verify your Client ID and Client Secret in `.env`
- Make sure redirect URI matches exactly
- Try clearing cookies and re-authenticating

### "Daily sending quota exceeded"
- Gmail free accounts: ~100 emails/day
- Google Workspace: ~2000 emails/day
- Wait 24 hours or use a different account

## Testing

To test without sending real emails:
1. Use the sample CSV file with fake emails (like example.com domains)
2. Start with 2-3 test emails
3. Check that emails appear in your Gmail "Sent" folder

## Next Steps

- Customize the UI in `public/styles.css`
- Add more features in `server.js`
- Deploy to production server
- Add database for persistent storage

---

Happy bulk sending! 📧

