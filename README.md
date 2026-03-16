# NEXAD Marketing Website

A high-conversion marketing website for the NEXAD AI-Enhanced Consultation System mobile app. Built with modern web technologies and designed to match the app's monochrome aesthetic.

## 🎯 Purpose

This website serves as the primary distribution hub for the NEXAD mobile application, featuring:
- **High-conversion design** optimized for app downloads
- **Mobile-first approach** for users visiting on their phones
- **Brand consistency** with the existing mobile app design system
- **Professional presentation** suitable for educational institutions

## 🎨 Design System

The website strictly follows NEXAD's monochrome design philosophy:

### Color Palette
- **Surfaces**: Light grey background (#F4F4F4), Pure white cards (#FFFFFF)
- **Text**: Near-black headings (#111111), Body text (#3D3D3D), Secondary text (#737373)
- **Accents**: Orange highlights (#F97316) for CTAs and interactive elements
- **Borders**: Light grey (#E8E8E8) for subtle divisions

### Typography
- **Primary Font**: Inter (web-safe system fonts as fallback)
- **Hierarchy**: Bold headings (600-700 weight), Regular body text (400 weight)
- **Spacing**: Generous whitespace for professional, breathing layout

### Components
- **Buttons**: Filled (black), Outline (white with black border), Ghost (light grey)
- **Cards**: White background, subtle shadows, rounded corners (16-20px radius)
- **Phone Mockups**: CSS-generated frames matching real device proportions

## 📱 Features

### Hero Section
- Compelling headline with orange accent text
- Prominent download buttons for all platforms
- Statistics showcase (users, schools, uptime)
- Animated phone mockup with app screenshot

### Features Grid
- 6-column responsive layout highlighting key value propositions
- Icon-based visual hierarchy
- Hover effects and animations

### App Preview
- Multi-device mockup showcase
- 3D perspective effects for visual depth
- Screenshots of actual app interfaces

### Download Section
- Platform-specific download buttons (iOS, Android, Desktop)
- Trust indicators (free, secure, regular updates)
- Clear call-to-action hierarchy

### Footer
- Comprehensive link structure
- Social media integration
- Legal and support links

## 🛠 Technical Stack

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern features (Grid, Flexbox, Custom Properties)
- **Vanilla JavaScript**: Lightweight, no framework dependencies
- **Responsive Design**: Mobile-first approach with breakpoints
- **Performance Optimized**: Lazy loading, efficient animations

## 📁 Project Structure

```
nexad-website/
├── index.html              # Main HTML file
├── styles/
│   └── main.css            # Complete CSS with design system
├── scripts/
│   └── main.js             # Interactive functionality
├── assets/
│   ├── logo.svg            # NEXAD logo
│   ├── README.md           # Asset guidelines
│   └── [screenshots]       # App screenshots (to be added)
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser
- Web server (for local development)

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/ahkeyuuuhh/NEXAD-WEB.git
   cd NEXAD-WEB
   ```

2. Serve the files using a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. Open `http://localhost:8000` in your browser

### Adding App Screenshots
1. Take screenshots from the NEXAD mobile app (375x812px recommended)
2. Save as JPG files in the `assets/` directory:
   - `app-screenshot-1.jpg` - Main dashboard
   - `app-screenshot-2.jpg` - Student view
   - `app-screenshot-3.jpg` - Consultation booking
   - `app-screenshot-4.jpg` - Teacher dashboard

## 📊 Performance Features

- **Lazy Loading**: Images load as they enter viewport
- **Smooth Animations**: CSS-based transitions and transforms
- **Optimized Assets**: Compressed images and efficient code
- **Mobile Performance**: Lightweight JavaScript, efficient CSS

## ♿ Accessibility

- **WCAG AA Compliant**: High contrast ratios, keyboard navigation
- **Semantic HTML**: Proper heading hierarchy, ARIA labels
- **Focus Management**: Visible focus indicators, logical tab order
- **Screen Reader Support**: Alt text, descriptive link text

## 🔧 Customization

### Updating Colors
Modify CSS custom properties in `styles/main.css`:
```css
:root {
    --color-accent-orange: #F97316;  /* Change primary accent */
    --color-ink-1: #111111;          /* Change primary text */
    /* ... other variables */
}
```

### Adding Sections
1. Add HTML structure to `index.html`
2. Style with CSS following the design system patterns
3. Add any interactive behavior to `scripts/main.js`

### Download Links
Update the `href` attributes in the download buttons to point to actual app store links or direct download files.

## 🚀 Deployment

### GitHub Pages
1. Push to the `main` branch
2. Enable GitHub Pages in repository settings
3. Select source as "Deploy from a branch"
4. Choose `main` branch and `/ (root)` folder

### Custom Domain
1. Add a `CNAME` file with your domain
2. Configure DNS to point to GitHub Pages
3. Enable HTTPS in repository settings

### Other Platforms
The website is static HTML/CSS/JS and can be deployed to:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any web hosting service

## 📈 Analytics & Tracking

The JavaScript includes placeholder functions for analytics tracking:
- Download button clicks
- Section scroll tracking
- Form submissions (if added)

Integrate with your preferred analytics platform (Google Analytics, Mixpanel, etc.).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes following the design system
4. Test on multiple devices and browsers
5. Submit a pull request

## 📄 License

This project is part of the NEXAD application suite. All rights reserved.

## 📞 Support

For questions about the website or NEXAD app:
- Create an issue in this repository
- Contact the development team
- Check the NEXAD app documentation

---

**Built with ❤️ for modern education**
A marketing website for Nexad
