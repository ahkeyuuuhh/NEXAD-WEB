// Global Authentication System
// This script manages user authentication across all pages

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

let supabase = null;
let currentUser = null;

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
    console.log('✅ [Global Auth] Supabase initialized with session persistence');
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
    console.log('🔵 [Global Auth] Full user object:', user);
    
    // Google OAuth can return picture in multiple fields
    const picture = user.user_metadata?.avatar_url || 
                   user.user_metadata?.picture || 
                   user.user_metadata?.avatar || 
                   user.identities?.[0]?.identity_data?.avatar_url ||
                   user.identities?.[0]?.identity_data?.picture ||
                   null;
    
    currentUser = {
        name: user.user_metadata?.full_name || 
              user.user_metadata?.name || 
              user.email?.split('@')[0] || 
              'User',
        email: user.email,
        picture: picture
    };
    
    console.log('🟢 [Global Auth] Current user:', currentUser);
    console.log('🟢 [Global Auth] Profile picture URL:', picture);
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

// Create simple profile display HTML
function createProfileDropdown() {
    const initials = currentUser.name.charAt(0).toUpperCase();
    
    // Create comprehensive inline style for profile picture
    const avatarStyle = currentUser.picture 
        ? `background-image: url('${currentUser.picture}'); background-size: cover; background-position: center; background-repeat: no-repeat; background-color: transparent;`
        : 'background-color: #666666;';
    
    console.log('🎨 [Global Auth] Avatar style:', avatarStyle);
    console.log('🎨 [Global Auth] Picture URL:', currentUser.picture);
    
    return `
        <div class="profile-simple" id="profileSimple">
            <button class="profile-account" id="profileAccountBtn">
                <div class="profile-avatar-simple" id="profileAvatar" style="${avatarStyle}">
                    ${currentUser.picture ? '' : initials}
                </div>
                <span class="profile-account-name">${currentUser.name}</span>
            </button>
            <div class="profile-dropdown-menu" id="profileDropdownMenu">
                <button class="profile-logout-btn" id="logoutBtn">
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
        <a href="login.html" class="nav-link login-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-right: 6px;">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Login
        </a>
    `;
}

// Setup simple profile interactions
function setupProfileDropdown() {
    const profileAccountBtn = document.getElementById('profileAccountBtn');
    const profileDropdownMenu = document.getElementById('profileDropdownMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileSimple = document.getElementById('profileSimple');
    
    // Force update profile picture after DOM creation
    updateProfilePicture();
    
    if (profileAccountBtn && profileDropdownMenu) {
        // Toggle dropdown on profile click
        profileAccountBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (profileSimple && !profileSimple.contains(e.target)) {
                profileDropdownMenu.classList.remove('show');
            }
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Setup mobile navigation
    setupMobileNavigation();
}

// Force update profile picture
function updateProfilePicture() {
    if (!currentUser || !currentUser.picture) return;
    
    const profileAvatar = document.getElementById('profileAvatar');
    
    const style = `background-image: url('${currentUser.picture}'); background-size: cover; background-position: center; background-repeat: no-repeat; background-color: transparent;`;
    
    if (profileAvatar) {
        profileAvatar.style.cssText = style;
        profileAvatar.textContent = ''; // Remove initials
        console.log('🎨 [Global Auth] Updated profile avatar style');
    }
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
        console.warn('⚠️ [Global Auth] Mobile nav elements not found');
        return;
    }
    
    // Create overlay backdrop if it doesn't exist
    let overlay = document.querySelector('.nav-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
        console.log('✅ [Global Auth] Created nav overlay');
    }
    
    // Toggle menu function
    function toggleMenu(shouldOpen) {
        const menu = document.querySelector('.nav-links');
        const toggle = document.querySelector('.nav-toggle');
        const backdrop = document.querySelector('.nav-overlay');
        
        if (shouldOpen) {
            menu.classList.add('active');
            toggle.classList.add('active');
            backdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
            console.log('🔵 [Global Auth] Mobile menu opened');
        } else {
            menu.classList.remove('active');
            toggle.classList.remove('active');
            backdrop.classList.remove('active');
            document.body.style.overflow = '';
            console.log('🔵 [Global Auth] Mobile menu closed');
        }
    }
    
    // Remove existing listeners by cloning
    const newToggle = navToggle.cloneNode(true);
    navToggle.parentNode.replaceChild(newToggle, navToggle);
    
    const newOverlay = overlay.cloneNode(true);
    overlay.parentNode.replaceChild(newOverlay, overlay);
    
    // Burger menu click
    document.querySelector('.nav-toggle').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = document.querySelector('.nav-links').classList.contains('active');
        toggleMenu(!isOpen);
    });
    
    // Overlay click to close
    document.querySelector('.nav-overlay').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu(false);
    });
    
    // Close when clicking nav links
    const allLinks = navLinks.querySelectorAll('.nav-link');
    allLinks.forEach(link => {
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
    });
    
    // Close menu when clicking navigation links
    document.querySelectorAll('.nav-link:not(.login-btn)').forEach(link => {
        link.addEventListener('click', () => {
            console.log('🔵 [Global Auth] Navigation link clicked, closing menu');
            toggleMenu(false);
        });
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const menu = document.querySelector('.nav-links');
            if (menu && menu.classList.contains('active')) {
                toggleMenu(false);
            }
        }
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
