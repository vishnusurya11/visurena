# 📁 Where to Put Your Files

## 📝 Blog Posts
**Location**: `visurena-next/posts/`
**File format**: `.md` (markdown)

```
visurena-next/
├── posts/                    ← PUT BLOG POSTS HERE
│   ├── my-first-post.md     ← Your blog posts
│   ├── tutorial-guide.md
│   └── new-update.md
```

### Example Blog Post File:
**File**: `visurena-next/posts/my-awesome-post.md`
```markdown
---
title: "My Awesome Post"
date: "2025-01-15"
introduction: "This is what shows in the preview"
image: "/images/my-post-image.jpg"
tags: ["tutorial", "AI", "web"]
---

# My Awesome Post

Your content here...
```

## 🖼️ Images & Assets
**Location**: `visurena-next/public/images/`

```
visurena-next/
├── public/
│   ├── images/              ← PUT IMAGES HERE
│   │   ├── blog-post-1.jpg ← Blog images
│   │   ├── thumbnail.png   ← Thumbnails
│   │   └── hero-image.jpg  ← Any images
```

### Using Images in Blog Posts:
```markdown
![My Image](/images/my-image.jpg)

<!-- Or in front matter -->
---
image: "/images/featured-image.jpg"
---
```

## 🎬 Videos (YouTube)
**Location**: `visurena-next/content-config.json`

```json
{
  "movies": [
    {
      "id": "mov-1",
      "title": "My Video",
      "thumbnail": "https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg",
      "videoUrl": "https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
    }
  ]
}
```

## 📂 Complete File Structure

```
visurena-next/
├── posts/                    ← BLOG POSTS (.md files)
│   ├── my-post.md
│   └── another-post.md
│
├── public/
│   ├── images/              ← IMAGES (jpg, png, gif)
│   │   ├── blog-image.jpg
│   │   └── thumbnail.png
│   └── favicon.ico
│
├── content-config.json      ← VIDEO/MUSIC CONFIG
├── pages/                   ← Don't touch (auto-generated)
└── components/              ← Don't touch (code files)
```

## ⚡ Quick Adding Guide

### Add New Blog Post:
1. Create: `posts/my-new-post.md`
2. Add content with front matter
3. Save file
4. Restart: `npm run dev`

### Add New Image:
1. Put image in: `public/images/my-image.jpg`
2. Reference as: `"/images/my-image.jpg"`
3. Use in markdown: `![Alt text](/images/my-image.jpg)`

### Add New Video:
1. Get YouTube video ID from URL
2. Edit `content-config.json`
3. Add to movies or music array
4. Save file (auto-updates)

## 🎯 File Naming Rules

### Blog Posts:
- Use lowercase with hyphens: `my-awesome-post.md`
- No spaces or special characters
- Date prefix optional: `2025-01-15-post-title.md`

### Images:
- Use descriptive names: `ai-tutorial-screenshot.jpg`
- Supported formats: `.jpg`, `.png`, `.gif`, `.webp`
- Keep file sizes reasonable (under 1MB)

### Videos:
- YouTube video ID from URL: `youtube.com/watch?v=THIS_PART`
- Use same ID for thumbnail and video URL

---

## 🚀 That's It!
- **Blog posts** → `posts/` folder
- **Images** → `public/images/` folder  
- **Videos** → `content-config.json` file

Simple and organized! 📁✨