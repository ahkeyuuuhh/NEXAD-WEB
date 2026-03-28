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
    console.log('🔵 [Global Auth] Logout requested, showing confirmation...');
    
    // Show confirmation modal
    showLogoutConfirmation();
}

// Show logout confirmation modal
function showLogoutConfirmation() {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'logout-modal-overlay';
    modal.innerHTML = `
        <div class="logout-modal">
            <div class="logout-modal-header">
                <svg class="logout-modal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <h3 class="logout-modal-title">Confirm Logout</h3>
                <p class="logout-modal-message">Are you sure you want to log out?</p>
            </div>
            <div class="logout-modal-actions">
                <button class="logout-modal-btn logout-modal-cancel" id="cancelLogout">
                    Cancel
                </button>
                <button class="logout-modal-btn logout-modal-confirm" id="confirmLogout">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Logout
                </button>
            </div>
        </div>
    `;
    
    // Add modal styles if not already present
    if (!document.querySelector('#logout-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'logout-modal-styles';
        style.textContent = `
            .logout-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(12px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100000;
                padding: 20px;
                animation: fadeIn 0.2s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            .logout-modal {
                background: rgba(26, 26, 26, 0.98);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                max-width: 360px;
                width: 100%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                animation: slideUp 0.3s ease;
                overflow: hidden;
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .logout-modal-header {
                padding: 28px 24px 20px;
                text-align: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .logout-modal-icon {
                width: 44px;
                height: 44px;
                margin: 0 auto 16px;
                padding: 10px;
                background: rgba(239, 68, 68, 0.15);
                border-radius: 12px;
                stroke: #fca5a5;
                stroke-width: 2;
                display: block;
            }
            
            .logout-modal-title {
                font-size: 1.125rem;
                font-weight: 600;
                color: #ffffff;
                margin: 0 0 10px 0;
                letter-spacing: -0.01em;
            }
            
            .logout-modal-message {
                font-size: 0.875rem;
                color: rgba(255, 255, 255, 0.7);
                line-height: 1.5;
                margin: 0;
            }
            
            .logout-modal-actions {
                display: flex;
                gap: 10px;
                padding: 18px 24px 24px;
                background: rgba(0, 0, 0, 0.3);
            }
            
            .logout-modal-btn {
                flex: 1;
                padding: 12px 20px;
                border: none;
                border-radius: 10px;
                font-size: 0.875rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            }
            
            .logout-modal-cancel {
                background: rgba(255, 255, 255, 0.08);
                color: #ffffff;
                border: 1px solid rgba(255, 255, 255, 0.15);
            }
            
            .logout-modal-cancel:hover {
                background: rgba(255, 255, 255, 0.12);
                border-color: rgba(255, 255, 255, 0.25);
            }
            
            .logout-modal-cancel:active {
                background: rgba(255, 255, 255, 0.15);
            }
            
            .logout-modal-confirm {
                background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                color: #ffffff;
                box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
            }
            
            .logout-modal-confirm:hover {
                background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
                box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
                transform: translateY(-1px);
            }
            
            .logout-modal-confirm:active {
                transform: translateY(0);
                box-shadow: 0 2px 6px rgba(220, 38, 38, 0.3);
            }
            
            .logout-modal-confirm svg {
                stroke-width: 2.5;
            }
            
            @media (max-width: 480px) {
                .logout-modal {
                    max-width: 320px;
                    border-radius: 14px;
                }
                
                .logout-modal-header {
                    padding: 24px 20px 18px;
                }
                
                .logout-modal-icon {
                    width: 40px;
                    height: 40px;
                    padding: 9px;
                    margin-bottom: 14px;
                }
                
                .logout-modal-title {
                    font-size: 1.0625rem;
                    margin-bottom: 8px;
                }
                
                .logout-modal-message {
                    font-size: 0.8125rem;
                }
                
                .logout-modal-actions {
                    flex-direction: column-reverse;
                    padding: 16px 24px 24px;
                    gap: 10px;
                }
                
                .logout-modal-btn {
                    padding: 13px 20px;
                    font-size: 0.875rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(modal);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Handle cancel
    const cancelBtn = document.getElementById('cancelLogout');
    const confirmBtn = document.getElementById('confirmLogout');
    
    const closeModal = () => {
        modal.style.animation = 'fadeOut 0.2s ease';
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 200);
    };
    
    cancelBtn.addEventListener('click', closeModal);
    
    // Handle confirm
    confirmBtn.addEventListener('click', async () => {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span>Logging out...</span>';
        
        await performLogout();
        closeModal();
    });
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close on escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Perform actual logout
async function performLogout() {
    console.log('🔵 [Global Auth] Performing logout...');
    
    if (supabase) {
        await supabase.auth.signOut();
    }
    
    currentUser = null;
    updateNavigationAuth(false);
    
    // Show notification if on contact page
    if (typeof showNotification === 'function') {
        showNotification('Logged out successfully', 'success');
    }
    
    console.log('✅ [Global Auth] Logout complete');
}

// Export for use in other scripts
window.globalAuth = {
    supabase,
    getCurrentUser: () => currentUser,
    isLoggedIn: () => currentUser !== null,
    logout: handleLogout
};

console.log('✅ [Global Auth] Script loaded');
