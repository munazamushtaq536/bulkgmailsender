# 🚀 Quick Start Guide - Bulk Gmail Sender

## ✅ Dependencies Installed!
All npm packages have been successfully installed!

---

## ⚠️ Important: Fix PATH Issue

**Problem**: Node.js is installed but `npm` command isn't recognized because it's not in your PATH.

### Solution 1: Temporary Fix (Current Session Only)
Add Node.js to PATH for this PowerShell session:
```powershell
$env:PATH += ";C:\Program Files\nodejs"
```

Then you can use:
```powershell
cd "C:\Users\KCS\Desktop\Bulk Gmail Sender"
npm start
```

### Solution 2: Permanent Fix (Recommended)
1. Open PowerShell **as Administrator**
2. Run:
   ```powershell
   cd "C:\Users\KCS\Desktop\Bulk Gmail Sender"
   .\fix_path.ps1
   ```
3. Close and reopen your terminal
4. Now `npm` will work from anywhere!

---

## 🎯 Run the App

### Step 1: Navigate to Project Directory
```powershell
cd "C:\Users\KCS\Desktop\Bulk Gmail Sender"
```

### Step 2: Add Node.js to PATH (if not done permanently)
```powershell
$env:PATH += ";C:\Program Files\nodejs"
```

### Step 3: Configure Google OAuth Credentials
Edit `.env` file and add your Google credentials:
```env
CLIENT_ID=your_google_client_id_here
CLIENT_SECRET=your_google_client_secret_here
REDIRECT_URI=http://localhost:3000/oauth2callback
PORT=3000
SENDER_EMAIL=mmmushtaq526@gmail.com
```

**How to get Google credentials:**
1. Go to https://console.cloud.google.com/
2. Create/select a project
3. Enable Gmail API
4. Create OAuth 2.0 Client ID
5. Add redirect URI: `http://localhost:3000/oauth2callback`
6. Copy Client ID and Client Secret to `.env`

### Step 4: Start the Server
```powershell
npm start
```

You should see:
```
Server running on http://localhost:3000
```

### Step 5: Open in Browser
Go to: **http://localhost:3000**

### Step 6: Connect Gmail Account
1. Click "Connect Gmail Account"
2. Sign in with **mmmushtaq526@gmail.com**
3. Grant permissions
4. Start sending emails!

---

## 📝 All-in-One Command (After PATH Fix)

Once PATH is fixed, you can simply run:
```powershell
cd "C:\Users\KCS\Desktop\Bulk Gmail Sender"
npm start
```

---

## ✅ Setup Status

- ✅ All dependencies installed
- ✅ `.env` file created
- ✅ Server configured for `mmmushtaq526@gmail.com`
- ✅ All required files present
- ⚠️ Need to fix PATH (see above)
- ⚠️ Need to add Google OAuth credentials to `.env`

---

## 🎉 You're Almost Ready!

Just fix the PATH issue and add your Google credentials, then you can start using the app!

