# 🎯 Where to Find "ADD OR REMOVE SCOPES" - Visual Guide

## 📍 Exact Location in Google Cloud Console

### You Are On: OAuth Consent Screen Page

After you click "SAVE AND CONTINUE" from the basic app info, you'll see a page with multiple steps/sections:

```
┌──────────────────────────────────────────────────────────┐
│  OAuth consent screen                                     │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Step 1: App information                      [DONE] ✓   │
│                                                           │
│  ┌───────────────────────────────────────────────────┐   │
│  │ ⚠️ App information                                │   │
│  ├───────────────────────────────────────────────────┤   │
│  │ App name: Bulk Gmail Sender                      │   │
│  │ Support email: your-email@gmail.com              │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                           │
│  Step 2: Scopes                              [NOT DONE]  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐   │
│  │ 📋 Scopes                                          │   │
│  │                                                     │   │
│  │  + ADD OR REMOVE SCOPES  ← CLICK HERE!            │   │
│  │                                                     │   │
│  │  [No scopes added]                                 │   │
│  └───────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## 🔍 Step-by-Step Visual Path

### Current Page Structure:

```
Google Cloud Console
├── OAuth consent screen (You are here!)
│   ├── App information [✓ Complete]
│   ├── Scopes ← YOU ARE HERE
│   │   └── [Button: ADD OR REMOVE SCOPES]
│   ├── Test users
│   └── Summary
```

---

## 🖱️ What to Click

Look for this button on the page:

```
+ ADD OR REMOVE SCOPES
```

It's usually:
- **Blue button**
- Located below "Scopes" heading
- Might be a link instead of a button
- In the middle section of the OAuth consent screen page

---

## 📋 Alternative: Where Else You Might See It

Sometimes the interface looks different. Look for:

1. **Button labeled:** "MANAGE SCOPES"
2. **Link labeled:** "Add scopes"
3. **Section titled:** "User data access"
4. **Tab labeled:** "Scopes"

All of these lead to the same place!

---

## 🎯 What It Looks Like When You Click It

```
┌──────────────────────────────────────────────────────┐
│  Manage Scopes                                        │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Selected scopes (0):                                │
│  ┌─────────────────────────────────────────────────┐ │
│  │  [Empty list]                                   │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  + ADD SCOPES ← CLICK THIS BUTTON                    │
│                                                       │
└──────────────────────────────────────────────────────┘
```

Then in the "Add SCOPES" dialog:

```
┌──────────────────────────────────────────────────────┐
│  Add SCOPES                                           │
├──────────────────────────────────────────────────────┤
│  Find scopes by name or value:                        │
│  [Search box: Type "gmail"]                          │
│                                                       │
│  Or manually enter:                                   │
│  https://www.googleapis.com/auth/gmail.send           │
│                                                       │
│  [Add to table]                                       │
└──────────────────────────────────────────────────────┘
```

---

## 🧭 Can't Find It? Try This

### Method 1: Scroll Down
- The page might be long
- Scroll down past App Information
- Look for "Scopes" section

### Method 2: Look in Sidebar
- Sometimes there's a progress indicator on the left
- Click the "Scopes" step
- It will jump to that section

### Method 3: Use Breadcrumbs
- Look at the top for navigation like:
  - "OAuth consent screen > Scopes"
- Click "Scopes" part

### Method 4: Alternative Interface

If you see something like this instead:

```
┌────────────────────────────────────────┐
│  User data access                       │
│  [ ] Email                              │
│  [ ] Profile                            │
│                                         │
│  [MANAGE ADDITIONAL SCOPES] ← Click    │
└────────────────────────────────────────┘
```

Click "MANAGE ADDITIONAL SCOPES"

---

## 📸 What You Should See After Adding Scopes

```
Selected scopes (2):

┌─────────────────────────────────────────────────┐
│ Scope Name              Full API path            │
├─────────────────────────────────────────────────┤
│ Send email on         .../auth/gmail.send        │
│  your behalf                                     │
├─────────────────────────────────────────────────┤
│ Manage drafts and send   .../auth/gmail.compose  │
│   emails on your behalf                         │
└─────────────────────────────────────────────────┘

                      [UPDATE]  [CANCEL]
```

Click **"UPDATE"**

---

## 🆘 Still Can't Find It?

Try this shortcut:

1. Make sure you completed "App information" first
2. Click **"SAVE AND CONTINUE"** at the bottom
3. You'll automatically move to the "Scopes" step
4. The button will be more visible

---

## ⚠️ Common Issue: "You haven't added any scopes yet"

If you see this message, it means:
- You successfully clicked "ADD OR REMOVE SCOPES"
- But you haven't added any scopes yet
- You need to click "+ ADD SCOPES" next
- Then search/enter the Gmail scopes
- Then click "ADD TO TABLE" or "UPDATE"

---

## ✅ Success Checklist

You'll know you found it when:

- [ ] You clicked something that opens a dialog/modal
- [ ] You see a list or table (even if empty)
- [ ] You see "+ ADD SCOPES" button
- [ ] You can search or input text
- [ ] You can click "UPDATE" or "SAVE"

---

**Tip:** If all else fails, just continue without adding scopes first, then come back and edit the OAuth consent screen later. The button will definitely be there when editing!

