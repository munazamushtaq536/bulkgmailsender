# 📸 How to Change Creator Photos and Information

## Quick Guide

---

## Step 1: Add Your Photos

### Option A: Add Photos to the Project

1. **Get your photos ready:**
   - Use square photos (400x400 pixels works best)
   - Format: `.jpg`, `.jpeg`, or `.png`
   - Keep file size under 500KB each

2. **Copy photos to the images folder:**
   - Go to: `C:\Users\KCS\Desktop\Bulk Gmail Sender\public\images\`
   - Copy your first photo and rename it to: **`creator1.jpg`**
   - Copy your second photo and rename it to: **`creator2.jpg`**

### Option B: Use Online Photos

If your photos are hosted online, you can use the URL directly (see Step 2).

---

## Step 2: Update the HTML File

1. **Open the dashboard file:**
   - Go to: `C:\Users\KCS\Desktop\Bulk Gmail Sender\public\dashboard.html`
   - Right-click → Open with → Notepad (or any text editor)

2. **Find Creator 1 section (around line 24-32):**
   ```html
   <div class="creator-box">
       <div class="creator-image-container">
           <img src="images/creator1.jpg" alt="Creator 1" class="creator-image">
       </div>
       <div class="creator-info">
           <h3 class="creator-name">Creator Name 1</h3>
           <p class="creator-role">Full Stack Developer</p>
           <p class="creator-bio">Specialized in web applications and email marketing solutions</p>
       </div>
   </div>
   ```

3. **Update Creator 1 information:**
   - Change `Creator Name 1` to your actual name
   - Change `Full Stack Developer` to your role
   - Change the bio text to your description

4. **Find Creator 2 section (around line 62-70):**
   ```html
   <div class="creator-box">
       <div class="creator-image-container">
           <img src="images/creator2.jpg" alt="Creator 2" class="creator-image">
       </div>
       <div class="creator-info">
           <h3 class="creator-name">Creator Name 2</h3>
           <p class="creator-role">UI/UX Designer</p>
           <p class="creator-bio">Creative designer focused on user experience and modern interfaces</p>
       </div>
   </div>
   ```

5. **Update Creator 2 information:**
   - Change `Creator Name 2` to the second person's name
   - Change `UI/UX Designer` to their role
   - Change the bio text to their description

---

## Step 3: Example Updates

### Example for Creator 1:
```html
<h3 class="creator-name">John Doe</h3>
<p class="creator-role">Software Engineer</p>
<p class="creator-bio">Passionate developer with 5 years of experience in web applications</p>
```

### Example for Creator 2:
```html
<h3 class="creator-name">Jane Smith</h3>
<p class="creator-role">Project Manager</p>
<p class="creator-bio">Expert in managing software projects and team coordination</p>
```

---

## Step 4: Using Online Photos (Alternative)

If you want to use photos from a URL instead:

1. **Find the image URL** (e.g., from Google Drive, Dropbox, or any website)

2. **Replace the image source:**
   ```html
   <!-- Change this: -->
   <img src="images/creator1.jpg" alt="Creator 1" class="creator-image">
   
   <!-- To this: -->
   <img src="https://example.com/your-photo.jpg" alt="Creator 1" class="creator-image">
   ```

---

## Step 5: Save and Refresh

1. **Save the file:**
   - Press `Ctrl + S` to save
   - Close the text editor

2. **Refresh your browser:**
   - Go to: http://localhost:3000
   - Press `Ctrl + Shift + R` (hard refresh)
   - Your changes should appear!

---

## Quick Checklist

- [ ] Photos added to `public/images/` folder as `creator1.jpg` and `creator2.jpg`
- [ ] Creator 1 name updated in `dashboard.html`
- [ ] Creator 1 role updated
- [ ] Creator 1 bio updated
- [ ] Creator 2 name updated
- [ ] Creator 2 role updated
- [ ] Creator 2 bio updated
- [ ] File saved
- [ ] Browser refreshed

---

## Troubleshooting

### Photos not showing?
- Make sure photos are in `public/images/` folder
- Check file names are exactly: `creator1.jpg` and `creator2.jpg`
- Verify file extensions are `.jpg`, `.jpeg`, or `.png`
- Try hard refresh: `Ctrl + Shift + R`

### Changes not appearing?
- Make sure you saved the file
- Restart the server (stop with Ctrl+C, then run `npm start` again)
- Clear browser cache

### Photo size issues?
- Resize photos to 400x400 pixels for best results
- Use online tools like: https://www.iloveimg.com/resize-image

---

**Need help? The images folder is at:** `C:\Users\KCS\Desktop\Bulk Gmail Sender\public\images\`

