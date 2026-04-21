# 🏃 How to Run the Bulk Gmail Sender App

## ⚡ Quick Commands

### First Time Setup (Do this once):

```powershell
# 1. Install Node.js if you haven't already
#    Download from: https://nodejs.org/

# 2. Install dependencies
npm install

# 3. Copy environment file
copy .env.example .env

# 4. Edit .env file with your Google credentials
notepad .env
# (Add your CLIENT_ID and CLIENT_SECRET)

# 5. Start the server
npm start
```

### Run the App (Every time):

```powershell
npm start
```

Then open your browser to: **http://localhost:3000**

---

## 📋 Step-by-Step Instructions

### 1️⃣ Check Node.js Installation

```powershell
node --version
npm --version
```

If you get "command not found", install Node.js from https://nodejs.org/

### 2️⃣ Install Dependencies

```powershell
npm install
```

This downloads all required packages.

### 3️⃣ Setup Google Credentials

**Option A: Using Google Cloud Console** (Recommended)
- Follow instructions in `SETUP.md`
- Get Client ID and Client Secret

**Option B: Quick Test** (Development Only)
- Skip Google setup for now
- App will run but authentication won't work
- Good for testing UI only

### 4️⃣ Configure Environment

```powershell
# Copy example file
copy .env.example .env

# Edit with your credentials
notepad .env
```

Your `.env` should look like:

```
CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
REDIRECT_URI=http://localhost:3000/oauth2callback
PORT=3000
```

### 5️⃣ Start the Server

```powershell
npm start
```

You should see:
```
Server running on http://localhost:3000
```

### 6️⃣ Access the Web Interface

1. Open browser
2. Go to: `http://localhost:3000`
3. You'll see the app interface

---

## 🎮 Alternative: Development Mode

For auto-reload on file changes:

```powershell
npm run dev
```

This uses nodemon to auto-restart when you edit files.

---

## 🛠️ Troubleshooting

### Problem: "npm is not recognized"

**Solution:** Install Node.js
```powershell
# Check if installed
node --version

# If not, download from:
# https://nodejs.org/
```

### Problem: "Cannot find module"

**Solution:** Install dependencies
```powershell
npm install
```

### Problem: "Port 3000 already in use"

**Solution:** Change port
```powershell
# Edit .env file
notepad .env

# Change PORT=3000 to PORT=3001

# Then access at http://localhost:3001
```

### Problem: "Authentication failed"

**Solution:** Check Google credentials
```powershell
# Verify .env file has correct values
notepad .env

# Make sure:
# - CLIENT_ID is correct
# - CLIENT_SECRET is correct  
# - REDIRECT_URI matches exactly
```

### Problem: Server won't start

**Solution:** Check for errors
```powershell
# Look at the error message
# Common issues:
# - Missing .env file → copy .env.example
# - Wrong credentials → verify in Google Cloud
# - Port in use → change PORT in .env
```

---

## 📂 Project Structure

```
Bulk Gmail Sender/
├── server.js              # Backend server
├── package.json           # Dependencies
├── .env                   # Configuration (create this)
├── public/                # Frontend files
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── uploads/               # CSV uploads (auto-created)
```

---

## ✅ Checklist Before Running

- [ ] Node.js installed (`node --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] .env file created (copy from .env.example)
- [ ] Google credentials added to .env
- [ ] Gmail API enabled in Google Cloud
- [ ] Ready to run!

---

## 🚀 One-Line Summary

```powershell
npm install && copy .env.example .env && npm start
```

Then open **http://localhost:3000**

---

## 📞 Need Help?

- Detailed setup: See `SETUP.md`
- Features: See `FUNCTIONALITIES_AND_WORKFLOW.md`
- Technical info: See `PROJECT_OVERVIEW.md`
- Quick reference: See `QUICK_START.md`

---

**Happy bulk sending! 📧**

