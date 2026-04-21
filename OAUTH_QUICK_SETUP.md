# 🔐 Quick Guide: Enable OAuth for Gmail Account

## 🎯 Simple 8-Step Process

---

### STEP 1: Open Google Cloud Console
**Go to:** https://console.cloud.google.com/

**Sign in with:** `mmmushtaq526@gmail.com` (or your Google account)

---

### STEP 2: Create a New Project
1. Click the **project dropdown** at the top (shows "Select a project" or project name)
2. Click **"NEW PROJECT"**
3. **Project name:** `Bulk Gmail Sender`
4. Click **"CREATE"**
5. Wait 10-20 seconds for creation
6. Click **"SELECT"** to switch to the new project

---

### STEP 3: Enable Gmail API
1. In the left sidebar, click **"APIs & Services"**
2. Click **"Library"** (or go to: https://console.cloud.google.com/apis/library)
3. In the search box, type: **`Gmail API`**
4. Click on **"Gmail API"** from results
5. Click the big blue **"ENABLE"** button
6. Wait 5-10 seconds
7. ✅ You should see "API Enabled" with a green checkmark

---

### STEP 4: Configure OAuth Consent Screen
1. In the left sidebar, click **"OAuth consent screen"**
   - (Under "APIs & Services")
2. Select **"External"** (for personal use)
3. Click **"CREATE"**

**Fill the form:**
- **App name:** `Bulk Gmail Sender`
- **User support email:** Select `mmmushtaq526@gmail.com`
- **Application home page:** `http://localhost:3000`
- **Developer contact:** `mmmushtaq526@gmail.com`

4. Click **"SAVE AND CONTINUE"**

---

### STEP 5: Add Scopes (Gmail Permissions)
1. You'll be on the "Scopes" page
2. Click **"+ ADD OR REMOVE SCOPES"** button
3. In the popup, click **"+ ADD SCOPES"**
4. Search for: **`gmail.send`**
5. Check the box next to: **`.../auth/gmail.send`**
6. Search for: **`gmail.compose`**
7. Check the box next to: **`.../auth/gmail.compose`**
8. Click **"UPDATE"** or **"ADD TO TABLE"**
9. Click **"UPDATE"** at the bottom
10. Click **"SAVE AND CONTINUE"**

---

### STEP 6: Add Test User (IMPORTANT!)
1. Click **"+ ADD USERS"**
2. Enter: **`mmmushtaq526@gmail.com`**
3. Click **"ADD"**
4. Click **"SAVE AND CONTINUE"**
5. Click **"BACK TO DASHBOARD"**

---

### STEP 7: Create OAuth Credentials
1. In the left sidebar, click **"Credentials"**
   - (Under "APIs & Services")
2. Click **"+ CREATE CREDENTIALS"** (at the top)
3. Select **"OAuth client ID"**

**If you see a warning about OAuth consent screen:**
- Just click **"CONFIGURE CONSENT SCREEN"**
- Then click through to get back here

4. **Application type:** Select **"Web application"**
5. **Name:** `Bulk Gmail Sender Client`
6. **Authorized redirect URIs:** Click **"+ ADD URI"**
7. Enter exactly:
   ```
   http://localhost:3000/oauth2callback
   ```
   ⚠️ **IMPORTANT:** Must be EXACTLY this (no trailing slash, no https)

8. Click **"CREATE"**

---

### STEP 8: Copy Your Credentials
**A popup will appear with your credentials:**

```
Your Client ID
123456789-xxxxx.apps.googleusercontent.com
(Copy this!)

Your Client Secret
GOCSPX-xxxxxxxxxxxxx
(Copy this too!)
```

⚠️ **CRITICAL:** Copy BOTH NOW! You won't see the Client Secret again!

---

### STEP 9: Update Your .env File

1. Open PowerShell in your project folder:
   ```powershell
   cd "C:\Users\KCS\Desktop\Bulk Gmail Sender"
   notepad .env
   ```

2. Replace the values:
   ```env
   CLIENT_ID=paste_your_client_id_here
   CLIENT_SECRET=paste_your_client_secret_here
   REDIRECT_URI=http://localhost:3000/oauth2callback
   PORT=3000
   SENDER_EMAIL=mmmushtaq526@gmail.com
   ```

3. **Save** (Ctrl+S) and **close** Notepad

---

### STEP 10: Restart Your Server

1. In your terminal, press **Ctrl+C** to stop the server
2. Start it again:
   ```powershell
   $env:PATH += ";C:\Program Files\nodejs"
   npm start
   ```

---

### STEP 11: Test OAuth Connection

1. Open browser: **http://localhost:3000**
2. Click **"Connect Gmail Account"**
3. Sign in with **`mmmushtaq526@gmail.com`**
4. You'll see a permissions screen - click **"Allow"**
5. You'll be redirected back to your app
6. ✅ **Success!** You should see the dashboard

---

## ✅ Quick Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Gmail API
- [ ] Configured OAuth consent screen
- [ ] Added Gmail scopes (gmail.send, gmail.compose)
- [ ] Added test user (mmmushtaq526@gmail.com)
- [ ] Created OAuth 2.0 Client ID
- [ ] Added redirect URI: http://localhost:3000/oauth2callback
- [ ] Copied Client ID and Client Secret
- [ ] Updated .env file with credentials
- [ ] Restarted server
- [ ] Successfully connected Gmail account

---

## 🎯 Direct Links

- **Google Cloud Console:** https://console.cloud.google.com/
- **API Library:** https://console.cloud.google.com/apis/library
- **Credentials:** https://console.cloud.google.com/apis/credentials
- **OAuth Consent Screen:** https://console.cloud.google.com/apis/credentials/consent

---

## ❌ Common Issues & Fixes

### Issue: "Redirect URI mismatch"
**Fix:** Make sure redirect URI in Google Cloud is EXACTLY:
```
http://localhost:3000/oauth2callback
```
(No https, no trailing slash, exact case)

---

### Issue: "Access blocked: This app's request is invalid"
**Fix:** Make sure you added `mmmushtaq526@gmail.com` as a test user in STEP 6

---

### Issue: Can't see "APIs & Services"
**Fix:** 
- Make sure you selected the correct project
- Check the project dropdown at the top of the page

---

### Issue: "Error 403: access_denied"
**Fix:**
1. Make sure Gmail API is enabled (STEP 3)
2. Make sure you added the scopes (STEP 5)
3. Try clearing browser cache and cookies

---

## 🎉 You're Done!

Once you complete these steps, your app will be able to:
- ✅ Authenticate with Gmail
- ✅ Send emails from `mmmushtaq526@gmail.com`
- ✅ Send bulk emails to multiple recipients

**Need help? Check:** `GOOGLE_OAUTH_SETUP.md` for detailed instructions!

