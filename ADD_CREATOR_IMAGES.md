# 📸 How to Add Creator Images

## Quick Steps

1. **Add Your Photos:**
   - Place your photos in the `public/images/` folder
   - Name them: `creator1.jpg` and `creator2.jpg`
   - Supported formats: `.jpg`, `.jpeg`, `.png`

2. **Update the HTML:**
   - Open `public/dashboard.html`
   - Find these lines (around line 20 and 47):
     ```html
     <img src="creator1.jpg" alt="Creator 1" class="creator-image">
     <img src="creator2.jpg" alt="Creator 2" class="creator-image">
     ```
   - Change them to:
     ```html
     <img src="images/creator1.jpg" alt="Creator 1" class="creator-image">
     <img src="images/creator2.jpg" alt="Creator 2" class="creator-image">
     ```

3. **Update Creator Names:**
   - In `public/dashboard.html`, find:
     - `<h3 class="creator-name">Creator Name 1</h3>` (around line 26)
     - `<p class="creator-role">Full Stack Developer</p>` (around line 27)
     - `<p class="creator-bio">...</p>` (around line 28)
   - Replace with your actual names and information

4. **Refresh the Browser:**
   - Restart your server if needed
   - Clear browser cache (Ctrl+F5)

---

## Image Requirements

- **Recommended size:** 400x400 pixels (square)
- **Format:** JPG, JPEG, or PNG
- **File size:** Under 500KB each (for faster loading)
- **Aspect ratio:** Square works best (1:1)

---

## Alternative: Use Image URLs

If your images are hosted online, you can use direct URLs:

```html
<img src="https://example.com/your-photo.jpg" alt="Creator 1" class="creator-image">
```

---

## Current Setup

The dashboard will show placeholder SVG icons if the images aren't found. Once you add your photos following the steps above, they'll automatically appear!

