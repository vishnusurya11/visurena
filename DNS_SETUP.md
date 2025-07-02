# 🌐 DNS Setup for visurena.com

## Overview
Since you already own visurena.com, you just need to point it to the AWS CloudFront distribution that will be created.

## 🚀 After Infrastructure Deployment

### Step 1: Run Infrastructure Deployment
```bash
cd infrastructure
./deploy-infrastructure.sh
```

### Step 2: Get CloudFront Domain
The script will output something like:
```
CloudFront Domain: d1234567890.cloudfront.net
```

### Step 3: Update DNS Records
In your domain registrar (where you bought visurena.com), create these records:

#### A Record (or CNAME)
```
Type: A (or CNAME if required by registrar)
Name: @ (or leave blank for root domain)
Value: d1234567890.cloudfront.net
TTL: 300 (or default)
```

#### WWW Subdomain
```
Type: CNAME
Name: www
Value: d1234567890.cloudfront.net
TTL: 300 (or default)
```

## 🔧 Common Domain Registrars

### GoDaddy
1. Go to GoDaddy DNS Management
2. Edit A record for "@" → Point to CloudFront domain
3. Add CNAME for "www" → Point to CloudFront domain

### Namecheap
1. Go to Domain List → Manage
2. Advanced DNS tab
3. Edit A record for "@" → Point to CloudFront domain
4. Add CNAME for "www" → Point to CloudFront domain

### Cloudflare
1. DNS tab in Cloudflare dashboard
2. Edit A record for "visurena.com" → Point to CloudFront domain
3. Add CNAME for "www" → Point to CloudFront domain
4. Set proxy status to "DNS only" (gray cloud)

### Route 53 (if using AWS DNS)
1. Find hosted zone for visurena.com
2. Create alias A record → Point to CloudFront distribution
3. Create alias CNAME for www → Point to CloudFront distribution

## ⏱️ Propagation Time
- **Typical**: 15 minutes to 2 hours
- **Maximum**: Up to 48 hours
- **Check status**: Use DNS checker tools online

## 🧪 Testing DNS

### Check DNS Propagation
```bash
# Check if DNS is working
nslookup visurena.com
dig visurena.com

# Check from different locations
# Use online tools like whatsmydns.net
```

### Test Website
1. Wait for DNS propagation
2. Visit https://visurena.com
3. Should show your new website
4. Check both visurena.com and www.visurena.com

## 🔒 SSL Certificate

The infrastructure automatically handles SSL:
- ✅ Certificate created for visurena.com and www.visurena.com
- ✅ HTTPS redirect enabled
- ✅ Modern TLS settings

## 📋 Summary Checklist

After infrastructure deployment:
- [ ] Get CloudFront domain from deployment output
- [ ] Update A record: visurena.com → CloudFront domain
- [ ] Update CNAME: www.visurena.com → CloudFront domain
- [ ] Wait for DNS propagation
- [ ] Test https://visurena.com
- [ ] Test https://www.visurena.com
- [ ] Verify SSL certificate is working

## 🆘 Troubleshooting

### Website not loading
1. Check DNS propagation with online tools
2. Verify CloudFront distribution is deployed
3. Check S3 bucket has content
4. Clear browser cache

### SSL errors
1. Certificate should auto-provision
2. May take 20-40 minutes after DNS points correctly
3. Certificate must be validated

### "Access Denied" errors
1. Check S3 bucket policy
2. Verify CloudFront origin settings
3. Check index.html exists in S3

Your domain setup will be complete once DNS propagates! 🎉