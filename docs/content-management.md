# 🎯 Complete Content Management Guide

## 📁 File Structure Overview

```
apps/web/
├── posts/                     ← BLOG POSTS (HTML files)
├── public/images/             ← IMAGES for blog posts
├── content-config.json        ← VIDEOS & MUSIC configuration
```

---

## 🎬 Adding Movies/Videos

**File**: `apps/web/content-config.json`

### Step 1: Get YouTube Video ID
From `https://www.youtube.com/watch?v=YfsdEYdr7Fs` → ID is `YfsdEYdr7Fs`

### Step 2: Add to JSON
```json
{
  "movies": [
    {
      "id": "mov-3",
      "type": "movie",
      "title": "Your Video Title",
      "description": "Brief description of your video",
      "thumbnail": "https://img.youtube.com/vi/YfsdEYdr7Fs/maxresdefault.jpg",
      "videoUrl": "https://www.youtube.com/watch?v=YfsdEYdr7Fs",
      "duration": "10 min",
      "releaseDate": "2025-01-15",
      "tags": ["creative", "tutorial"],
      "rating": 4.8
    }
  ]
}
```

### Step 3: Save & Refresh
- Save the file
- The video appears automatically (no restart needed)

---

## 🎵 Adding Music/Audio

**File**: `apps/web/content-config.json`

### Step 1: Get YouTube Video ID
From your music video URL → Extract the ID

### Step 2: Add to Music Array
```json
{
  "music": [
    {
      "id": "mus-3",
      "type": "music",
      "title": "My New Song",
      "description": "Original music composition",
      "thumbnail": "https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg",
      "videoUrl": "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
      "duration": "3:45",
      "releaseDate": "2025-01-15",
      "tags": ["original", "composition"],
      "rating": 4.9
    }
  ]
}
```

---

## 🎮 Adding Games (Coming Soon)

**File**: `apps/web/content-config.json`

### When Ready to Add Games:
```json
{
  "games": [
    {
      "id": "game-1",
      "type": "game",
      "title": "My New Game",
      "description": "Awesome game description",
      "thumbnail": "/images/game-thumbnail.jpg",
      "videoUrl": "https://www.youtube.com/watch?v=TRAILER_ID",
      "playUrl": "https://your-game-link.com",
      "duration": "2-3 hours",
      "releaseDate": "2025-03-01",
      "tags": ["puzzle", "indie"],
      "rating": 4.5
    }
  ]
}
```

---

## 📖 Adding Stories (Coming Soon)

**File**: `apps/web/content-config.json`

### When Ready to Add Stories:
```json
{
  "stories": [
    {
      "id": "story-1",
      "type": "story",
      "title": "My Story Title",
      "description": "Story synopsis",
      "thumbnail": "/images/story-cover.jpg",
      "readUrl": "/stories/story-slug",
      "duration": "30 min read",
      "releaseDate": "2025-02-15",
      "tags": ["fiction", "adventure"],
      "rating": 4.8
    }
  ]
}
```

---

## 📝 Adding Blog Posts

**Location**: `apps/web/posts/`

### Step 1: Create HTML File
**File**: `posts/my-new-post.html`

### Step 2: Use This Template
```html
<!DOCTYPE html>
<html>
<head>
    <meta name="title" content="Your Post Title">
    <meta name="description" content="Brief description for previews">
    <meta name="date" content="2025-01-15">
    <meta name="image" content="/images/your-featured-image.jpg">
    <meta name="tags" content="tutorial, AI, development">
    <title>Your Post Title</title>
</head>
<body>
    <div style="color: #ffffff; font-family: system-ui, sans-serif; line-height: 1.6;">
        
        <p>Your introduction paragraph...</p>

        <h2 style="color: #3b82f6; margin-top: 2rem;">Main Section</h2>
        
        <p>Content with <strong>bold</strong> and <em>italic</em> text.</p>

        <img src="/images/your-image.jpg" alt="Description" 
             style="width: 100%; max-width: 600px; margin: 2rem auto; display: block; border-radius: 8px;">

        <h3 style="color: #fbbf24; margin-top: 1.5rem;">Subsection</h3>
        
        <ul style="color: #b3b3b3;">
            <li>Point 1</li>
            <li>Point 2</li>
            <li>Point 3</li>
        </ul>

        <p>More content...</p>

    </div>
</body>
</html>
```

### Step 3: Add Images
1. Put images in: `public/images/your-image.jpg`
2. Reference as: `src="/images/your-image.jpg"`

### Step 4: Save & Restart
- Save the HTML file
- Restart: `npm run dev`
- Post appears in `/blog`

---

## 🖼️ Image Management

### Location
**All images**: `apps/web/public/images/`

### Supported Formats
- `.jpg`, `.png`, `.gif`, `.webp`
- Keep under 1MB each for performance

### Usage Examples
```html
<!-- In blog posts -->
<img src="/images/my-image.jpg" alt="Description">

<!-- In JSON config (for thumbnails) -->
"thumbnail": "/images/my-thumbnail.jpg"

<!-- YouTube thumbnails (automatic) -->
"thumbnail": "https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg"
```

---

## 🚀 Quick Adding Workflows

### Add Video (2 minutes):
1. Upload to YouTube
2. Copy video ID from URL
3. Edit `content-config.json`
4. Add to `movies` or `music` array
5. Save → Done!

### Add Blog Post (5 minutes):
1. Create `posts/my-post.html`
2. Copy template from above
3. Add your content
4. Add images to `public/images/`
5. Save → Restart dev → Done!

### Add Images:
1. Drop in `public/images/`
2. Reference as `/images/filename.jpg`
3. Done!

---

## 📱 Testing Checklist

Before publishing:
- [ ] Content displays correctly
- [ ] Images load properly
- [ ] Mobile responsive (resize browser)
- [ ] Links work
- [ ] Videos play
- [ ] No console errors (F12)

---

## 🎯 Pro Tips

1. **Video IDs**: Always from the YouTube URL part after `v=`
2. **Images**: Use descriptive filenames
3. **Dates**: Use format `2025-01-15` (YYYY-MM-DD)
4. **Tags**: Use consistent, lowercase tags
5. **Thumbnails**: YouTube auto-generates, or use your own
6. **File naming**: Use lowercase with hyphens (no spaces)

---

## 🔄 Content Updates

### Update Video Info:
- Edit `content-config.json`
- Save (auto-updates, no restart needed)

### Update Blog Post:
- Edit HTML file in `posts/`
- Restart dev server
- Changes appear

### Add New Images:
- Drop in `public/images/`
- Reference immediately

---

**This guide covers everything you need to manage all content types! 🎉**