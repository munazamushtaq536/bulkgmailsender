# 📊 Visual Workflow - Bulk Gmail Sender

## 🔄 Complete System Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                              │
└─────────────────────────────────────────────────────────────────┘

STEP 1: LAUNCH APPLICATION
═══════════════════════════════
        User opens browser
              ↓
        http://localhost:3000
              ↓
    ┌───────────────────┐
    │  Check Auth Status │
    └───────────────────┘
         ↓         ↓
    ┌────┤         ├────┐
    │    │         │    │
  YES   NO      YES   NO
    │    │         │    │
    ↓    ↓         ↓    ↓
Show Main    Show Auth Screen
Dashboard    [Login Button]
    │            │
    │            ↓
    │    ┌─────────────────┐
    │    │ Connect Gmail   │
    │    │ (OAuth Flow)     │
    │    └─────────────────┘
    │
STEP 2: AUTHENTICATION
═══════════════════════════
         │
         ↓
    [Google OAuth]
         │
         ↓
   User Signs In
         │
         ↓
   Grant Permissions
         │
         ↓
  Receive Auth Code
         │
         ↓
   Exchange for Tokens
         │
         ↓
    Store Session
         │
         ↓
    Main Dashboard
         │
    ┌────┴────┐
    │         │
STEP 3A   STEP 3B
═══════    ═══════

RECIPIENT MANAGEMENT  │  COMPOSE EMAIL
──────────────────────│───────────────────
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
 Method 1:         Method 2:         Method 3:
 Manual Entry      CSV Upload      (Wait for now)
    │                 │                 │
    ↓                 ↓                 ↓
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Textarea│    │   Upload │    │          │
│   Entry  │    │   CSV    │    │   Skip   │
└──────────┘    └──────────┘    └──────────┘
    │                 │
    ↓                 ↓
┌────────────┐   ┌────────────┐
│ Validate   │   │   Parse    │
│  Emails    │   │   CSV      │
└────────────┘   └────────────┘
    │                 │
    ↓                 ↓
┌──────────────────────────────┐
│   Add to Recipient List      │
│   - Display in UI            │
│   - Show Status: pending     │
│   - Update Counter           │
└──────────────────────────────┘
                │
                ↓
         RECIPIENT LIST READY
                │
                ↓
         (Continue to Step 3B)
                │
                ↓
        ┌──────────────┐
        │ Enter Subject│
        └──────────────┘
                │
                ↓
        ┌──────────────┐
        │  Write Body  │
        │  (HTML OK)   │
        └──────────────┘
                │
                ↓
        ┌──────────────┐
        │  Set Delay   │
        │  (2000ms)    │
        └──────────────┘
                │
                ↓
        EMAIL CONTENT READY
                │
                ↓
    ┌───────────┴───────────┐
    │  Ready to Send?       │
    │  Click Send Button    │
    └───────────┬───────────┘
                │
                ↓
STEP 4: SENDING PROCESS
═════════════════════════
        │
        ↓
    ┌──────────────────┐
    │  Validation Check│
    └──────────────────┘
        │ Pass
        ↓
    ┌──────────────────┐
    │  Confirmation    │
    │  "Send to X users?"│
    └──────────────────┘
        │ Yes
        ↓
    ┌──────────────────┐
    │  Connect Gmail   │
    │  API             │
    └──────────────────┘
        │
        ↓
┌──────────────────────┐
│   START LOOP         │
│   For each recipient │
└──────────────────────┘
        │
        ├────────────────────────┐
        ↓                         ↓
┌──────────────────┐      ┌──────────────────┐
│ Build Email      │      │  Rate Limiting   │
│ - Add To:        │      │  Wait (2000ms)   │
│ - Add Subject    │      │                  │
│ - Add Body       │      │                  │
│ - Encode         │      └──────────────────┘
└──────────────────┘              │
        │                         │
        ↓                         │
┌──────────────────┐              │
│ Send via API     │              │
└──────────────────┘              │
        │                         │
        ├───────Success───────────┤
        │     │                   │
        │     │ Failed            │
        │     ↓                   │
        │ ┌──────────┐            │
        │ │Log Error │            │
        │ └──────────┘            │
        │                         │
        ↓                         ↓
┌──────────────────┐      ┌──────────────────┐
│ Update Status    │      │  More Emails?    │
│ recipient.sent   │──────┤  If Yes: Loop    │
└──────────────────┘      └──────────────────┘
        │                         │
        │    No (finished)        │
        │                         │
        └─────────┬───────────────┘
                  ↓
STEP 5: RESULTS
═════════════════
        │
        ↓
┌──────────────────┐
│ Calculate Stats  │
│ - Total sent     │
│ - Total failed   │
│ - Errors         │
└──────────────────┘
        │
        ↓
┌──────────────────┐
│ Display Results  │
│ - Success badge  │
│ - Failed list    │
│ - Error details  │
└──────────────────┘
        │
        ↓
    [COMPLETE]
```

## 📊 Dashboard Components

```
┌─────────────────────────────────────────────────────────────┐
│                    BULK GMAIL SENDER                         │
│              Send personalized emails at once                │
└─────────────────────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┐
│  Total   │   Sent   │ Pending  │  Failed  │
│    0     │    0     │    0     │    0     │
└──────────┴──────────┴──────────┴──────────┘

┌──────────────────────────┬──────────────────────────────────┐
│  👥 RECIPIENTS           │  ✏️  COMPOSE EMAIL               │
├──────────────────────────┼──────────────────────────────────┤
│                          │                                  │
│ ┌──────────────────────┐ │ Subject: [__________________]   │
│ │ Enter emails...      │ │                                  │
│ │ email1@domain.com    │ │ Body: [_____________________]   │
│ │ email2@domain.com    │ │        [_____________________]  │
│ │                      │ │        [_____________________]  │
│ └──────────────────────┘ │        (HTML supported)          │
│                          │                                  │
│ [Add Recipients] [Upload CSV] │ Delay: [2000ms]           │
│                          │                                  │
│ Recipients List:         │ [🚀 SEND EMAILS]                │
│ • pending - email1@...   │                                  │
│ • pending - email2@...   │                                  │
│                          │                                  │
│ [Clear All]              │                                  │
└──────────────────────────┴──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  📊 RESULTS                                                │
│  ✅ Successfully sent: 10 emails                            │
│  ❌ Failed: 2 emails                                        │
│  Errors:                                                    │
│  • user@example.com - Invalid email                        │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 State Transitions

```
┌──────────────┐
│  Unauthenticated  │
│   State            │
└──────────────┘
        │
        │ Login Click
        ↓
┌──────────────┐
│  OAuth Flow  │
│   State      │
└──────────────┘
        │
        │ Success
        ↓
┌──────────────┐
│ Authenticated│
│   State      │
└──────────────┘
        │
        ├─→ Add Recipients → Recipient List Updated
        │
        ├─→ Compose Email → Email Ready
        │
        ├─→ Send Emails → Sending State
        │              ↓
        │        ┌──────────┐
        │        │  Sending │
        │        │  Progress│
        │        └──────────┘
        │              │
        │              │ Complete
        │              ↓
        └─────────→ Results State
                     │
                     ├─→ Clear & Start New
                     │
                     └─→ View Details
```

## 📈 Status Flow for Each Email

```
┌──────────┐
│  PENDING │ → Email queued
└──────────┘
      ↓
┌──────────┐
│  SENDING │ → Processing via Gmail API
└──────────┘
      ↓
    ├─→ SENT ────→ ✅ Success
    │
    └─→ FAILED ──→ ❌ Error logged
```

## 🎛️ Configuration Flow

```
User Input
    │
    ├─→ Recipient Sources
    │   ├─ Manual Entry
    │   └─ CSV Upload
    │
    ├─→ Email Content
    │   ├─ Subject (text)
    │   └─ Body (HTML)
    │
    └─→ Sending Settings
        └─ Delay (1000-10000ms)
            ↓
    Final Configuration
            ↓
    Validation
            ↓
    Ready to Send
```

---

**This visual guide shows the complete journey from authentication through email sending to final results!**

