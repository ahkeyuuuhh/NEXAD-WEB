// Login Page JavaScript - Supabase Auth Implementation
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

let supabase = null;

console.log('📜 Login.js loaded');

// Initialize Supabase with persistence
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
        
        // Check for OAuth tokens in URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
            console.log('🟢 [Session] Found OAuth tokens in URL, processing...');
            
            // Clean up URL immediately
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Wait for Supabase to process the session
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if session was established
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
                console.error('🔴 [Session] Error getting session:', sessionError);
                showError('Failed to establish session. Please try again.');
                return;
            }
            
            if (session && session.user) {
                console.log('🟢 [Session] Session established successfully!');
                showError('Login successful! Redirecting...');
                
                // Redirect to contact page with full path
                setTimeout(() => {
                    window.location.href = window.location.origin + window.location.pathname.replace('login.html', 'contact.html');
                }, 1500);
                return;
            } else {
                console.error('🔴 [Session] No session after OAuth');
                showError('Authentication completed but session not found. Please try again.');
                return;
            }
        }
        
        // Check for existing session
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
        
        if (getSessionError) {
            console.error('🔴 [Session] Error checking session:', getSessionError);
            return;
        }

        if (session && session.user) {
            console.log('🟢 [Session] Existing session found, redirecting to contact page...');
            window.location.href = window.location.origin + window.location.pathname.replace('login.html', 'contact.html');
        } else {
            console.log('🟡 [Session] No existing session found');
        }
    } catch (error) {
        console.error('🔴 [Session] Exception:', error);
        showError('An error occurred. Please try again.');
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
        
        // Get the current origin for redirect
        const redirectUrl = `${window.location.origin}${window.location.pathname}`;
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
        
        console.log('🟢 [OAuth] OAuth initiated successfully');
        
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
