# 📝 Blog Management Guide

## 🚀 Quick Start

The blog system supports both **Markdown** (.md) and **HTML** (.html) files. Just drop files in the `posts/` folder!

### File Structure
```
visurena-next/
├── posts/                    # Your blog posts here
│   ├── my-post.md           # Markdown posts
│   └── rich-post.html       # HTML posts
└── public/images/           # Blog images
```

## ✍️ Markdown Posts (Simple & Quick)

### Create a Markdown Post

1. Create file: `visurena-next/posts/my-post.md`
2. Add front matter and content:

```markdown
---
title: "Your Blog Post Title"
date: "2025-01-15"
introduction: "Brief description for previews"
image: "/images/featured.jpg"
tags: ["tutorial", "AI", "web"]
author: "ViSuReNa"
featured: false
---

# Your Content Here

Write in **markdown** with:
- Lists
- **Bold** and *italic*
- [Links](https://example.com)
- Images: ![alt](/images/photo.jpg)

## Code Blocks

```python
def hello():
    print("Hello World!")
```
```

### Markdown Features
- **Headings**: `# ## ###`
- **Bold/Italic**: `**bold** *italic*`
- **Links**: `[text](url)`
- **Images**: `![alt](url)`
- **Lists**: `- item` or `1. item`
- **Code**: `` `inline` `` or triple backticks
- **Quotes**: `> quote`

## 🎨 HTML Posts (Rich Content)

Use HTML for complete control over styling, layout, videos, and interactive content.

### Create an HTML Post

Create file: `visurena-next/posts/my-post.html`

```html
<!DOCTYPE html>
<html>
<head>
    <meta name="title" content="Your Post Title">
    <meta name="description" content="Brief description">
    <meta name="date" content="2025-01-15">
    <meta name="tags" content="AI, tutorial, web">
    <title>Your Post Title</title>
</head>
<body>
    <div style="color: #ffffff; font-family: system-ui; line-height: 1.6;">
        
        <!-- Featured Image -->
        <img src="/images/featured.jpg" alt="Featured" 
             style="width: 100%; margin: 2rem 0; border-radius: 8px;">
        
        <!-- Content -->
        <h2 style="color: #3b82f6;">Main Heading</h2>
        <p>Your content here...</p>
        
        <!-- Code Block -->
        <pre style="background: #1a1a1a; padding: 1rem; border-radius: 8px;">
<code style="color: #60a5fa;">const hello = "World";</code>
        </pre>
        
        <!-- YouTube Video -->
        <iframe width="100%" height="400" 
                src="https://www.youtube.com/embed/VIDEO_ID" 
                frameborder="0" allowfullscreen
                style="border-radius: 8px; margin: 2rem 0;">
        </iframe>
        
    </div>
</body>
</html>
```

### Style Guide
- **Main headings**: `color: #3b82f6` (blue)
- **Subheadings**: `color: #fbbf24` (yellow)
- **Body text**: `color: #b3b3b3` (gray)
- **Bold/highlights**: `color: #ffffff` (white)
- **Background**: `#1a1a1a` for code blocks

## 📸 Adding Images

1. Place images in: `visurena-next/public/images/`
2. Reference as: `/images/your-image.jpg`
3. External images also work: `https://example.com/image.jpg`

### Image Examples

```html
<!-- Full width -->
<img src="/images/photo.jpg" alt="Description" 
     style="width: 100%; margin: 2rem 0; border-radius: 8px;">

<!-- Centered -->
<img src="/images/logo.png" alt="Logo" 
     style="width: 300px; margin: 2rem auto; display: block;">

<!-- Side by side -->
<div style="display: flex; gap: 1rem;">
    <img src="/images/before.jpg" style="width: 50%;">
    <img src="/images/after.jpg" style="width: 50%;">
</div>
```

## 🏷️ Metadata Options

### Markdown Front Matter
```yaml
title: "Post Title"              # Required
date: "2025-01-15"              # Required (YYYY-MM-DD)
introduction: "Preview text"     # Shows in card previews
image: "/images/featured.jpg"   # Featured image
tags: ["tag1", "tag2"]         # For filtering
author: "Your Name"            # Default: "ViSuReNa"
featured: true                 # Show in featured section
```

### HTML Meta Tags
```html
<meta name="title" content="Post Title">
<meta name="description" content="Preview text">
<meta name="date" content="2025-01-15">
<meta name="tags" content="tag1, tag2, tag3">
```

## 📱 Best Practices

1. **File Naming**: Use lowercase with hyphens (`my-awesome-post.md`)
2. **Image Optimization**: Keep under 1MB each
3. **Mobile Testing**: Always check on mobile screens
4. **Consistent Styling**: Use the color guide above
5. **Accessibility**: Add alt text to all images

## 🔄 Workflow

1. Create post file in `posts/` folder
2. Add required metadata
3. Write your content
4. Save the file
5. Restart dev server: `npm run dev`
6. View at: `http://localhost:3000/blog`

## 💡 When to Use What?

- **Use Markdown** for: Quick posts, tutorials, updates, text-heavy content
- **Use HTML** for: Rich media posts, custom layouts, embedded videos, interactive content

Both formats work seamlessly together in the same blog!