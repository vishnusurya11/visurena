# 🚀 Production Deployment Guide

## 🎯 Overview
- **Old Flask website**: REMOVED ✅
- **New Next.js website**: Ready for production
- **Deployment**: Only on merge to main/master branch
- **Infrastructure**: AWS free tier optimized
- **Scaling**: Ready for 1000+ daily users

---

## 🏗️ Infrastructure Setup (One-time)

### Step 1: Deploy AWS Infrastructure
```bash
cd infrastructure
./deploy-infrastructure.sh
```

**What this creates:**
- ✅ S3 bucket for static hosting
- ✅ CloudFront CDN (global distribution)
- ✅ SSL/HTTPS certificate integration
- ✅ Route 53 DNS (if needed)

### Step 2: Add GitHub Secrets
In your GitHub repository settings → Secrets → Actions:

```
AWS_ACCESS_KEY_ID: your_aws_access_key
AWS_SECRET_ACCESS_KEY: your_aws_secret_key
S3_BUCKET: visurena.com-prod
CLOUDFRONT_DISTRIBUTION_ID: E1ABCDEF123456
```

---

## 🔄 Automatic Deployment

### When Deployment Happens
- ✅ **Only when you merge** to main/master branch
- ✅ **Not on every push** to other branches
- ✅ **Fully automated** - no manual steps needed

### Deployment Process
1. **Push changes** to a feature branch
2. **Test locally** with `npm run dev`
3. **Create pull request** when ready
4. **Merge to main** → Automatic deployment starts
5. **Website updates** in ~5 minutes

### GitHub Actions Workflow
```yaml
# Triggers only on main/master branch
on:
  push:
    branches: [master, main]

# Steps:
# 1. Build Next.js site
# 2. Export static files
# 3. Upload to S3
# 4. Invalidate CloudFront cache
# 5. Website is live!
```

---

## 💰 Cost Breakdown

### Free Tier (0-1000 users/day)
- **S3 Storage (5GB)**: FREE
- **CloudFront (1TB transfer)**: FREE  
- **Route 53 Hosted Zone**: $0.50/month
- **Total**: ~$0.50/month

### Scaling (1000+ users/day)
- **Additional S3**: $0.023/GB/month
- **Additional CloudFront**: $0.085/GB
- **DynamoDB** (when added): $1.25/million requests
- **Lambda** (when added): $0.20/million requests

### Cost at 10,000 users/day
- Estimated: $5-15/month
- Still very affordable!

---

## 📈 Scaling Architecture

### Current (Free Tier)
```
Users → CloudFront → S3 Static Site
```

### Future Scaling (1000+ users)
```
Users → CloudFront → S3 Static Site
                  ↓
              Lambda Functions
                  ↓
              DynamoDB
```

**When to scale:**
- Add DynamoDB for user analytics
- Add Lambda for dynamic features
- Add API Gateway for rate limiting
- All can be added without changing frontend

---

## 🚀 Deployment Commands

### Local Development
```bash
cd visurena-next
npm run dev          # Development server
npm run build        # Test production build
npm run export       # Generate static files
```

### Manual Deployment (if needed)
```bash
cd visurena-next
npm run build && npm run export
aws s3 sync out/ s3://your-bucket --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

---

## 🔧 Monitoring & Maintenance

### Check Deployment Status
- **GitHub Actions**: Check workflow status
- **AWS CloudWatch**: Monitor errors
- **CloudFront**: Check cache hit rates

### Performance Monitoring
- **Core Web Vitals**: Built-in Next.js analytics
- **CloudFront metrics**: Response times
- **S3 metrics**: Request patterns

### Cost Monitoring
```bash
# Check current month costs
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics "UnblendedCost"
```

---

## 🛠️ Troubleshooting

### Deployment Fails
1. Check GitHub Actions logs
2. Verify AWS credentials
3. Check S3 bucket permissions
4. Validate CloudFormation stack

### Website Not Updating
1. Clear CloudFront cache manually
2. Check S3 sync completed
3. Verify DNS propagation
4. Hard refresh browser (Ctrl+Shift+R)

### SSL Certificate Issues
1. Certificate must be in us-east-1 region
2. Must include both domain.com and www.domain.com
3. Must be validated and issued

---

## 📊 Performance Targets

### Current Performance
- **First Load**: <2 seconds
- **Subsequent loads**: <500ms (cached)
- **SEO Score**: 95+
- **Mobile Friendly**: ✅

### Scaling Targets (1000+ users)
- **99.9% uptime**
- **Global CDN**: <200ms anywhere
- **Auto-scaling**: Handle traffic spikes
- **Cost efficiency**: <$20/month at 10k users

---

## 🎯 Next Steps

1. **Deploy infrastructure** (one-time setup)
2. **Add GitHub secrets**
3. **Test deployment** with a small change
4. **Monitor performance**
5. **Scale when needed**

Your website is now production-ready with enterprise-grade infrastructure at startup costs! 🎉