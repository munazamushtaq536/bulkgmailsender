# 📧 Bulk Gmail Sender

A web-based application for sending bulk personalized emails via Gmail API. This tool allows you to send emails to multiple recipients efficiently with rate limiting and status tracking.

## ✨ Features

- 🔐 **Gmail OAuth Authentication** - Secure authentication using Google OAuth 2.0
- 👥 **Multiple Recipient Management** - Add recipients manually or upload via CSV
- ✏️ **Rich Email Composer** - HTML-supported email composition
- ⚡ **Bulk Sending** - Send emails to hundreds of recipients
- 🎛️ **Rate Limiting** - Configurable delay between emails to avoid Gmail limits
- 📊 **Real-time Stats** - Track sending progress with live statistics
- 📈 **Status Tracking** - Monitor sent, pending, and failed emails

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Project with Gmail API enabled
- Gmail API credentials (Client ID and Client Secret)

### Installation

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Google Cloud credentials**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Gmail API
   - Go to "Credentials" and create OAuth 2.0 Client ID
   - Add authorized redirect URI: `http://localhost:3000/oauth2callback`
   - Download your credentials

4. **Configure environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   ```
   CLIENT_ID=your_google_client_id_here
   CLIENT_SECRET=your_google_client_secret_here
   REDIRECT_URI=http://localhost:3000/oauth2callback
   PORT=3000
   ```

5. **Run the application**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Access the application**
   
   Open your browser and navigate to `http://localhost:3000`

## 📖 Usage Guide

### 1. Authentication

- Click "Connect Gmail Account" to authenticate with Google
- Grant permissions for sending emails
- You'll be redirected back to the application

### 2. Add Recipients

**Method 1: Manual Entry**
- Enter email addresses in the text area (one per line or comma-separated)
- Click "Add Recipients"

**Method 2: CSV Upload**
- Prepare a CSV file with a column named "email" (or any header)
- Click "Upload CSV" and select your file
- Recipients will be automatically added

### 3. Compose Email

- Enter email subject
- Write your email body (HTML is supported)
- Set delay between emails (recommended: 2000ms)

### 4. Send Emails

- Click "Send Emails" button
- Monitor progress and results
- Check the stats dashboard for sending status

## 📝 CSV Format

Your CSV file should follow this format:

```csv
email
user1@example.com
user2@example.com
user3@example.com
```

Or with additional columns:

```csv
email,name,company
user1@example.com,John Doe,Company A
user2@example.com,Jane Smith,Company B
```

## ⚙️ Configuration

### Rate Limiting

The application includes configurable delays between emails to avoid hitting Gmail API rate limits:

- **Minimum**: 1000ms (1 second)
- **Maximum**: 10000ms (10 seconds)
- **Recommended**: 2000ms (2 seconds)

Gmail allows approximately 100 emails per day for free accounts. Keep this in mind when sending bulk emails.

## 🔒 Security Notes

- This application uses OAuth 2.0 for secure authentication
- Access tokens are stored in memory (in production, use a database)
- Never commit `.env` file to version control
- Always use HTTPS in production environments

## 📦 Project Structure

```
bulk-gmail-sender/
├── server.js           # Main server file
├── package.json        # Dependencies
├── .env.example       # Environment variables template
├── README.md          # This file
├── public/
│   ├── index.html     # Main UI
│   ├── styles.css     # Styling
│   └── app.js         # Client-side logic
└── uploads/           # Temporary CSV uploads (auto-created)
```

## 🛠️ Technologies Used

- **Backend**: Node.js with Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **API**: Gmail API (Google APIs)
- **File Upload**: Multer, CSV Parser

## ⚠️ Important Notes

### Gmail Sending Limits

- Free Gmail accounts: ~100 emails/day
- Google Workspace accounts: ~2000 emails/day
- Exceeding limits may result in temporary suspension

### Best Practices

1. Start with small batches (10-20 recipients)
2. Use appropriate delays (2-3 seconds minimum)
3. Test with your own email first
4. Personalize emails to avoid spam filters
5. Monitor sending statistics regularly

### Legal Compliance

- Ensure recipients have opted-in to receive emails
- Include unsubscribe links in your emails
- Follow CAN-SPAM Act and GDPR regulations
- Do not send spam or unsolicited emails

## 🐛 Troubleshooting

### "Not authenticated" error
- Make sure you've completed the OAuth flow
- Clear cookies and re-authenticate

### "Failed to send" errors
- Check Gmail API quota
- Verify your Google Cloud project has Gmail API enabled
- Ensure correct OAuth scopes

### CSV upload issues
- Ensure CSV has a column with valid email addresses
- Check file format (comma-separated values)

## 📄 License

MIT License - feel free to use and modify as needed.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## ⚠️ Disclaimer

This tool is for legitimate use cases only. Users are responsible for complying with all applicable laws and regulations regarding email marketing and bulk messaging.

---

Made with ❤️ for efficient email communication

