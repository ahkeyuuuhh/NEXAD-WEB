# NEXAD Website Deployment Guide

## 🚀 Quick Deployment Options

### 1. GitHub Pages (Recommended)
**Free hosting directly from your GitHub repository**

1. Go to your repository: https://github.com/ahkeyuuuhh/NEXAD-WEB
2. Click **Settings** → **Pages**
3. Under "Source", select **Deploy from a branch**
4. Choose **main** branch and **/ (root)** folder
5. Click **Save**
6. Your site will be available at: `https://ahkeyuuuhh.github.io/NEXAD-WEB/`

### 2. Netlify (Easy with Custom Domain)
**Professional hosting with custom domain support**

1. Go to [netlify.com](https://netlify.com) and sign up
2. Click **New site from Git**
3. Connect your GitHub account
4. Select the `NEXAD-WEB` repository
5. Deploy settings:
   - **Build command**: Leave empty (static site)
   - **Publish directory**: Leave empty (root)
6. Click **Deploy site**
7. Optional: Add custom domain in site settings

### 3. Vercel (Fast Global CDN)
**High-performance hosting with automatic deployments**

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **New Project**
3. Import your `NEXAD-WEB` repository
4. Configure project:
   - **Framework Preset**: Other
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
5. Click **Deploy**

## 📱 Adding Real App Screenshots

### Step 1: Take Screenshots
From your NEXAD mobile app, capture:
- **Main dashboard** (student or teacher view)
- **Consultation booking interface**
- **Classroom management screen**
- **Chat/messaging interface**

### Step 2: Optimize Images
- **Size**: 375x812px (iPhone dimensions work best)
- **Format**: JPG for photos, PNG for UI screenshots
- **Compression**: Aim for 50-100KB per image
- **Tools**: Use TinyPNG, ImageOptim, or similar

### Step 3: Add to Website
Replace placeholder references in `index.html`:
```html
<!-- Update these src attributes -->
<img src="./assets/app-screenshot-1.jpg" alt="NEXAD App Interface">
<img src="./assets/app-screenshot-2.jpg" alt="Student Dashboard">
<img src="./assets/app-screenshot-3.jpg" alt="Consultation Booking">
<img src="./assets/app-screenshot-4.jpg" alt="Teacher Dashboard">
```

## 🔗 Updating Download Links

### App Store Links
Replace `#` in download buttons with actual links:

```html
<!-- iOS App Store -->
<a href="https://apps.apple.com/app/nexad/id[YOUR_APP_ID]" class="download-btn ios-btn">

<!-- Google Play Store -->
<a href="https://play.google.com/store/apps/details?id=com.university.nexad" class="download-btn android-btn">

<!-- Desktop Download -->
<a href="./downloads/nexad-desktop.dmg" class="download-btn desktop-btn">
```

## 🎨 Customization Options

### Colors
Update the CSS custom properties in `styles/main.css`:
```css
:root {
    --color-accent-orange: #F97316;  /* Primary accent color */
    --color-ink-1: #111111;          /* Primary text */
    --color-surface: #FFFFFF;        /* Card backgrounds */
}
```

### Content
Edit `index.html` to update:
- Headlines and descriptions
- Feature descriptions
- Statistics (users, schools, uptime)
- Contact information
- Social media links

### Analytics
Add your tracking code before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🌐 Custom Domain Setup

### For GitHub Pages
1. Add a `CNAME` file to your repository root:
   ```
   nexad.app
   ```
2. Configure DNS with your domain provider:
   - **Type**: CNAME
   - **Name**: www (or @)
   - **Value**: ahkeyuuuhh.github.io

### For Netlify/Vercel
1. Go to your site dashboard
2. Navigate to **Domain settings**
3. Add your custom domain
4. Follow the DNS configuration instructions

## 📊 Performance Optimization

### Image Optimization
```bash
# Install imagemin (optional)
npm install -g imagemin-cli imagemin-mozjpeg imagemin-pngquant

# Optimize images
imagemin assets/*.jpg --out-dir=assets/optimized --plugin=mozjpeg
imagemin assets/*.png --out-dir=assets/optimized --plugin=pngquant
```

### CDN Setup
For better global performance, consider:
- **Cloudflare**: Free CDN with caching
- **AWS CloudFront**: Enterprise-grade CDN
- **KeyCDN**: Affordable global distribution

## 🔒 Security Headers

Add security headers via hosting platform:

### Netlify (_headers file)
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'
```

### Vercel (vercel.json)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

## 📈 SEO Optimization

### Meta Tags
Already included in `index.html`:
- Title and description
- Open Graph tags for social media
- Twitter Card tags
- Structured data (can be added)

### Sitemap
Create `sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://nexad.app/</loc>
    <lastmod>2026-03-16</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
```

## 🚨 Troubleshooting

### Common Issues

**Images not loading**
- Check file paths are correct
- Ensure images are in the `assets/` directory
- Verify file extensions match HTML references

**Mobile menu not working**
- Check JavaScript is loading
- Verify no console errors
- Test on actual mobile devices

**Slow loading**
- Optimize images (compress to <100KB each)
- Enable gzip compression on server
- Use WebP format with JPG fallback

**Deployment fails**
- Check all file paths are relative
- Ensure no missing dependencies
- Verify repository permissions

## 📞 Support

For deployment issues:
1. Check the hosting platform's documentation
2. Review browser console for errors
3. Test on multiple devices and browsers
4. Contact hosting support if needed

---

**Your NEXAD marketing website is ready to drive app downloads! 🚀**