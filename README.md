# NEXAD Website

A modern, responsive marketing website for the NEXAD AI-enhanced consultation system mobile app.

## 🚀 Features

- **Modern Design**: Clean, professional design matching the mobile app's aesthetic
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Interactive Components**: Smooth animations and hover effects
- **Admin Dashboard**: Complete admin panel for managing contacts and content
- **Contact System**: Google Sign-In integrated contact form
- **User Manual**: Comprehensive documentation for students and teachers
- **Performance Optimized**: Fast loading with service worker caching

## 📁 Project Structure

```
nexad-website/
├── index.html              # Main landing page
├── contact.html            # Contact form page
├── manual.html             # User manual page
├── admin.html              # Admin dashboard
├── sw.js                   # Service worker for caching
├── styles/
│   ├── main.css           # Main stylesheet with design system
│   ├── contact.css        # Contact page styles
│   ├── manual.css         # Manual page styles
│   └── admin.css          # Admin dashboard styles
├── scripts/
│   ├── main.js            # Main website functionality
│   ├── contact.js         # Contact form handling
│   ├── manual.js          # Manual navigation and features
│   └── admin.js           # Admin dashboard functionality
├── assets/
│   ├── light-hrLogo.png   # Light theme logo
│   ├── dark-hrLogo.png    # Dark theme logo
│   ├── favicon.ico        # Website favicon
│   └── [app-screenshots] # Mobile app screenshots
└── README.md              # This file
```

## 🎨 Design System

The website uses a monochrome design system that matches the NEXAD mobile app:

### Colors
- **Background**: #F4F4F4
- **Surface**: #FFFFFF
- **Primary Text**: #111111
- **Secondary Text**: #3D3D3D
- **Accent**: #737373
- **Borders**: #D9D9D9

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: 600-700 weight
- **Body Text**: 400-500 weight

### Components
- **Buttons**: Pill-shaped with hover effects
- **Cards**: Subtle shadows and rounded corners
- **Navigation**: Fixed header with blur effect
- **Phone Mockups**: 3D perspective effects

## 📱 Pages Overview

### Landing Page (index.html)
- Hero section with app preview
- Feature showcase
- App screenshots gallery
- Download links (Android APK)
- Footer with developer credit

### Contact Page (contact.html)
- Google Sign-In authentication
- Contact form with subject categories
- Contact information cards
- Success/error handling

### Manual Page (manual.html)
- Tabbed interface (Student/Teacher)
- Sidebar navigation
- Comprehensive documentation
- Search functionality (planned)
- Print/export options (planned)

### Admin Dashboard (admin.html)
- Secure Google Sign-In authentication
- Contact message management
- Manual content editor
- Analytics dashboard
- Export functionality

## 🔧 Setup & Configuration

### 1. Google Sign-In Setup
Replace `YOUR_GOOGLE_CLIENT_ID` in the following files:
- `contact.html` (line 47)
- `admin.html` (line 32)
- `scripts/admin.js` (line 8)

### 2. Admin Access
Update authorized admin emails in `scripts/admin.js`:
```javascript
const ADMIN_CONFIG = {
    authorizedEmails: [
        'admin@nexad.app',
        'your-email@domain.com'
    ]
};
```

### 3. Download Links
Update the Android APK download link in `index.html`:
```html
<a href="YOUR_APK_DOWNLOAD_URL" class="download-btn android-btn">
```

### 4. Assets
Add the following assets to the `assets/` folder:
- App screenshots for the preview section
- High-resolution logos
- App icons for download buttons

## 🚀 Deployment

### Static Hosting
The website is built with vanilla HTML, CSS, and JavaScript and can be deployed to any static hosting service:

- **Netlify**: Drag and drop the folder
- **Vercel**: Connect your Git repository
- **GitHub Pages**: Push to a GitHub repository
- **Firebase Hosting**: Use Firebase CLI
- **AWS S3**: Upload files to S3 bucket

### Domain Configuration
1. Point your domain to the hosting service
2. Update any hardcoded URLs in the code
3. Configure SSL certificate
4. Set up redirects if needed

## 📊 Analytics & Tracking

The website includes built-in analytics tracking:

### Local Storage Data
- Download attempts by platform
- Manual page views
- Contact form submissions
- Performance metrics

### Admin Dashboard
- View contact messages
- Export data as CSV
- Monitor user engagement
- Track manual usage

## 🔒 Security Features

- **Admin Authentication**: Google Sign-In with email whitelist
- **Contact Form**: Requires authentication to prevent spam
- **Data Storage**: Local storage for demo (replace with backend)
- **Input Validation**: Client-side form validation

## 🎯 Performance Optimizations

- **Service Worker**: Caches static assets for faster loading
- **Lazy Loading**: Images load only when needed
- **Minified Assets**: Compressed CSS and JavaScript
- **Responsive Images**: Optimized for different screen sizes
- **Smooth Animations**: Hardware-accelerated CSS transitions

## 🔄 Future Enhancements

### Planned Features
- [ ] Search functionality in manual
- [ ] PDF export for manual sections
- [ ] Real-time analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Progressive Web App (PWA) features
- [ ] Backend integration for contact forms
- [ ] Email notifications for admin
- [ ] Advanced analytics with charts

### Technical Improvements
- [ ] TypeScript conversion
- [ ] Build process with bundling
- [ ] Automated testing
- [ ] CI/CD pipeline
- [ ] Performance monitoring
- [ ] SEO optimizations
- [ ] Accessibility improvements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the NEXAD application suite developed by Aki Zita.

## 📞 Support

For technical support or questions about the website:
- Email: support@nexad.app
- Use the contact form on the website
- Check the manual for common questions

---

**Developed by Aki Zita** - Transforming educational consultations through AI-enhanced technology.