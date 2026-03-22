// Main Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
    setupEventListeners();
    setupAnimations();
});

// Initialize website functionality
function initializeWebsite() {
    // Update download counters
    updateDownloadStats();
    
    // Setup navigation scroll effects
    setupScrollEffects();
    
    // Initialize mobile navigation
    initializeMobileNav();
    
    // Setup smooth scrolling
    setupSmoothScrolling();
}

// Setup event listeners
function setupEventListeners() {
    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('nav-links-open');
            navToggle.classList.toggle('nav-toggle-open');
        });
        
        // Close mobile menu when clicking on a link
        const navItems = navLinks.querySelectorAll('.nav-link');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('nav-links-open');
                navToggle.classList.remove('nav-toggle-open');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('nav-links-open');
                navToggle.classList.remove('nav-toggle-open');
            }
        });
    }
    
    // Download button tracking
    const downloadBtns = document.querySelectorAll('.download-btn, .btn[href*="apk"]');
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const platform = this.classList.contains('android-btn') ? 'android' : 'ios';
            trackDownload(platform);
        });
    });
    
    // Demo button interactions
    const demoBtns = document.querySelectorAll('.demo-btn');
    demoBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const demoType = this.dataset.demo;
            trackDemoView(demoType);
        });
    });
    
    // Contact form quick access
    const contactLinks = document.querySelectorAll('a[href="contact.html"]');
    contactLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Add subject parameter if coming from a specific context
            const context = this.closest('.feature-card, .info-item');
            if (context) {
                e.preventDefault();
                const subject = context.textContent.toLowerCase().includes('technical') ? 'technical' : 'general';
                window.location.href = `contact.html?subject=${subject}`;
            }
        });
    });
}

// Setup scroll effects
function setupScrollEffects() {
    const nav = document.querySelector('.nav');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Add/remove scrolled class for nav styling
        if (currentScrollY > 50) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }
        
        // Keep nav always visible (removed hide/show logic)
        lastScrollY = currentScrollY;
    });
    
    // Parallax effect for hero section (reduced for video)
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.2; // Reduced parallax for video
            heroVisual.style.transform = `translateY(${rate}px)`;
        });
    }
}

// Initialize mobile navigation
function initializeMobileNav() {
    // Add mobile navigation styles if not already present
    if (!document.querySelector('#mobile-nav-styles')) {
        const style = document.createElement('style');
        style.id = 'mobile-nav-styles';
        style.textContent = `
            @media (max-width: 768px) {
                .nav-links-open {
                    transform: translateY(0) !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                }
                
                .nav-toggle-open span:nth-child(1) {
                    transform: rotate(45deg) translate(5px, 5px);
                }
                
                .nav-toggle-open span:nth-child(2) {
                    opacity: 0;
                }
                
                .nav-toggle-open span:nth-child(3) {
                    transform: rotate(-45deg) translate(7px, -6px);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Setup smooth scrolling for anchor links
function setupSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const navHeight = document.querySelector('.nav').offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const navLinks = document.querySelector('.nav-links');
                const navToggle = document.querySelector('.nav-toggle');
                if (navLinks && navToggle) {
                    navLinks.classList.remove('nav-links-open');
                    navToggle.classList.remove('nav-toggle-open');
                }
            }
        });
    });
}

// Setup animations
function setupAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .phone-mockup, .stat');
    animateElements.forEach(el => observer.observe(el));
    
    // Phone mockup hover effects
    const phoneMockups = document.querySelectorAll('.phone-mockup');
    phoneMockups.forEach(phone => {
        phone.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) rotateY(5deg)';
        });
        
        phone.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotateY(0deg)';
        });
    });
}

// Update download statistics
function updateDownloadStats() {
    // Get stored download count or initialize
    let downloads = parseInt(localStorage.getItem('nexad_downloads') || '1247');
    
    // Update display
    const downloadCounters = document.querySelectorAll('#totalDownloads');
    downloadCounters.forEach(counter => {
        counter.textContent = downloads.toLocaleString();
    });
    
    // Simulate gradual increase (for demo purposes)
    setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance every interval
            downloads += Math.floor(Math.random() * 3) + 1;
            localStorage.setItem('nexad_downloads', downloads.toString());
            downloadCounters.forEach(counter => {
                counter.textContent = downloads.toLocaleString();
            });
        }
    }, 30000); // Check every 30 seconds
}

// Track download attempts
function trackDownload(platform) {
    const downloads = JSON.parse(localStorage.getItem('nexad_download_tracking') || '{}');
    const today = new Date().toISOString().split('T')[0];
    
    if (!downloads[today]) {
        downloads[today] = { android: 0, ios: 0 };
    }
    
    downloads[today][platform]++;
    localStorage.setItem('nexad_download_tracking', JSON.stringify(downloads));
    
    // Show download started notification
    showNotification(`Download started for ${platform.toUpperCase()}`, 'success');
}

// Track demo views
function trackDemoView(demoType) {
    const views = JSON.parse(localStorage.getItem('nexad_demo_views') || '{}');
    views[demoType] = (views[demoType] || 0) + 1;
    views.lastViewed = new Date().toISOString();
    localStorage.setItem('nexad_demo_views', JSON.stringify(views));
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                max-width: 300px;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-success {
                border-left: 4px solid #22c55e;
            }
            
            .notification-error {
                border-left: 4px solid #ef4444;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px;
            }
            
            .notification-message {
                font-size: 14px;
                color: #333;
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #666;
                margin-left: 12px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

// Handle keyboard navigation
document.addEventListener('keydown', function(e) {
    // Escape key to close mobile menu
    if (e.key === 'Escape') {
        const navLinks = document.querySelector('.nav-links');
        const navToggle = document.querySelector('.nav-toggle');
        if (navLinks && navToggle) {
            navLinks.classList.remove('nav-links-open');
            navToggle.classList.remove('nav-toggle-open');
        }
    }
});

// Handle form submissions (if any)
function handleFormSubmission(form, successMessage) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('btn-loading');
        
        // Simulate form submission
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-loading');
            showNotification(successMessage, 'success');
            form.reset();
        }, 2000);
    });
}

// Initialize contact forms if present
const contactForms = document.querySelectorAll('form[data-contact-form]');
contactForms.forEach(form => {
    handleFormSubmission(form, 'Message sent successfully!');
});

// Performance monitoring
function monitorPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            
            // Store performance data
            const perfStats = JSON.parse(localStorage.getItem('nexad_performance') || '{}');
            perfStats.lastLoadTime = loadTime;
            perfStats.timestamp = new Date().toISOString();
            localStorage.setItem('nexad_performance', JSON.stringify(perfStats));
        });
    }
}

// Initialize performance monitoring
monitorPerformance();

// Service Worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Make functions available globally
window.showNotification = showNotification;
window.trackDownload = trackDownload;
window.trackDemoView = trackDemoView;