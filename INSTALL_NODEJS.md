# 🔧 How to Install Node.js and Run the App

## Current Status
❌ **Node.js is not installed** on your system, which is why `npm` is not recognized.

---

## 📥 Install Node.js

### Step 1: Download Node.js
1. Go to: **https://nodejs.org/**
2. Download the **LTS version** (Long Term Support - recommended)
   - This will be something like "Node.js v20.x.x LTS"
   - It will download a `.msi` installer file

### Step 2: Run the Installer
1. Double-click the downloaded `.msi` file
2. Follow the installation wizard:
   - ✅ **IMPORTANT**: Check the box that says **"Add to PATH"** (should be checked by default)
   - Click "Next" through all steps
   - Click "Install" and wait for installation to complete

### Step 3: Restart Your Computer
🔴 **CRITICAL**: After installing Node.js, you **MUST** restart your computer for the PATH changes to take effect.

### Step 4: Verify Installation
After restarting, open PowerShell and run:
```powershell
node --version
npm --version
```
You should see version numbers (e.g., `v20.10.0` and `10.2.3`).

---

## 🚀 After Node.js is Installed

### Step 1: Navigate to Project Directory
Open PowerShell and run:
```powershell
cd "C:\Users\KCS\Desktop\Bulk Gmail Sender"
```

### Step 2: Install Dependencies
```powershell
npm install
```
This will install all required packages listed in `package.json`.

### Step 3: Configure Google OAuth (if not done)
Edit the `.env` file and add your Google credentials:
```env
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
REDIRECT_URI=http://localhost:3000/oauth2callback
PORT=3000
SENDER_EMAIL=mmmushtaq526@gmail.com
```

### Step 4: Run the App
```powershell
npm start
```

### Step 5: Open in Browser
Go to: **http://localhost:3000**

---

## ⚡ Quick Command Summary

Once Node.js is installed and you've restarted:

```powershell
# Navigate to project
cd "C:\Users\KCS\Desktop\Bulk Gmail Sender"

# Install dependencies (one time)
npm install

# Run the app (every time)
npm start
```

---

## ❓ Troubleshooting

### "npm is not recognized" after installing
- **Solution**: Restart your computer (required after Node.js installation)
- Or close and reopen your terminal/PowerShell window

### "Cannot find package.json"
- **Solution**: Make sure you're in the correct directory:
  ```powershell
  cd "C:\Users\KCS\Desktop\Bulk Gmail Sender"
  ```

### Still having issues?
- Check if Node.js is installed: `node --version`
- If it works, npm should work too: `npm --version`
- If node works but npm doesn't, try reinstalling Node.js

---

## 📝 Note
The error you saw (`Could not read package.json`) happened because you were in the wrong directory (`C:\Users\KCS`) instead of the project directory (`C:\Users\KCS\Desktop\Bulk Gmail Sender`). Make sure to navigate to the correct folder first!

---

**After installing Node.js and restarting, come back and we'll install the dependencies! 🎉**

