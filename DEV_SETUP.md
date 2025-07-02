# Development Setup & Preview Guide

## Quick Start

### 1. Install Dependencies
```bash
cd visurena-next
npm install
```

### 2. Run Development Server (Live Preview)
```bash
npm run dev
```
Visit `http://localhost:3000` to see the site with hot-reload enabled.

### 3. Build for Production Preview
```bash
npm run build
npm run start
```
This builds optimized production files and serves them locally at `http://localhost:3000`.

### 4. Generate Static Site for Offline Preview
```bash
npm run build
npm run export
```
This creates a static export in the `out/` directory that you can:
- Open directly in your browser (file:///path/to/out/index.html)
- Serve with any static server: `npx serve out`
- Deploy to S3/CloudFront when ready

## Preview Workflow

### Local Development Stages:

1. **Development Mode** (`npm run dev`)
   - Hot reload enabled
   - See changes instantly
   - Best for active development

2. **Production Preview** (`npm run build && npm run start`)
   - Optimized build
   - Performance testing
   - Final review before deployment

3. **Static Export** (`npm run export`)
   - Creates deployable static files
   - Can be viewed completely offline
   - Exactly what will be deployed

### Deployment Process:

```bash
# 1. Review in development
npm run dev

# 2. Build and test production version
npm run build
npm run start

# 3. Generate static files
npm run export

# 4. Preview static files offline
npx serve out
# or open out/index.html in browser

# 5. If approved, sync to S3
aws s3 sync out/ s3://your-bucket-name --delete

# 6. Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Side-by-Side Comparison

To compare old vs new design:

```bash
# Terminal 1 - Old Flask site
cd visurena_website
python app.py
# Visit http://localhost:5000

# Terminal 2 - New Next.js site
cd visurena-next
npm run dev
# Visit http://localhost:3000
```

## Environment Variables

Create `.env.local` for development:
```env
# API endpoints (when we add backend)
NEXT_PUBLIC_API_URL=http://localhost:8000

# AWS Configuration (for future)
NEXT_PUBLIC_AWS_REGION=us-east-1
```

## Testing Checklist

Before pushing to production, verify:

- [ ] All pages load correctly
- [ ] Navigation works on all devices
- [ ] Images and videos load properly
- [ ] Search functionality works
- [ ] Color themes are correct for each page
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Page load performance is good
- [ ] No console errors
- [ ] SEO meta tags are present
- [ ] Static export completes without errors