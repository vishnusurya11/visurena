---
title: "ComfyUI Workflow - Your Title Here"
description: "Brief description of your ComfyUI experiment or research"
date: "2025-11-08"
image: "/images/featured-image.png"
tags: ["ComfyUI", "AI", "Image Generation"]
author: "ViSuReNa"
---

# Your Main Heading

Brief introduction about what you're testing or documenting...

## The Setup

Describe your workflow setup, models, settings, etc.

![ComfyUI Workflow Screenshot](/images/workflow-screenshot.png)

## Results

Share your generated images:

![Result 1](/images/result-1.png)

![Result 2](/images/result-2.png)

### Multiple Images in a Row

You can just add images one after another:

![Image 1](/images/img1.png)
![Image 2](/images/img2.png)
![Image 3](/images/img3.png)

## Video Demo

For videos, use the HTML video tag:

<video controls width="100%">
  <source src="/videos/demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

Or embed YouTube (with thumbnail):

[![Watch the video](https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg)](https://youtube.com/watch?v=VIDEO_ID)

## Settings/Code

Share your settings or code:

```json
{
  "model": "flux-dev",
  "steps": 20,
  "cfg": 7.5,
  "sampler": "euler",
  "scheduler": "normal"
}
```

Or Python code:

```python
def generate_image(prompt, model="flux-dev"):
    # Your code here
    return result
```

## Key Findings

- **Finding 1**: Your observation
- **Finding 2**: Another insight
- **Finding 3**: Lessons learned

## Notes and Thoughts

Write your detailed observations, learnings, challenges, or ideas for future experiments...

---

## Tips for Writing

- Drop images in `/public/images/` folder
- Drop videos in `/public/videos/` folder
- Reference images with `![Alt text](/images/filename.png)`
- Use `<video>` tag for video embeds
- Save file → instant preview at `localhost:3000/blog/your-post-name`
- Markdown supports **bold**, *italic*, [links](https://example.com), and more!
