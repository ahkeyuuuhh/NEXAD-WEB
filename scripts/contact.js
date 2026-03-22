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
    
    // Google Sign-In button
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    if (googleSignInBtn) {
        console.log('✅ Found Google Sign-In button');
        googleSignInBtn.addEventListener('click', function(e) {
            console.log('🖱️ Button clicked!');
            e.preventDefault();
            handleGoogleSignIn();
        });
    } else {
        console.error('❌ Google Sign-In button not found!');
    }

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
        return;
    }
    
    try {
        console.log('🔵 [Session] Checking for existing session...');
        
        // Check for OAuth tokens in URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        
        if (accessToken) {
            console.log('🟢 [Session] Found OAuth tokens in URL');
            
            const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || ''
            });
            
            if (error) {
                console.error('🔴 [Session] Error setting session:', error);
                showNotification('Authentication failed. Please try again.', 'error');
                return;
            }
            
            if (data.session && data.session.user) {
                console.log('🟢 [Session] Session set successfully:', data.session.user.email);
                currentUser = {
                    name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'User',
                    email: data.session.user.email,
                    picture: data.session.user.user_metadata?.avatar_url || null
                };
                
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
                
                showContactForm();
                return;
            }
        }
        
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('🔴 [Session] Error checking session:', error);
            return;
        }

        if (session && session.user) {
            console.log('🟢 [Session] Existing session found:', session.user.email);
            currentUser = {
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                email: session.user.email,
                picture: session.user.user_metadata?.avatar_url || null
            };
            showContactForm();
        } else {
            console.log('🟡 [Session] No existing session found');
        }
    } catch (error) {
        console.error('🔴 [Session] Exception:', error);
    }
}

// Handle Google Sign-In
async function handleGoogleSignIn() {
    console.log('🚀 handleGoogleSignIn called!');
    
    if (!supabase) {
        console.error('❌ Supabase not initialized!');
        showNotification('Authentication system not ready. Please refresh the page.', 'error');
        return;
    }
    
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    if (!googleSignInBtn) {
        console.error('❌ Button element not found!');
        return;
    }
    
    const originalText = googleSignInBtn.innerHTML;
    
    try {
        googleSignInBtn.disabled = true;
        googleSignInBtn.innerHTML = '<span>Signing in...</span>';
        
        console.log('🔵 [OAuth] Starting Google OAuth...');
        
        const redirectTo = window.location.origin + window.location.pathname;
        console.log('🔵 [OAuth] Redirect URL:', redirectTo);
        
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectTo,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                }
            }
        });

        if (error) {
            console.error('🔴 [OAuth] Error:', error);
            throw error;
        }
        
        if (!data?.url) {
            console.error('🔴 [OAuth] No OAuth URL returned');
            throw new Error('Failed to get Google sign-in URL');
        }

        console.log('🟢 [OAuth] OAuth URL received');
        console.log('🔵 [OAuth] Redirecting to Google...');
        
    } catch (error) {
        console.error('🔴 [OAuth] Error:', error);
        
        showNotification(
            'Sign-in failed: ' + (error.message || 'Please try again'),
            'error'
        );
        
        googleSignInBtn.disabled = false;
        googleSignInBtn.innerHTML = originalText;
    }
}

// Show contact form after authentication
function showContactForm() {
    const authSection = document.getElementById('authSection');
    const contactForm = document.getElementById('contactForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    
    if (!authSection || !contactForm) return;
    
    authSection.style.display = 'none';
    contactForm.style.display = 'flex';
    
    if (currentUser) {
        nameInput.value = currentUser.name;
        emailInput.value = currentUser.email;
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = contactForm.querySelector('.submit-btn-modern');
    
    const formData = new FormData(contactForm);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message'),
        timestamp: new Date().toISOString(),
        userInfo: currentUser
    };
    
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    
    try {
        const contacts = JSON.parse(localStorage.getItem('nexad_contacts') || '[]');
        contacts.push(contactData);
        localStorage.setItem('nexad_contacts', JSON.stringify(contacts));
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        contactForm.style.display = 'none';
        successMessage.style.display = 'block';
        
        console.log('✅ Contact form submitted:', contactData);
        
        setTimeout(async () => {
            if (supabase) {
                await supabase.auth.signOut();
            }
            currentUser = null;
        }, 3000);
        
    } catch (error) {
        console.error('❌ Error submitting form:', error);
        showNotification('There was an error sending your message. Please try again.', 'error');
        
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
