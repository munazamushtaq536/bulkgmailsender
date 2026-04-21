# 🚀 Quick Start - Run the App

## Prerequisites

✅ Node.js installed (v14+)
✅ Google Cloud Project with Gmail API enabled
✅ OAuth 2.0 credentials

## Run in 4 Steps

### Step 1: Install Dependencies

Open terminal in this folder and run:

```powershell
npm install
```

This installs all required packages.

### Step 2: Get Google Credentials

You need Client ID and Client Secret from Google Cloud Console.

**Quick Setup:**
1. Go to: https://console.cloud.google.com/
2. Create new project or select existing
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3000/oauth2callback`
6. Copy Client ID and Client Secret

📝 Detailed instructions in `SETUP.md`

### Step 3: Configure Environment

```powershell
copy .env.example .env
```

Then edit `.env` file and add your credentials:

```
CLIENT_ID=your_actual_client_id_here
CLIENT_SECRET=your_actual_client_secret_here
REDIRECT_URI=http://localhost:3000/oauth2callback
PORT=3000
```

### Step 4: Run the Server

```powershell
npm start
```

You should see:
```
Server running on http://localhost:3000
```

---

## 🎯 Access the App

1. Open browser: **http://localhost:3000**
2. Click "Connect Gmail Account"
3. Sign in with Google
4. Grant permissions
5. Start sending emails!

---

## 📝 Common Commands

**Start server:**
```powershell
npm start
```

**Start with auto-reload (development):**
```powershell
npm run dev
```

**Stop server:**
Press `Ctrl+C` in terminal

---

## ❌ Troubleshooting

### "npm is not recognized"
- Install Node.js from https://nodejs.org/
- Restart terminal after installation

### "Cannot find module"
- Run `npm install` first
- Check you're in the correct directory

### "Authentication failed"
- Verify `.env` file has correct credentials
- Check redirect URI matches exactly
- Make sure Gmail API is enabled

### "Port 3000 already in use"
- Change PORT in `.env` to another number (e.g., 3001)
- Or close the app using port 3000

---

## 🧪 Testing Without Google Setup

You can run the server without Gmail API for basic testing, but sending emails won't work:

```powershell
npm start
```

This will start the web interface, but authentication will fail. For full functionality, complete the Google Cloud setup.

---

## 📚 More Help

- `SETUP.md` - Detailed setup instructions
- `README.md` - Full documentation
- `FUNCTIONALITIES_AND_WORKFLOW.md` - Feature details
- `PROJECT_OVERVIEW.md` - Technical overview

---

**Ready to send? Run `npm start` and open http://localhost:3000! 🚀**

