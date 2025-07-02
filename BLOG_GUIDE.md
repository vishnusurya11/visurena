# 📝 Blog Management Guide

## 🚀 Super Simple Blog System

### How It Works
1. **Drop markdown files** in `visurena-next/posts/` folder
2. **Restart dev server** (`npm run dev`)
3. **Blog posts appear automatically**

### 📁 File Structure
```
visurena-next/
├── posts/                    # Your blog posts folder
│   ├── my-first-post.md     # Individual blog posts
│   ├── dev-log-march.md
│   └── new-post.md
└── pages/blog/
    └── [slug].tsx           # Auto-generates pages
```

## ✍️ Adding New Blog Posts

### Step 1: Create Markdown File
Create a new `.md` file in `visurena-next/posts/` folder.

### Step 2: Add Front Matter
Start your file with metadata:

```markdown
---
title: "Your Blog Post Title"
date: "2025-01-15"
introduction: "Brief description that appears in previews"
image: "/images/your-image.jpg"
tags: ["web development", "tutorial", "AI"]
author: "ViSuReNa"
featured: false
---

# Your Content Here

Write your blog post content in **markdown**.

## You can use headings
- Lists
- **Bold text**
- [Links](https://example.com)

```python
# Code blocks work too
def hello():
    print("Hello World!")
```
```

### Step 3: Save & Refresh
1. Save the file
2. Restart `npm run dev` 
3. Visit `/blog` to see your new post

## 🎨 Supported Features

### Front Matter Options
```yaml
---
title: "Post Title"              # Required
date: "2025-01-15"              # Required (YYYY-MM-DD)
introduction: "Brief description" # Appears in card previews
image: "/images/post-image.jpg"  # Optional featured image
tags: ["tag1", "tag2"]          # Optional tags for filtering
author: "Your Name"             # Defaults to "ViSuReNa"
featured: true                  # Shows in featured section
category: "Development"         # Optional category
---
```

### Markdown Support
- **Headings**: `# ## ###`
- **Bold/Italic**: `**bold** *italic*`
- **Links**: `[text](url)`
- **Images**: `![alt](image-url)`
- **Lists**: `- item` or `1. item`
- **Code**: `` `inline` `` or ```code blocks```
- **Quotes**: `> quote`

## 📂 File Naming
- Use lowercase with hyphens: `my-awesome-post.md`
- Date prefix optional: `2025-01-15-post-title.md`
- No spaces or special characters

## 🖼️ Adding Images
1. Put images in `visurena-next/public/images/`
2. Reference as: `"/images/your-image.jpg"`
3. Or use external URLs: `"https://example.com/image.jpg"`

## 🏷️ Tags & Categories
```yaml
tags: ["AI", "tutorial", "beginner"]     # For filtering
category: "Development"                  # Main category
```

## ⚡ Quick Examples

### Simple Post
```markdown
---
title: "My New Project Update"
date: "2025-01-15"
introduction: "Quick update on what I've been working on"
tags: ["update", "project"]
---

# Project Update

Just finished implementing the new **search feature**!

Here's what's new:
- Faster search
- Better results
- Mobile optimized
```

### Tutorial Post
```markdown
---
title: "How to Deploy with AWS"
date: "2025-01-15"
introduction: "Step-by-step guide to deploying your website"
image: "/images/aws-tutorial.jpg"
tags: ["AWS", "tutorial", "deployment"]
category: "Tutorial"
featured: true
---

# AWS Deployment Guide

This tutorial will walk you through...
```

## 🔄 Updating Existing Posts
1. Edit the `.md` file in `posts/` folder
2. Update `date` field to current date
3. Save file
4. Restart dev server to see changes

## 📱 Mobile Optimized
All blog posts automatically work on:
- Desktop
- Tablet  
- Mobile phones

## 🎯 Pro Tips
1. **Keep titles under 60 characters**
2. **Write engaging introductions** (shows in previews)
3. **Use tags consistently** for better filtering
4. **Add images** for visual appeal
5. **Test on mobile** after adding new posts

---

That's it! Super simple blog management. Just drop markdown files and they become blog posts automatically! 🎉