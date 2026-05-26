# ViSuReNa Website Redesign Plan

## Current State Analysis

### Tech Stack
- **Frontend**: Flask with Jinja2 templates
- **Static Site Generation**: Flask-Frozen
- **Hosting**: AWS S3 + CloudFront (via CloudFormation)
- **Styling**: Basic CSS with 90s design
- **Content**: Static markdown blog posts

### Current Pages & Color Themes
1. **Home** - Blue-gray (#34495e) with teal accent (#1abc9c)
2. **Movies** - Pink/red theme (#ccb8b8 bg, #b93d30 accent)
3. **Music** - Purple theme (#c2b7c4 bg, #72368a accent)
4. **Games** - Blue theme (#bac3ca bg, #2a7aaf accent)
5. **Story** - Green theme (#bbc8c1 bg, #1f8b4d accent)
6. **Blog** - Neutral beige (#E0E0DA bg, #C27D0E orange accent)

## Architecture Plan (Cost-Optimized for AWS Free Tier)

### Phase 1: Modern UI with Dynamic Features (Current Focus)
1. **Frontend Framework**: React with Next.js (for SSR/SSG hybrid)
2. **Styling**: Tailwind CSS for modern, responsive design
3. **State Management**: Zustand (lightweight)
4. **Search**: Client-side search with Fuse.js
5. **Database**: DynamoDB (25GB free tier)
6. **API**: AWS Lambda (1M requests/month free)
7. **Hosting**: AWS Amplify or S3 + CloudFront

### Phase 2: Scaling Architecture (When traffic > 1000/day)
1. **Search**: Amazon OpenSearch (free tier available)
2. **Media Storage**: S3 with CloudFront
3. **API Gateway**: For rate limiting
4. **Container**: ECS Fargate when needed

## Modern Netflix-Style Design Components

### 1. Homepage Hero Section
- Auto-playing video background (muted)
- Featured content carousel
- Quick category navigation

### 2. Content Grid Layout
- Responsive grid (4 columns desktop, 2 tablet, 1 mobile)
- Hover effects with preview
- Lazy loading for performance
- Infinite scroll

### 3. Category Pages (Movies/Music/Games/Story)
- Filterable by genre, year, rating
- Sort options (newest, popular, rating)
- Card-based layout with:
  - Thumbnail/cover image
  - Title and description
  - Play/Read button
  - Rating/duration
  - Quick preview on hover

### 4. Search & Discovery
- Global search bar with instant results
- Filter by content type
- Auto-complete suggestions
- Recent searches

### 5. Content Player/Viewer
- Modal overlay for YouTube embeds
- Custom video player controls
- Related content sidebar
- Comments/ratings section

## Data Schema (DynamoDB)

### Content Table
```json
{
  "id": "uuid",
  "type": "movie|music|game|story|blog",
  "title": "string",
  "description": "string",
  "thumbnail": "url",
  "contentUrl": "youtube_url",
  "tags": ["array"],
  "genre": "string",
  "releaseDate": "ISO date",
  "duration": "minutes",
  "rating": "number",
  "views": "number",
  "featured": "boolean",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

## Implementation Roadmap

### Week 1-2: Frontend Foundation
- Set up Next.js project
- Create component library (buttons, cards, modals)
- Implement responsive grid layout
- Design Netflix-style navigation

### Week 3-4: Backend & Data
- Set up DynamoDB tables
- Create Lambda functions for CRUD
- Implement content upload/management
- Build search functionality

### Week 5-6: Integration & Polish
- Connect frontend to backend
- Add animations and transitions
- Implement lazy loading
- Performance optimization

### Week 7-8: Deployment & Testing
- Set up CI/CD pipeline
- Configure CloudFront
- Load testing
- SEO optimization