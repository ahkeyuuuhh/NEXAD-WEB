// Login Page JavaScript - Supabase Auth Implementation
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

let supabase = null;

console.log('📜 Login.js loaded');

// Initialize Supabase
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
    console.log('📄 DOM loaded, initializing login page...');
    checkExistingSession();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', handleGoogleSignIn);
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
                showError('Authentication failed. Please try again.');
                return;
            }
            
            if (data.session && data.session.user) {
                console.log('🟢 [Session] Session set successfully, redirecting to contact page...');
                window.location.href = 'contact.html';
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
            console.log('🟢 [Session] Existing session found, redirecting to contact page...');
            window.location.href = 'contact.html';
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
        showError('Authentication system not ready. Please refresh the page.');
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
        
        const redirectTo = window.location.origin + '/nexad-website/login.html';
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
        
        showError('Sign-in failed: ' + (error.message || 'Please try again'));
        
        googleSignInBtn.disabled = false;
        googleSignInBtn.innerHTML = originalText;
    }
}

// Show error message
function showError(message) {
    const loginCard = document.querySelector('.login-card');
    if (!loginCard) return;
    
    const existingError = loginCard.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    loginCard.appendChild(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
}

console.log('✅ Login.js fully loaded and ready');
