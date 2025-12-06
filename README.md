# ViSuReNa Website

A modern, responsive website built with Next.js, featuring movies, music, games, and blog content.

## 🚀 Quick Start

### Local Development

```bash
# Navigate to project
cd visurena-next

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Build & Test

```bash
# Build for production
npm run build

# Test production build locally
npm run start

# Generate static export
npm run export
```

## 📁 Project Structure

```
visurena/
├── visurena-next/          # Main Next.js application
│   ├── pages/             # Website pages
│   ├── components/        # React components
│   ├── posts/             # Blog posts (markdown/html)
│   ├── public/images/     # Static images
│   └── content-config.json # Movies/music content
├── infrastructure/         # AWS deployment files
└── docs/                  # Detailed documentation
```

## 🚀 Deployment

### One-time Infrastructure Setup

```bash
cd infrastructure
./deploy-infrastructure.sh
```

### GitHub Actions Setup

Add these secrets in GitHub Settings → Secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET`
- `CLOUDFRONT_DISTRIBUTION_ID`

Deployment happens automatically when you merge to main branch.

## 📝 Content Management

### Adding Blog Posts
Drop `.md` or `.html` files in `visurena-next/posts/`

### Adding Movies/Music
Edit `visurena-next/content-config.json`

## 📚 Documentation

For detailed guides, see the `docs/` folder:
- [Blog Guide](docs/blog-guide.md) - How to create blog posts
- [Content Management](docs/content-management.md) - Managing movies/music
- [Testing Guide](docs/testing.md) - Testing procedures
- [DNS Setup](docs/dns-setup.md) - Domain configuration
- [Security Guide](docs/security.md) - Security best practices

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Hosting**: AWS S3 + CloudFront CDN
- **Deployment**: GitHub Actions
- **Content**: Markdown/HTML for blogs, JSON for media

## 📋 Requirements

- Node.js 18+
- AWS CLI (for deployment)
- GitHub account (for automated deployment)

## 🧪 Testing

```bash
# Run development server
npm run dev

# Check TypeScript
npm run type-check

# Build and preview
npm run build && npm run start

npm run build
npx serve@latest out
```

## 🌐 Live Site

Visit: [https://visurena.com](https://visurena.com)

---

For questions or issues, check the `docs/` folder for detailed guides.