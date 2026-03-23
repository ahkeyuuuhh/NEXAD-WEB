// Global Authentication System
// This script manages user authentication across all pages

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

let supabase = null;
let currentUser = null;

// Initialize Supabase
try {
    const supabaseUrl = 'https://klrfkhyvgtffsjpdioax.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscmZraHl2Z3RmZnNqcGRpb2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNzE5MDUsImV4cCI6MjA4NTY0NzkwNX0.9_AjIcRSVNjgpPcmBsP-UCjLpQyIqt3Za41KK9IqrgM';
    
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ [Global Auth] Supabase initialized');
} catch (error) {
    console.error('❌ [Global Auth] Failed to initialize Supabase:', error);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 [Global Auth] DOM loaded');
    // Longer delay to ensure DOM is fully ready and other scripts have loaded
    setTimeout(() => {
        console.log('📄 [Global Auth] Starting initialization...');
        initializeGlobalAuth();
    }, 300);
});

// Initialize global authentication
async function initializeGlobalAuth() {
    if (!supabase) {
        console.error('❌ [Global Auth] Supabase not initialized');
        return;
    }
    
    // Setup auth state listener
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔔 [Global Auth] Auth event:', event);
        
        if (event === 'SIGNED_IN' && session) {
            console.log('🟢 [Global Auth] User signed in:', session.user.email);
            updateCurrentUser(session.user);
            updateNavigationAuth(true);
        } else if (event === 'SIGNED_OUT') {
            console.log('🟡 [Global Auth] User signed out');
            currentUser = null;
            updateNavigationAuth(false);
        }
    });
    
    // Check for existing session
    await checkSession();
}

// Check for existing session
async function checkSession() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('🔴 [Global Auth] Error checking session:', error);
            return;
        }
        
        if (session && session.user) {
            console.log('🟢 [Global Auth] Session found:', session.user.email);
            updateCurrentUser(session.user);
            updateNavigationAuth(true);
        } else {
            console.log('🟡 [Global Auth] No session found');
            updateNavigationAuth(false);
        }
    } catch (error) {
        console.error('🔴 [Global Auth] Exception:', error);
    }
}

// Update current user object
function updateCurrentUser(user) {
    console.log('🔵 [Global Auth] User metadata:', user.user_metadata);
    
    currentUser = {
        name: user.user_metadata?.full_name || 
              user.user_metadata?.name || 
              user.email?.split('@')[0] || 
              'User',
        email: user.email,
        picture: user.user_metadata?.avatar_url || 
                user.user_metadata?.picture || 
                null
    };
    
    console.log('🟢 [Global Auth] Current user:', currentUser);
}

// Update navigation based on auth state
function updateNavigationAuth(isLoggedIn, retryCount = 0) {
    const authContainer = document.getElementById('authContainer');
    
    if (!authContainer) {
        console.warn(`⚠️ [Global Auth] Auth container not found (attempt ${retryCount + 1}/5)`);
        
        // Retry up to 5 times with increasing delays
        if (retryCount < 5) {
            const delay = 300 * (retryCount + 1); // 300ms, 600ms, 900ms, 1200ms, 1500ms
            console.log(`🔍 [Global Auth] Retrying in ${delay}ms...`);
            setTimeout(() => {
                updateNavigationAuth(isLoggedIn, retryCount + 1);
            }, delay);
        } else {
            console.error('❌ [Global Auth] Auth container not found after 5 attempts');
            console.error('❌ [Global Auth] Please check if authContainer div exists in HTML');
        }
        return;
    }
    
    console.log('✅ [Global Auth] Auth container found!');
    updateNavigationAuthContent(authContainer, isLoggedIn);
}

// Update navigation auth content
function updateNavigationAuthContent(authContainer, isLoggedIn) {
    if (isLoggedIn && currentUser) {
        console.log('🔵 [Global Auth] Showing profile dropdown');
        authContainer.innerHTML = createProfileDropdown();
        setupProfileDropdown();
    } else {
        console.log('🔵 [Global Auth] Showing login button');
        authContainer.innerHTML = createLoginButton();
        setupLoginButton();
    }
}

// Create profile dropdown HTML
function createProfileDropdown() {
    const initials = currentUser.name.charAt(0).toUpperCase();
    const avatarStyle = currentUser.picture 
        ? `background-image: url(${currentUser.picture}); background-size: cover; background-position: center;`
        : '';
    
    return `
        <div class="profile-dropdown" id="profileDropdown">
            <button class="profile-btn" id="profileBtn">
                <div class="profile-avatar" id="navAvatar" style="${avatarStyle}">
                    ${currentUser.picture ? '' : initials}
                </div>
            </button>
            <div class="profile-menu" id="profileMenu">
                <div class="profile-menu-header">
                    <div class="profile-menu-avatar" id="menuAvatar" style="${avatarStyle}">
                        ${currentUser.picture ? '' : initials}
                    </div>
                    <div class="profile-menu-info">
                        <span class="profile-menu-name">${currentUser.name}</span>
                        <span class="profile-menu-email">${currentUser.email}</span>
                    </div>
                </div>
                <button class="profile-menu-logout" id="menuLogoutBtn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Logout
                </button>
            </div>
        </div>
    `;
}

// Create login button HTML
function createLoginButton() {
    return `
        <a href="contact.html" class="nav-link login-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-right: 6px;">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Login
        </a>
    `;
}

// Setup profile dropdown interactions
function setupProfileDropdown() {
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');
    const logoutBtn = document.getElementById('menuLogoutBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (profileBtn && profileMenu) {
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileMenu.classList.toggle('show');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (profileDropdown && !profileDropdown.contains(e.target)) {
                profileMenu.classList.remove('show');
            }
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Setup mobile navigation if not already set up
    setupMobileNavigation();
}

// Setup login button
function setupLoginButton() {
    // Login button is just a link, no setup needed
    // But setup mobile navigation
    setupMobileNavigation();
}

// Setup mobile navigation
function setupMobileNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!navToggle || !navLinks) {
        return;
    }
    
    // Remove existing listeners to avoid duplicates
    const newNavToggle = navToggle.cloneNode(true);
    navToggle.parentNode.replaceChild(newNavToggle, navToggle);
    
    // Add click listener
    newNavToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        navLinks.classList.toggle('active');
        newNavToggle.classList.toggle('active');
        console.log('🔵 [Global Auth] Mobile menu toggled');
    });
    
    // Close mobile menu when clicking on a link
    const navLinksItems = navLinks.querySelectorAll('.nav-link');
    navLinksItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            newNavToggle.classList.remove('active');
        });
    });
    
    console.log('✅ [Global Auth] Mobile navigation setup complete');
}

// Handle logout
async function handleLogout() {
    console.log('🔵 [Global Auth] Logging out...');
    
    if (supabase) {
        await supabase.auth.signOut();
    }
    
    currentUser = null;
    updateNavigationAuth(false);
    
    // Show notification if on contact page
    if (typeof showNotification === 'function') {
        showNotification('Logged out successfully', 'success');
    }
}

// Export for use in other scripts
window.globalAuth = {
    supabase,
    getCurrentUser: () => currentUser,
    isLoggedIn: () => currentUser !== null,
    logout: handleLogout
};

console.log('✅ [Global Auth] Script loaded');
