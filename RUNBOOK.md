# ViSuReNa Website - Complete Runbook

## 📋 Table of Contents
1. [Initial Setup](#initial-setup)
2. [Local Development](#local-development)
3. [Adding New Content](#adding-new-content)
4. [Testing Locally](#testing-locally)
5. [Production Deployment](#production-deployment)
6. [Rollback Procedure](#rollback-procedure)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Initial Setup

### Prerequisites
- Node.js 18+ installed
- AWS CLI configured (`aws configure`)
- Git installed

### First Time Setup
```bash
# 1. Clone the repository
git clone <your-repo-url>
cd visurena

# 2. Navigate to Next.js project
cd visurena-next

# 3. Install dependencies
npm install

# 4. Create environment file
cp .env.example .env.local
```

---

## 💻 Local Development

### Start Development Server
```bash
# From visurena-next directory
npm run dev
```
- Opens at: http://localhost:3000
- Hot reload enabled
- See changes instantly

### View Both Old and New Sites
```bash
# Terminal 1 - Old site
cd visurena_website
python app.py
# Visit http://localhost:5000

# Terminal 2 - New site
cd visurena-next
npm run dev
# Visit http://localhost:3000
```

---

## 📝 Adding New Content

### Step 1: Edit Content Config
Open `visurena-next/content-config.json`

### Step 2: Add Your Content
Example for adding a new movie:
```json
{
  "id": "mov-3",
  "type": "movie",
  "title": "Your Movie Title",
  "description": "Brief description",
  "thumbnail": "https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg",
  "videoUrl": "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
  "duration": "20 min",
  "releaseDate": "2025-02-15",
  "tags": ["genre1", "genre2"],
  "rating": 4.5
}
```

### Step 3: Get YouTube Thumbnail URL
1. Go to your YouTube video
2. Copy video ID from URL (part after `v=`)
3. Use this format: `https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg`

### Step 4: Save and Test
```bash
# Save the file and the dev server will auto-reload
# Check http://localhost:3000/movies
```

---

## 🧪 Testing Locally

### 1. Development Testing
```bash
npm run dev
# Test at http://localhost:3000
```

### 2. Production Build Test
```bash
# Build production version
npm run build

# Test production build locally
npm run start
# Visit http://localhost:3000
```

### 3. Static Export Test
```bash
# Generate static files
npm run export

# Preview static site
npx serve out -p 8080
# Visit http://localhost:8080
```

### Testing Checklist
- [ ] Home page loads with hero section
- [ ] All navigation links work
- [ ] Content cards display properly
- [ ] Videos play when clicked
- [ ] Mobile responsive (resize browser)
- [ ] Page transitions smooth
- [ ] No console errors (F12 → Console)

---

## 🚀 Production Deployment

### Method 1: Automated Deployment Script
```bash
# From visurena root directory
chmod +x deploy-preview.sh
./deploy-preview.sh
```

### Method 2: Manual Deployment

#### Step 1: Build and Export
```bash
cd visurena-next
npm run build
npm run export
```

#### Step 2: Preview Before Deploy
```bash
npx serve out -p 8080
# Open http://localhost:8080
# Thoroughly test everything
```

#### Step 3: Deploy to AWS S3
```bash
# Set your S3 bucket name
export S3_BUCKET="visurena.com"

# Sync files to S3
aws s3 sync out/ s3://$S3_BUCKET --delete

# Check upload
aws s3 ls s3://$S3_BUCKET --recursive
```

#### Step 4: Invalidate CloudFront Cache
```bash
# Get your distribution ID
aws cloudfront list-distributions | grep -A 10 "visurena.com"

# Invalidate cache (replace DISTRIBUTION_ID)
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

#### Step 5: Verify Production
1. Visit https://visurena.com
2. Test all pages
3. Check in different browsers
4. Test on mobile

---

## 🔄 Rollback Procedure

### If Something Goes Wrong

#### Quick Rollback to Previous Version
```bash
# 1. Keep backup of current production
aws s3 sync s3://visurena.com s3://visurena-backup-$(date +%Y%m%d) --delete

# 2. If needed, restore old Flask site
cd visurena_website
python app.py freeze
aws s3 sync build/ s3://visurena.com --delete

# 3. Clear CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

---

## 🛠️ Troubleshooting

### Common Issues

#### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Images Not Loading
- Check image URLs in content-config.json
- Ensure YouTube video IDs are correct
- For local images, place in `public/images/`

#### Site Not Updating After Deploy
```bash
# Force CloudFront invalidation
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"

# Clear browser cache (Ctrl+Shift+R)
```

#### 404 Errors on Refresh
- Ensure `trailingSlash: true` in next.config.js
- Check S3 bucket static website hosting settings

---

## 📊 Monitoring

### Check AWS Costs
```bash
# View current month costs
aws ce get-cost-and-usage \
  --time-period Start=$(date -u +%Y-%m-01),End=$(date -u +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE
```

### CloudFront Logs
1. Enable CloudFront logging in AWS Console
2. Logs saved to S3 bucket
3. Analyze with AWS Athena (free tier available)

---

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build production
npm run export                 # Generate static files

# Deployment
./deploy-preview.sh            # Automated deploy with preview
aws s3 sync out/ s3://bucket   # Manual S3 sync

# Content Management
nano content-config.json       # Edit content
npm run dev                    # See changes instantly

# Troubleshooting
npm run lint                   # Check for code issues
rm -rf .next out               # Clear build cache
```

---

## 📱 Contact for Help

If you encounter issues:
1. Check error messages in console
2. Review this runbook
3. Check AWS service health
4. Review CloudFront/S3 logs

Remember: Always test locally before deploying to production!