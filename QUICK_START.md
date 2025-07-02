# ⚡ Quick Start Guide

## 🎯 Local Development (5 minutes)

```bash
# 1. Navigate to project
cd visurena-next

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Visit: http://localhost:3000
```

**You can now:**
- ✅ See your website live
- ✅ Make changes and see them instantly
- ✅ Test all pages and features

---

## 🧪 Test Production Build (2 minutes)

```bash
# 1. Build production version
npm run build

# 2. Export static files
npm run export

# 3. Preview production site
npx serve out -p 8080

# 4. Test at: http://localhost:8080
```

This is **exactly** what will be deployed to visurena.com

---

## 🚀 Deploy to Production

### One-Time Setup (10 minutes):

#### 1. Deploy AWS Infrastructure
```bash
cd infrastructure
./deploy-infrastructure.sh
```

#### 2. Add GitHub Secrets
Go to GitHub → Settings → Secrets → Actions:
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key  
- `S3_BUCKET`: (provided by script above)
- `CLOUDFRONT_DISTRIBUTION_ID`: (provided by script above)

#### 3. Update DNS
Point visurena.com to CloudFront domain (provided by script)

### Every Deploy After Setup:

#### Just merge to main branch:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

**That's it!** Website deploys automatically to visurena.com in 5 minutes.

---

## 📝 Add Content

### Add New Video:
1. Edit `visurena-next/content-config.json`
2. Add to `movies` or `music` array
3. Save → See changes instantly in dev

### Add New Blog Post:
1. Create `visurena-next/posts/my-post.html`
2. Use template from `HTML_BLOG_GUIDE.md`
3. Restart dev server → See in `/blog`

### Add Images:
1. Drop in `visurena-next/public/images/`
2. Reference as `/images/filename.jpg`
3. Use immediately

---

## 🎯 Complete Workflow

```bash
# 1. Local development
npm run dev                    # Work at localhost:3000

# 2. Test production
npm run build && npm run export
npx serve out                  # Test at localhost:8080

# 3. Deploy
git push origin main           # Auto-deploys to visurena.com
```

---

## 📚 Need Help?

- **Local testing**: See `SECURITY_DEPLOYMENT_GUIDE.md`
- **Adding content**: See `CONTENT_MANAGEMENT_GUIDE.md`
- **Blog posts**: See `HTML_BLOG_GUIDE.md`
- **Infrastructure**: See `DEPLOYMENT_GUIDE.md`

**Your modern website is ready! 🎉**