# 📺 Content Management Guide

## Quick Start - Adding New Content

### 🎬 Adding a Movie/Video

1. **Open** `visurena-next/content-config.json`

2. **Find** the `"movies": [` section

3. **Add** your movie (copy this template):
```json
{
  "id": "mov-3",
  "type": "movie",
  "title": "Your Movie Title Here",
  "description": "A brief description of your movie",
  "thumbnail": "https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg",
  "videoUrl": "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
  "duration": "25 min",
  "releaseDate": "2025-02-01",
  "tags": ["documentary", "nature"],
  "rating": 4.7
}
```

4. **Replace** YOUR_VIDEO_ID with your YouTube video ID:
   - Go to your YouTube video
   - Copy the ID from URL: `youtube.com/watch?v=THIS_PART`
   - Use same ID in both thumbnail and videoUrl

5. **Save** the file

6. **Test** locally:
```bash
cd visurena-next
npm run dev
# Open http://localhost:3000/movies
```

### 🎵 Adding Music

Same process, but in the `"music": [` section:
```json
{
  "id": "mus-3",
  "type": "music",
  "title": "Song Title",
  "description": "Description of your music",
  "thumbnail": "https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg",
  "videoUrl": "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
  "duration": "3:45",
  "releaseDate": "2025-02-01",
  "tags": ["electronic", "ambient"],
  "rating": 4.8
}
```

### 🎮 Adding Games

In the `"games": [` section:
```json
{
  "id": "game-2",
  "type": "game",
  "title": "Game Title",
  "description": "Game description",
  "thumbnail": "/images/game-thumbnail.jpg",
  "videoUrl": "https://www.youtube.com/watch?v=TRAILER_ID",
  "playUrl": "https://your-game-link.com",
  "duration": "4-5 hours",
  "releaseDate": "2025-03-01",
  "tags": ["puzzle", "indie"],
  "rating": 4.5
}
```

### 📖 Adding Stories

In the `"stories": [` section:
```json
{
  "id": "story-2",
  "type": "story",
  "title": "Story Title",
  "description": "Brief synopsis",
  "thumbnail": "/images/story-cover.jpg",
  "readUrl": "/stories/story-slug",
  "duration": "30 min read",
  "releaseDate": "2025-02-15",
  "tags": ["fiction", "short story"],
  "rating": 4.9
}
```

## 🖼️ Using Custom Images

Instead of YouTube thumbnails, you can use your own images:

1. **Add** image to `visurena-next/public/images/`
2. **Reference** as: `"/images/your-image.jpg"`

## 🏷️ Available Tags

Feel free to use these tags or create new ones:

**Movies**: action, drama, documentary, experimental, short film, sci-fi, nature
**Music**: electronic, acoustic, ambient, rock, classical, experimental, live
**Games**: puzzle, platformer, adventure, strategy, indie, retro
**Stories**: fiction, non-fiction, poetry, short story, novella, essay

## 📅 Date Format

Use ISO format: `"2025-02-28"` (YYYY-MM-DD)

## ⭐ Rating

Use decimal numbers between 0-5: `4.5`, `3.8`, etc.

## 🚀 Quick Deploy After Adding Content

```bash
# 1. Test locally
cd visurena-next
npm run dev

# 2. If happy, deploy
./deploy-preview.sh
```

## 💡 Pro Tips

1. **Thumbnail Quality**: Use `maxresdefault.jpg` for best quality
2. **Description Length**: Keep under 150 characters for best display
3. **Tags**: Use 2-3 relevant tags per item
4. **IDs**: Must be unique! Use format: `type-number` (mov-1, mus-1, etc.)

## 🔍 Finding YouTube Video IDs

YouTube URL formats:
- `youtube.com/watch?v=dQw4w9WgXcQ` → ID: `dQw4w9WgXcQ`
- `youtu.be/dQw4w9WgXcQ` → ID: `dQw4w9WgXcQ`

## ❌ Common Mistakes

1. **Missing comma**: Each item needs a comma after `}` except the last one
2. **Wrong quotes**: Use double quotes `"` not single `'`
3. **Duplicate IDs**: Each ID must be unique
4. **Invalid JSON**: Use jsonlint.com to validate if errors occur

---

Remember: After any change, save the file and refresh your browser to see updates!