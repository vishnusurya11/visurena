# 📝 HTML Blog Post Guide

## ✨ Perfect for Rich Content!

HTML blog posts give you **complete control** over styling, images, videos, and layout. Much better than markdown for complex posts!

## 📁 Where to Put Files

### Blog Posts
**Location**: `visurena-next/posts/`
**Format**: `.html` files

### Images
**Location**: `visurena-next/public/images/`
**Reference**: `/images/your-image.jpg`

## 🎨 HTML Blog Post Template

Create: `visurena-next/posts/my-post.html`

```html
<!DOCTYPE html>
<html>
<head>
    <meta name="title" content="Your Post Title">
    <meta name="description" content="Brief description for previews">
    <meta name="date" content="2025-01-15">
    <meta name="tags" content="AI, tutorial, web development">
    <title>Your Post Title</title>
</head>
<body>
    <div style="color: #ffffff; font-family: system-ui, sans-serif; line-height: 1.6;">
        
        <!-- Featured Image -->
        <img src="/images/my-featured-image.jpg" alt="Post Image" 
             style="width: 100%; max-width: 600px; margin: 2rem auto; display: block;">
        
        <!-- Content -->
        <p>Your introduction paragraph here...</p>

        <h2 style="color: #3b82f6; margin-top: 2rem;">Main Section</h2>
        
        <p>Your content with <strong>bold text</strong> and <em>italic text</em>.</p>

        <h3 style="color: #fbbf24; margin-top: 1.5rem;">Subsection</h3>
        
        <ul style="color: #b3b3b3;">
            <li>List item 1</li>
            <li>List item 2</li>
            <li>List item 3</li>
        </ul>

        <!-- More Images -->
        <img src="/images/screenshot.jpg" alt="Screenshot" 
             style="width: 100%; margin: 2rem 0; border-radius: 8px;">

        <p>More content...</p>

        <!-- Code Example -->
        <pre style="background: #1a1a1a; padding: 1rem; border-radius: 8px; overflow-x: auto;">
<code style="color: #60a5fa;">
function hello() {
    console.log("Hello World!");
}
</code>
        </pre>

        <p>Final thoughts...</p>

    </div>
</body>
</html>
```

## 🎨 Styling Guide

### Colors to Use
```css
/* Main headings */
color: #3b82f6  (blue)

/* Subheadings */  
color: #fbbf24  (yellow/gold)

/* Body text */
color: #b3b3b3  (gray)

/* Bold text */
color: #ffffff  (white)

/* Links */
color: #3b82f6  (blue)
```

### Images
```html
<!-- Full width image -->
<img src="/images/my-image.jpg" alt="Description" 
     style="width: 100%; margin: 2rem 0; border-radius: 8px;">

<!-- Centered smaller image -->
<img src="/images/logo.png" alt="Logo" 
     style="width: 300px; margin: 2rem auto; display: block;">

<!-- Side by side images -->
<div style="display: flex; gap: 1rem; margin: 2rem 0;">
    <img src="/images/before.jpg" alt="Before" style="width: 50%;">
    <img src="/images/after.jpg" alt="After" style="width: 50%;">
</div>
```

### Videos (YouTube Embeds)
```html
<div style="margin: 2rem 0;">
    <iframe 
        width="100%" 
        height="400" 
        src="https://www.youtube.com/embed/YOUR_VIDEO_ID" 
        frameborder="0" 
        allowfullscreen
        style="border-radius: 8px;">
    </iframe>
</div>
```

### Code Blocks
```html
<pre style="background: #1a1a1a; padding: 1rem; border-radius: 8px; overflow-x: auto; margin: 1rem 0;">
<code style="color: #60a5fa;">
// Your code here
const example = "Hello World";
console.log(example);
</code>
</pre>
```

### Quotes
```html
<blockquote style="border-left: 4px solid #3b82f6; padding-left: 1rem; margin: 2rem 0; font-style: italic; color: #b3b3b3;">
    "This is an important quote or highlight."
</blockquote>
```

### Tables
```html
<table style="width: 100%; border-collapse: collapse; margin: 2rem 0;">
    <thead>
        <tr style="background: #2a2a2a;">
            <th style="padding: 0.75rem; border: 1px solid #333; color: #ffffff;">Column 1</th>
            <th style="padding: 0.75rem; border: 1px solid #333; color: #ffffff;">Column 2</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="padding: 0.75rem; border: 1px solid #333; color: #b3b3b3;">Data 1</td>
            <td style="padding: 0.75rem; border: 1px solid #333; color: #b3b3b3;">Data 2</td>
        </tr>
    </tbody>
</table>
```

## 📂 File Management

### Adding New Post
1. Create: `posts/my-new-post.html`
2. Add metadata in `<head>` section
3. Write content in `<body>`
4. Save file
5. Restart: `npm run dev`

### Adding Images
1. Put image in: `public/images/my-image.jpg`
2. Reference as: `src="/images/my-image.jpg"`
3. Always add `alt` attribute for accessibility

### File Naming
- Use lowercase with hyphens: `my-awesome-tutorial.html`
- No spaces or special characters
- Be descriptive: `ai-tutorial-january-2025.html`

## 🚀 Pro Tips

1. **Always include metadata** in `<head>` for proper previews
2. **Use semantic HTML** (h1, h2, h3 for structure)
3. **Optimize images** (under 1MB each)
4. **Test on mobile** by resizing browser
5. **Use consistent styling** across all posts

## 📱 Mobile Responsive

The styling automatically works on mobile, but you can add:

```html
<style>
@media (max-width: 768px) {
    .mobile-stack {
        flex-direction: column !important;
    }
}
</style>
```

---

## 🎯 Example: Complete Blog Post

Check `posts/roadmap-2025.html` for a real example with:
- ✅ Proper metadata
- ✅ Featured image
- ✅ Styled headings
- ✅ Lists and content
- ✅ Mobile responsive

**HTML gives you unlimited creative control for beautiful blog posts!** 🎨✨