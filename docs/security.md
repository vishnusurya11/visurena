# 🔐 Secure Deployment & Testing Guide

## 🛡️ Security First - No Credentials in Code

### ❌ NEVER Commit These:
- AWS Access Keys
- Secret Keys  
- API Keys
- Passwords
- Private certificates

### ✅ Safe to Commit:
- Code files
- Configuration templates
- Documentation
- Public domain names

---

## 🔑 How GitHub Deploys to Your AWS Account

### Step 1: GitHub Secrets (Secure Vault)
GitHub has a **secure secrets vault** where you store sensitive credentials. These are:
- **Encrypted** and never visible in code
- **Only accessible** during GitHub Actions
- **Not exposed** in logs or public

### Step 2: GitHub Actions Workflow
When you merge to main branch:
1. **GitHub Actions** starts automatically
2. **Retrieves secrets** from secure vault
3. **Uses AWS credentials** to deploy
4. **No credentials** ever touch your code

### Step 3: AWS Authentication Flow
```
Your Merge → GitHub Actions → AWS Credentials (from secrets) → Deploy to S3/CloudFront
```

---

## 🔧 Setting Up Secure Deployment

### Step 1: Create AWS Access Keys
1. **Login to AWS Console**
2. **Go to IAM** → Users
3. **Create new user** (e.g., "github-deployer")
4. **Attach policy**: 
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:ListBucket",
           "cloudfront:CreateInvalidation"
         ],
         "Resource": [
           "arn:aws:s3:::visurena.com-prod",
           "arn:aws:s3:::visurena.com-prod/*",
           "arn:aws:cloudfront::*:distribution/*"
         ]
       }
     ]
   }
   ```
5. **Download Access Key ID and Secret**

### Step 2: Add Secrets to GitHub
1. **Go to your GitHub repository**
2. **Settings** → **Secrets and variables** → **Actions**
3. **Click "New repository secret"**
4. **Add these secrets**:

```
Name: AWS_ACCESS_KEY_ID
Value: AKIA... (your access key)

Name: AWS_SECRET_ACCESS_KEY  
Value: abc123... (your secret key)

Name: S3_BUCKET
Value: visurena.com-prod

Name: CLOUDFRONT_DISTRIBUTION_ID
Value: E1234567890 (from infrastructure deployment)
```

### Step 3: Security Verification
- ✅ **Check repository is private** (or public without secrets)
- ✅ **Secrets are encrypted** in GitHub
- ✅ **No .env files** committed
- ✅ **No hardcoded credentials** in code

---

## 🧪 Local Testing Process

### Step 1: Development Testing
```bash
# Navigate to project
cd visurena-next

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```
**Result**: Website runs at http://localhost:3000 with hot reload

### Step 2: Production Build Testing
```bash
# Test production build locally
npm run build
npm run start
```
**Result**: Tests exactly what will be deployed

### Step 3: Static Export Testing
```bash
# Generate static files (what gets deployed)
npm run export

# Preview static site
npx serve out -p 8080
```
**Result**: View at http://localhost:8080 - exact copy of production

### Step 4: Content Testing Checklist
- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Videos play properly
- [ ] Blog posts open and display correctly
- [ ] Images load
- [ ] Mobile responsive (resize browser)
- [ ] No console errors (F12 → Console)

---

## 🚀 Production Deployment Process

### Deployment Workflow:

#### Step 1: Make Changes Locally
```bash
# Work on feature branch
git checkout -b feature/new-content
# Make your changes
# Test locally with npm run dev
```

#### Step 2: Test Thoroughly
```bash
# Test production build
npm run build && npm run export
npx serve out

# Verify everything works at localhost:8080
```

#### Step 3: Create Pull Request
```bash
# Commit changes
git add .
git commit -m "Add new video content"
git push origin feature/new-content

# Create PR on GitHub
# Review changes
```

#### Step 4: Merge to Main (Triggers Deployment)
```bash
# Merge PR on GitHub OR:
git checkout main
git merge feature/new-content
git push origin main
```

#### Step 5: Automatic Deployment Happens
1. **GitHub Actions detects** push to main
2. **Builds Next.js site** (`npm run build && npm run export`)
3. **Uploads to S3** using your AWS credentials
4. **Invalidates CloudFront** cache
5. **Website updates** at visurena.com (takes 2-5 minutes)

### Step 6: Verify Production
- Visit https://visurena.com
- Check changes are live
- Test on mobile
- Verify performance

---

## 📊 Monitoring Deployment

### GitHub Actions Status
1. **Go to GitHub repository**
2. **Actions tab**
3. **See deployment progress/results**

### Deployment Logs
```
✅ Checkout Repository
✅ Setup Node.js  
✅ Install Dependencies
✅ Build Next.js Site
✅ Deploy to S3
✅ Invalidate CloudFront Cache
```

### AWS Monitoring
- **S3**: Check files uploaded
- **CloudFront**: Monitor cache invalidation
- **CloudWatch**: Check for errors

---

## 🔄 Deployment Timeline

### Immediate (0-2 minutes):
- ✅ GitHub Actions starts
- ✅ Build completes
- ✅ Files upload to S3

### Short term (2-5 minutes):
- ✅ CloudFront cache invalidates
- ✅ Changes visible globally

### DNS changes (if any):
- ⏳ Up to 48 hours for DNS propagation

---

## 🆘 Troubleshooting

### Deployment Fails
1. **Check GitHub Actions logs**
2. **Verify AWS credentials** in secrets
3. **Check S3 bucket exists**
4. **Verify permissions**

### Website Not Updating
1. **Hard refresh** browser (Ctrl+Shift+R)
2. **Check CloudFront invalidation** completed
3. **Wait 5-10 minutes** for global propagation
4. **Check GitHub Actions** completed successfully

### Security Issues
1. **Never commit** .env files
2. **Rotate AWS keys** if compromised
3. **Use minimal permissions** for deployment user
4. **Monitor AWS costs** regularly

---

## 🎯 Complete Workflow Example

### Adding New Video:

#### Local Development:
```bash
# 1. Edit content
nano visurena-next/content-config.json
# Add your new video

# 2. Test locally
cd visurena-next
npm run dev
# Check http://localhost:3000/movies

# 3. Test production build
npm run build && npm run export
npx serve out
# Check http://localhost:8080/movies
```

#### Production Deployment:
```bash
# 4. Commit and push
git add .
git commit -m "Add new movie: My Latest Film"
git push origin main

# 5. GitHub automatically deploys
# Wait 5 minutes

# 6. Check live site
# Visit https://visurena.com/movies
```

### Adding New Blog Post:

#### Local Development:
```bash
# 1. Create HTML file
nano visurena-next/posts/my-new-post.html
# Add your content

# 2. Add images (if any)
cp my-image.jpg visurena-next/public/images/

# 3. Test locally
npm run dev
# Check http://localhost:3000/blog
```

#### Production Deployment:
```bash
# 4. Commit and deploy
git add .
git commit -m "Add new blog post: My Latest Update"
git push origin main

# 5. Live in 5 minutes at:
# https://visurena.com/blog
```

---

## 🎉 Summary

**Your workflow:**
1. **Develop locally** → Test at localhost:3000
2. **Test production** → Test at localhost:8080  
3. **Merge to main** → Auto-deploys to visurena.com
4. **No manual AWS work** → All automated!

**Security guaranteed:**
- ✅ No credentials in code
- ✅ GitHub secrets encrypted
- ✅ Minimal AWS permissions
- ✅ Private repository recommended

Your deployment is now **secure, automated, and professional**! 🚀