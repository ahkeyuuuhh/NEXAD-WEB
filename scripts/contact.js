// Contact Page JavaScript - Supabase Auth Implementation
// Using ES6 modules for proper Supabase import

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

let supabase = null;
let currentUser = null;

// Initialize Supabase
console.log('📜 Contact.js loaded');

try {
    const supabaseUrl = 'https://klrfkhyvgtffsjpdioax.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscmZraHl2Z3RmZnNqcGRpb2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNzE5MDUsImV4cCI6MjA4NTY0NzkwNX0.9_AjIcRSVNjgpPcmBsP-UCjLpQyIqt3Za41KK9IqrgM';
    
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client initialized');
} catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, initializing...');
    initializeContactPage();
    setupEventListeners();
    checkExistingSession();
});

// Initialize contact page
function initializeContactPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject');
    if (subject) {
        const subjectSelect = document.getElementById('subject');
        if (subjectSelect) {
            subjectSelect.value = subject;
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        const navItems = navLinks.querySelectorAll('.nav-link');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
}

// Check for existing session
async function checkExistingSession() {
    if (!supabase) {
        console.error('❌ Supabase not initialized');
        // Redirect to login page if not authenticated
        window.location.href = 'login.html';
        return;
    }
    
    try {
        console.log('🔵 [Session] Checking for existing session...');
        
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('🔴 [Session] Error checking session:', error);
            window.location.href = 'login.html';
            return;
        }

        if (session && session.user) {
            console.log('🟢 [Session] Existing session found:', session.user.email);
            currentUser = {
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                email: session.user.email,
                picture: session.user.user_metadata?.avatar_url || null
            };
            
            // Update nav link to show logout
            updateNavLink();
            showContactForm();
        } else {
            console.log('🟡 [Session] No existing session found, redirecting to login...');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('🔴 [Session] Exception:', error);
        window.location.href = 'login.html';
    }
}

// Update navigation link
function updateNavLink() {
    const loginNavLink = document.getElementById('loginNavLink');
    if (loginNavLink && currentUser) {
        loginNavLink.textContent = 'Logout';
        loginNavLink.href = '#';
        loginNavLink.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
}



// Show contact form after authentication
function showContactForm() {
    const contactForm = document.getElementById('contactForm');
    const userInfoDisplay = document.getElementById('userInfoDisplay');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!contactForm) return;
    
    contactForm.style.display = 'flex';
    
    if (currentUser && userInfoDisplay) {
        // Show user info
        userInfoDisplay.style.display = 'flex';
        
        if (userName) userName.textContent = currentUser.name;
        if (userEmailDisplay) userEmailDisplay.textContent = currentUser.email;
        
        // Set avatar
        if (userAvatar) {
            if (currentUser.picture) {
                userAvatar.style.backgroundImage = `url(${currentUser.picture})`;
                userAvatar.style.backgroundSize = 'cover';
                userAvatar.textContent = '';
            } else {
                userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
            }
        }
        
        // Setup logout button
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    }
}

// Handle logout
async function handleLogout() {
    if (supabase) {
        await supabase.auth.signOut();
    }
    currentUser = null;
    
    showNotification('Logged out successfully', 'success');
    
    // Redirect to login page
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = contactForm.querySelector('.submit-btn-compact');
    
    const formData = new FormData(contactForm);
    const contactData = {
        name: currentUser?.name || 'Unknown',
        email: currentUser?.email || 'unknown@email.com',
        message: formData.get('message'),
        subject: formData.get('subject') || 'General Inquiry',
        timestamp: new Date().toISOString(),
        user_info: currentUser ? {
            name: currentUser.name,
            email: currentUser.email,
            picture: currentUser.picture
        } : null
    };
    
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    
    try {
        // Try to save to database if available
        let savedToDatabase = false;
        let contactId = null;
        
        if (supabase) {
            try {
                console.log('📤 Attempting to save to database...');
                
                const { data, error } = await supabase
                    .from('contacts')
                    .insert([{
                        name: contactData.name,
                        email: contactData.email,
                        message: contactData.message,
                        subject: contactData.subject,
                        user_info: contactData.user_info
                    }])
                    .select()
                    .single();
                
                if (!error && data) {
                    console.log('✅ Contact saved to database:', data);
                    savedToDatabase = true;
                    contactId = data.id;
                } else {
                    console.warn('⚠️ Database save failed:', error);
                }
            } catch (dbError) {
                console.warn('⚠️ Database error:', dbError);
            }
        }
        
        // Always save to localStorage as backup
        const contacts = JSON.parse(localStorage.getItem('nexad_contacts') || '[]');
        contacts.push({
            ...contactData,
            id: contactId || 'local_' + Date.now(),
            savedToDatabase: savedToDatabase
        });
        localStorage.setItem('nexad_contacts', JSON.stringify(contacts));
        console.log('✅ Contact saved to localStorage');
        
        // Show success message
        contactForm.style.display = 'none';
        successMessage.style.display = 'block';
        
        console.log('✅ Contact form submitted successfully');
        
        // Reset form after 3 seconds and show form again (user stays logged in)
        setTimeout(() => {
            contactForm.reset();
            contactForm.style.display = 'flex';
            successMessage.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 3000);
        
    } catch (error) {
        console.error('❌ Error submitting form:', error);
        showNotification(
            'There was an error sending your message. Please try again.',
            'error'
        );
        
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                max-width: 350px;
            }
            .notification.show { transform: translateX(0); }
            .notification-error { border-left: 4px solid #ef4444; }
            .notification-success { border-left: 4px solid #22c55e; }
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
            }
            .notification-message {
                font-size: 14px;
                color: #333;
                line-height: 1.5;
            }
            .notification-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #666;
                margin-left: 16px;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

console.log('✅ Contact.js fully loaded and ready');
