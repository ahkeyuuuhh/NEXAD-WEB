// Contact Page JavaScript - Works with Global Auth System
// Using ES6 modules for proper Supabase import

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

let supabase = null;
let currentUser = null;

// Initialize Supabase with persistence
console.log('📜 Contact.js loaded');

try {
    const supabaseUrl = 'https://klrfkhyvgtffsjpdioax.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscmZraHl2Z3RmZnNqcGRpb2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNzE5MDUsImV4cCI6MjA4NTY0NzkwNX0.9_AjIcRSVNjgpPcmBsP-UCjLpQyIqt3Za41KK9IqrgM';
    
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage
        }
    });
    console.log('✅ Supabase client initialized with session persistence');
} catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, initializing...');
    initializeContactPage();
    setupEventListeners();
    setupAuthListener();
    checkExistingSession();
});

// Setup auth state change listener
function setupAuthListener() {
    if (!supabase) {
        console.error('❌ Supabase not initialized for auth listener');
        return;
    }
    
    console.log('🔧 Setting up auth state listener...');
    
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔔 [Auth Event]:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session) {
            console.log('🟢 [Auth] User signed in:', session.user.email);
            console.log('🟢 [Auth] User metadata:', session.user.user_metadata);
            
            currentUser = {
                name: session.user.user_metadata?.full_name || 
                      session.user.user_metadata?.name || 
                      session.user.email?.split('@')[0] || 
                      'User',
                email: session.user.email,
                picture: session.user.user_metadata?.avatar_url || 
                        session.user.user_metadata?.picture || 
                        null
            };
            
            console.log('🟢 [Auth] Current user object:', currentUser);
            
            showContactForm();
        } else if (event === 'SIGNED_OUT') {
            console.log('🟡 [Auth] User signed out');
            currentUser = null;
            
            const authSection = document.getElementById('authSection');
            const contactForm = document.getElementById('contactForm');
            
            if (authSection) authSection.style.display = 'flex';
            if (contactForm) contactForm.style.display = 'none';
        }
    });
}

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
        googleSignInBtn.addEventListener('click', handleGoogleSignIn);
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
        console.log('🔵 [OAuth] Current URL:', window.location.href);
        
        // Use the same approach as the working test page
        const redirectUrl = window.location.origin + window.location.pathname;
        console.log('🔵 [OAuth] Redirect URL:', redirectUrl);
        
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
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
        
        console.log('🟢 [OAuth] OAuth initiated successfully, redirecting...', data);
        
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

// Check for existing session
async function checkExistingSession() {
    if (!supabase) {
        console.error('❌ Supabase not initialized');
        return;
    }
    
    try {
        console.log('🔵 [Session] Checking for existing session...');
        console.log('🔵 [Session] Current URL:', window.location.href);
        
        // First, check for OAuth callback parameters in hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        
        if (error) {
            console.error('🔴 [Session] OAuth Error:', error, errorDescription);
            showNotification(`Sign-in failed: ${errorDescription || error}`, 'error');
            return;
        }
        
        if (accessToken) {
            console.log('🟢 [Session] Found OAuth callback in URL, processing...');
            console.log('🟢 [Session] Access Token:', accessToken.substring(0, 20) + '...');
            
            // Set the session using the tokens from URL
            try {
                const { data, error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                });
                
                if (error) {
                    console.error('🔴 [Session] Error setting session:', error);
                    showNotification('Failed to establish session. Please try again.', 'error');
                } else {
                    console.log('🟢 [Session] Session set successfully!');
                    console.log('🟢 [Session] User:', data.user.email);
                }
            } catch (setError) {
                console.error('🔴 [Session] Exception setting session:', setError);
                showNotification('Failed to establish session. Please try again.', 'error');
            }
            
            // Clean up URL immediately
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Wait a moment for everything to settle
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Check for existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            console.error('🔴 [Session] Error checking session:', sessionError);
            return;
        }

        if (session && session.user) {
            console.log('🟢 [Session] Session found:', session.user.email);
            console.log('🟢 [Session] User metadata:', session.user.user_metadata);
            
            currentUser = {
                name: session.user.user_metadata?.full_name || 
                      session.user.user_metadata?.name || 
                      session.user.email?.split('@')[0] || 
                      'User',
                email: session.user.email,
                picture: session.user.user_metadata?.avatar_url || 
                        session.user.user_metadata?.picture || 
                        null
            };
            
            console.log('🟢 [Session] Current user object:', currentUser);
            
            showContactForm();
        } else {
            console.log('🟡 [Session] No session found, showing login');
        }
    } catch (error) {
        console.error('🔴 [Session] Exception:', error);
    }
}

// Show contact form after authentication
function showContactForm() {
    const authSection = document.getElementById('authSection');
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    if (authSection) authSection.style.display = 'none';
    contactForm.style.display = 'flex';
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = contactForm.querySelector('.submit-btn-compact');
    
    if (!contactForm || !successMessage || !submitBtn) {
        console.error('❌ Form elements not found');
        return;
    }
    
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
    
    // Validate message
    if (!contactData.message || contactData.message.trim() === '') {
        showNotification('Please enter a message', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    
    let overallSuccess = false;
    
    try {
        // 1. Send to Make.com webhook (primary method)
        let webhookSuccess = false;
        try {
            console.log('📤 Sending to Make.com webhook...');
            const webhookResponse = await sendToWebhook(contactData);
            webhookSuccess = webhookResponse.success;
            
            if (webhookSuccess) {
                console.log('✅ Successfully sent to webhook');
                overallSuccess = true; // Webhook success is enough
            } else {
                console.warn('⚠️ Webhook send failed:', webhookResponse.error);
            }
        } catch (webhookError) {
            console.error('❌ Webhook error:', webhookError);
        }
        
        // 2. Try to save to database if available (secondary method)
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
                    overallSuccess = true; // Database success is also enough
                } else {
                    console.warn('⚠️ Database save failed:', error);
                    // Don't fail the whole operation if database fails
                }
            } catch (dbError) {
                console.warn('⚠️ Database error:', dbError);
                // Don't fail the whole operation if database fails
            }
        }
        
        // 3. Always save to localStorage as backup
        try {
            const contacts = JSON.parse(localStorage.getItem('nexad_contacts') || '[]');
            contacts.push({
                ...contactData,
                id: contactId || 'local_' + Date.now(),
                savedToDatabase: savedToDatabase,
                sentToWebhook: webhookSuccess
            });
            localStorage.setItem('nexad_contacts', JSON.stringify(contacts));
            console.log('✅ Contact saved to localStorage');
            overallSuccess = true; // At minimum, localStorage worked
        } catch (storageError) {
            console.error('❌ localStorage error:', storageError);
        }
        
        // Show success if ANY method worked
        if (overallSuccess) {
            // Show success message
            contactForm.style.display = 'none';
            successMessage.style.display = 'block';
            
            console.log('✅ Contact form submitted successfully');
            
            // Show success notification
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            
            // Reset form after 3 seconds and show form again (user stays logged in)
            setTimeout(() => {
                contactForm.reset();
                contactForm.style.display = 'flex';
                successMessage.style.display = 'none';
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }, 3000);
        } else {
            // All methods failed
            throw new Error('All submission methods failed');
        }
        
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

// Send form data to Make.com webhook
async function sendToWebhook(contactData) {
    const WEBHOOK_URL = 'https://hook.eu1.make.com/rjls5ysrfykr7vzhgx6w1biqtrg3t6b8';
    
    try {
        console.log('🔗 Sending to webhook:', WEBHOOK_URL);
        console.log('📦 Data:', contactData);
        
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData)
        });
        
        // Check if response is ok (status 200-299)
        if (!response.ok) {
            throw new Error(`Webhook responded with status: ${response.status}`);
        }
        
        // Try to parse response as JSON (Make.com usually returns JSON)
        let responseData;
        try {
            responseData = await response.json();
            console.log('✅ Webhook response:', responseData);
        } catch (parseError) {
            // If response is not JSON, just get the text
            responseData = await response.text();
            console.log('✅ Webhook response (text):', responseData);
        }
        
        return {
            success: true,
            data: responseData
        };
        
    } catch (error) {
        console.error('❌ Webhook error:', error);
        return {
            success: false,
            error: error.message
        };
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
