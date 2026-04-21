# 🔐 Google OAuth 2.0 Setup Guide

Complete step-by-step instructions to create OAuth credentials for Gmail API.

---

## 📋 Prerequisites

- Google account
- Browser (Chrome, Edge, Firefox, etc.)

---

## 🚀 Step-by-Step Instructions

### STEP 1: Go to Google Cloud Console

Open your browser and visit:
**https://console.cloud.google.com/**

---

### STEP 2: Create or Select a Project

1. At the top, click on the project dropdown
2. Click **"New Project"**
3. Enter project name: `Bulk Gmail Sender`
4. Click **"Create"**
5. Wait for project creation (10-20 seconds)

OR

If you already have a project:
1. Click the project dropdown
2. Select your project

---

### STEP 3: Enable Gmail API

1. In the left sidebar, hover over **"APIs & Services"**
2. Click **"Library"** (or go directly to https://console.cloud.google.com/apis/library)
3. In the search bar, type: `Gmail API`
4. Click on **"Gmail API"**
5. Click the blue **"ENABLE"** button
6. Wait for it to enable (5-10 seconds)
7. You should see "API Enabled" with a green checkmark

---

### STEP 4: Configure OAuth Consent Screen

1. In the left sidebar, click **"OAuth consent screen"**
2. Select **"External"** (for personal use) or **"Internal"** (for G Suite)
3. Click **"CREATE"**

#### Fill in the form:

**App name:** `Bulk Gmail Sender`

**User support email:** `your-email@gmail.com` (your email)

**App logo:** (skip for now)

**Application home page:** `http://localhost:3000`

**Authorized domains:** (leave blank)

**Developer contact information:** `your-email@gmail.com` (your email)

4. Click **"SAVE AND CONTINUE"**

#### Add Scopes:

1. In the OAuth consent screen, scroll down to see the **"Scopes"** section
2. You'll see a button that says **"ADD OR REMOVE SCOPES"** (or just "SCOPES")
3. Click **"ADD OR REMOVE SCOPES"**
4. A new window/dialog will open
5. Click **"+ ADD SCOPES"** button
6. In the popup:
   - You might see some scopes already added
   - If you need to add manually, look for the search/filter area
7. Search for: `gmail.send` OR manually add:
   - Type or paste: `https://www.googleapis.com/auth/gmail.send`
   - Type or paste: `https://www.googleapis.com/auth/gmail.compose`
8. Click **"ADD TO TABLE"** for each one
9. You should now see both scopes in your list
10. Click **"UPDATE"** at the bottom
11. You'll be back on the OAuth consent screen
12. Click **"SAVE AND CONTINUE"**

#### Add Test Users (Important!):

1. Click **"ADD USERS"**
2. Enter: `your-email@gmail.com` (your Gmail address)
3. Click **"ADD"**
4. Click **"SAVE AND CONTINUE"**

#### Summary:
1. Review everything
2. Click **"BACK TO DASHBOARD"**

---

### STEP 5: Create OAuth 2.0 Credentials

1. In the left sidebar, click **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** (at the top)
3. Select **"OAuth client ID"**

If you see a warning about OAuth consent screen:
- Click **"CONFIGURE CONSENT SCREEN"**
- You already did this in STEP 4, so just click **"SAVE AND CONTINUE"** through all steps

4. **Application type:** Select **"Web application"**

5. **Name:** `Bulk Gmail Sender Client`

6. **Authorized JavaScript origins:** (leave blank for localhost)

7. **Authorized redirect URIs:** Click **"+ ADD URI"** and enter:
   ```
   http://localhost:3000/oauth2callback
   ```

8. Click **"CREATE"**

---

### STEP 6: Copy Your Credentials

You will see a popup with your credentials:

**OAuth Client:**
```
Your Client ID
123456789-abcdefghijklmnop.apps.googleusercontent.com

Your Client Secret
GOCSPX-abcdefghijklmnopqrstuvwxyz123456
```

⚠️ **IMPORTANT:** Copy these NOW! You won't be able to see the Client Secret again later.

Copy both to a safe place temporarily.

---

### STEP 7: Add Credentials to Your App

Now open your `.env` file:

1. Open in Notepad:
   ```powershell
   notepad .env
   ```

2. Replace the placeholder values:
   ```
   CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
   CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz123456
   REDIRECT_URI=http://localhost:3000/oauth2callback
   PORT=3000
   ```

3. Save and close (Ctrl+S, then close)

---

### STEP 8: Verify Setup

Now you can start your app:

```powershell
npm start
```

Then open: **http://localhost:3000**

You should be able to click "Connect Gmail Account" and authenticate!

---

## 🎯 Quick Checklist

✅ Created Google Cloud Project
✅ Enabled Gmail API
✅ Configured OAuth Consent Screen
✅ Created OAuth 2.0 Client ID
✅ Added redirect URI: http://localhost:3000/oauth2callback
✅ Copied Client ID and Client Secret
✅ Added credentials to .env file
✅ Started the app

---

## ❌ Troubleshooting

### Problem: "Redirect URI mismatch"

**Solution:** Make sure the redirect URI in Google Cloud Console is EXACTLY:
```
http://localhost:3000/oauth2callback
```
(No trailing slash, no https, exact case)

---

### Problem: "Access blocked: This app's request is invalid"

**Solution:** Make sure you added yourself as a test user in OAuth consent screen (STEP 4).

---

### Problem: "Error 403: access_denied"

**Solution:** 
1. Make sure Gmail API is enabled
2. Make sure you granted the correct permissions
3. Try clearing browser cache

---

### Problem: Can't find "APIs & Services"

**Solution:** You need to switch to the correct project. Check the project dropdown at the top.

---

## 🔒 Security Notes

- Keep your Client Secret private
- Never commit .env file to version control
- Use different credentials for production
- The Client ID can be public
- The Client Secret must remain private

---

## 📸 Visual Guide Locations

After completing these steps, here's what you should see:

**After STEP 3 (Enable API):**
- ✅ Gmail API is enabled
- Green checkmark next to Gmail API

**After STEP 4 (OAuth Consent):**
- OAuth consent screen configured
- Scopes added
- Test user added

**After STEP 5 (Create Credentials):**
- OAuth 2.0 Client ID created
- Credentials shown in popup

**After STEP 7 (Add to .env):**
- .env file contains your credentials

**After STEP 8 (Run App):**
- Server starts successfully
- Browser opens to http://localhost:3000
- Can click "Connect Gmail Account"

---

## ✅ Success Indicators

You know it's working when:

1. ✅ npm start runs without errors
2. ✅ Browser shows the app interface
3. ✅ "Connect Gmail Account" button is visible
4. ✅ Clicking it redirects to Google login
5. ✅ After login, you see Gmail permissions screen
6. ✅ After granting permissions, you return to the app
7. ✅ Dashboard is visible (not auth screen)

---

**Need more help? Check the main README.md or SETUP.md files.**

