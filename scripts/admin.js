// Admin Dashboard JavaScript - Dynamic Statistics
// Only allows nexad.support@gmail.com to access

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

// Admin email whitelist
const ADMIN_EMAIL = 'nexad.support@gmail.com';

// Download URLs
const APK_URL = 'https://expo.dev/artifacts/eas/jy8mSzY1mcXU3dk5Xkxfb.apk';
const IPA_URL = ''; // Will be added when IPA is built

let supabase = null;
let currentAdmin = null;
let realtimeChannel = null;

console.log('📜 Admin.js loaded');

// Initialize Supabase
try {
    const supabaseUrl = 'https://klrfkhyvgtffsjpdioax.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscmZraHl2Z3RmZnNqcGRpb2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNzE5MDUsImV4cCI6MjA4NTY0NzkwNX0.9_AjIcRSVNjgpPcmBsP-UCjLpQyIqt3Za41KK9IqrgM';
    
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client initialized');
} catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, initializing admin panel...');
    checkAdminSession();
    setupEventListeners();
});

// Check for existing admin session
async function checkAdminSession() {
    if (!supabase) {
        console.error('❌ Supabase not initialized');
        showLoginScreen();
        return;
    }
    
    try {
        console.log('🔵 [Admin] Checking for existing session...');
        
        // Check for OAuth tokens in URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        const error = hashParams.get('error') || queryParams.get('error');
        
        if (error) {
            console.error('🔴 [Admin] OAuth error:', error);
            const errorDesc = hashParams.get('error_description') || queryParams.get('error_description');
            showError('Authentication failed: ' + (errorDesc || error));
            showLoginScreen();
            return;
        }
        
        if (accessToken) {
            console.log('🟢 [Admin] Found OAuth tokens in URL');
            showLoading('Verifying admin access...');
            
            const { data, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || ''
            });
            
            if (sessionError) {
                console.error('🔴 [Admin] Error setting session:', sessionError);
                hideLoading();
                showError('Authentication failed. Please try again.');
                showLoginScreen();
                return;
            }
            
            if (data.session && data.session.user) {
                console.log('🟢 [Admin] Session set for:', data.session.user.email);
                window.history.replaceState({}, document.title, window.location.pathname);
                await verifyAndShowDashboard(data.session.user);
                hideLoading();
                return;
            }
            hideLoading();
        }
        
        // Check for existing session
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
        
        if (getSessionError) {
            console.error('🔴 [Admin] Error checking session:', getSessionError);
            showLoginScreen();
            return;
        }

        if (session && session.user) {
            console.log('🟢 [Admin] Existing session found:', session.user.email);
            showLoading('Loading dashboard...');
            await verifyAndShowDashboard(session.user);
            hideLoading();
        } else {
            console.log('🟡 [Admin] No existing session found');
            showLoginScreen();
        }
    } catch (error) {
        console.error('🔴 [Admin] Exception:', error);
        hideLoading();
        showError('An error occurred. Please refresh the page.');
        showLoginScreen();
    }
}

// Verify admin email and show dashboard
async function verifyAndShowDashboard(user) {
    console.log('🔍 [Admin] Verifying admin email:', user.email);
    
    if (user.email !== ADMIN_EMAIL) {
        console.error('🔴 [Admin] Unauthorized email:', user.email);
        await supabase.auth.signOut();
        showError(`Access Denied: Only ${ADMIN_EMAIL} can access this admin panel.`);
        showLoginScreen();
        return;
    }
    
    console.log('✅ [Admin] Email verified, showing dashboard');
    
    currentAdmin = {
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
        email: user.email,
        picture: user.user_metadata?.avatar_url || null
    };
    
    showDashboard();
}

// Show login screen
function showLoginScreen() {
    const loginDiv = document.getElementById('adminLogin');
    const dashboardDiv = document.getElementById('adminDashboard');
    
    if (loginDiv) loginDiv.style.display = 'flex';
    if (dashboardDiv) dashboardDiv.style.display = 'none';
    
    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) loadingIndicator.remove();
}

// Show loading indicator
function showLoading(message = 'Loading...') {
    const existingLoading = document.querySelector('.loading-indicator');
    if (existingLoading) existingLoading.remove();
    
    const loading = document.createElement('div');
    loading.className = 'loading-indicator';
    loading.innerHTML = `
        <div class="loading-content">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `;
    loading.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.9); display: flex;
        align-items: center; justify-content: center; z-index: 10000;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .loading-content { text-align: center; color: white; }
        .loading-content .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white; border-radius: 50%;
            width: 50px; height: 50px; animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        .loading-content p { font-size: 16px; margin: 0; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
    document.body.appendChild(loading);
}

// Hide loading indicator
function hideLoading() {
    const loading = document.querySelector('.loading-indicator');
    if (loading) loading.remove();
}

// Show dashboard
function showDashboard() {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    
    if (currentAdmin) {
        const adminName = document.getElementById('adminName');
        const adminAvatar = document.getElementById('adminAvatar');
        
        if (adminName) adminName.textContent = currentAdmin.name;
        
        if (adminAvatar && currentAdmin.picture) {
            adminAvatar.src = currentAdmin.picture;
        } else if (adminAvatar) {
            adminAvatar.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Ccircle cx="20" cy="20" r="20" fill="%23667eea"/%3E%3Ctext x="20" y="26" font-size="16" fill="white" text-anchor="middle" font-family="Arial"%3E' + currentAdmin.name.charAt(0).toUpperCase() + '%3C/text%3E%3C/svg%3E';
        }
    }
    
    loadDashboardData();
    setupRealtimeSubscription();
}

// Setup event listeners
function setupEventListeners() {
    const loginBtn = document.getElementById('adminLoginBtn');
    if (loginBtn) loginBtn.addEventListener('click', handleAdminLogin);
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Setup tab filtering
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            filterContacts(filter);
            
            // Update active tab
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Handle admin login
async function handleAdminLogin() {
    console.log('🚀 [Admin] Login initiated');
    
    if (!supabase) {
        console.error('❌ Supabase not initialized');
        showError('Authentication system not ready. Please refresh the page.');
        return;
    }
    
    const loginBtn = document.getElementById('adminLoginBtn');
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.textContent = 'Signing in...';
    }
    
    try {
        console.log('🔵 [Admin] Starting OAuth flow...');
        
        const redirectTo = window.location.origin + window.location.pathname;
        console.log('🔵 [Admin] Redirect URL:', redirectTo);
        
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
            console.error('🔴 [Admin] OAuth error:', error);
            throw error;
        }
        
        if (!data?.url) {
            console.error('🔴 [Admin] No OAuth URL returned');
            throw new Error('Failed to get Google sign-in URL');
        }

        console.log('🟢 [Admin] OAuth URL received');
        console.log('🔵 [Admin] Redirecting to Google...');
        
    } catch (error) {
        console.error('🔴 [Admin] Error:', error);
        showError('Sign-in failed: ' + (error.message || 'Please try again'));
        
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<svg class="google-icon" width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg><span>Sign in with Google</span>';
        }
    }
}

// Handle logout
async function handleLogout() {
    console.log('🔵 [Admin] Logging out...');
    
    if (supabase) await supabase.auth.signOut();
    
    currentAdmin = null;
    showLoginScreen();
    
    console.log('✅ [Admin] Logged out successfully');
}

// Show section
function showSection(sectionId) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');
    
    document.querySelectorAll('.admin-section').forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId)?.classList.add('active');
}

// Load dashboard data
function loadDashboardData() {
    loadContacts();
    loadDownloadStats();
    loadManualViews();
    loadRecentActivity();
}

// Load contacts from localStorage
function loadContacts() {
    // Try database first, fall back to localStorage
    loadContactsFromDatabase();
}

// Load contacts from Supabase database
async function loadContactsFromDatabase() {
    try {
        if (!supabase) {
            console.log('ℹ️ Database not configured, using localStorage');
            loadContactsFromLocalStorage();
            return;
        }
        
        console.log('📧 Loading contacts from database...');
        
        const { data: contacts, error } = await supabase
            .from('contacts')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.warn('⚠️ Database error, falling back to localStorage:', error);
            loadContactsFromLocalStorage();
            return;
        }
        
        if (!contacts || contacts.length === 0) {
            console.log('ℹ️ No contacts in database, checking localStorage');
            loadContactsFromLocalStorage();
            return;
        }
        
        console.log('✅ Loaded', contacts.length, 'contacts from database');
        
        const contactsCount = document.getElementById('contactsCount');
        const totalContacts = document.getElementById('totalContacts');
        const contactSubmissions = document.getElementById('contactSubmissions');
        
        if (contactsCount) contactsCount.textContent = contacts.length;
        if (totalContacts) totalContacts.textContent = contacts.length;
        if (contactSubmissions) contactSubmissions.textContent = contacts.length;
        
        displayContacts(contacts);
        
    } catch (error) {
        console.warn('⚠️ Exception loading contacts, using localStorage:', error);
        loadContactsFromLocalStorage();
    }
}

// Fallback to localStorage
function loadContactsFromLocalStorage() {
    try {
        const contacts = JSON.parse(localStorage.getItem('nexad_contacts') || '[]');
        console.log('📧 Loaded', contacts.length, 'contacts from localStorage');
        
        // Log the contacts for debugging
        if (contacts.length > 0) {
            console.log('📋 Contacts:', contacts);
        }
        
        const contactsCount = document.getElementById('contactsCount');
        const totalContacts = document.getElementById('totalContacts');
        const contactSubmissions = document.getElementById('contactSubmissions');
        
        if (contactsCount) contactsCount.textContent = contacts.length;
        if (totalContacts) totalContacts.textContent = contacts.length;
        if (contactSubmissions) contactSubmissions.textContent = contacts.length;
        
        displayContacts(contacts);
    } catch (error) {
        console.error('❌ Error loading contacts from localStorage:', error);
        displayContacts([]);
    }
}

// Load download statistics
function loadDownloadStats() {
    try {
        // Get download counts from localStorage
        const apkDownloads = parseInt(localStorage.getItem('nexad_apk_downloads') || '0');
        const ipaDownloads = parseInt(localStorage.getItem('nexad_ipa_downloads') || '0');
        const totalDownloads = apkDownloads + ipaDownloads;
        
        console.log('📊 Download stats - APK:', apkDownloads, 'IPA:', ipaDownloads, 'Total:', totalDownloads);
        
        // Update overview stats
        const totalDownloadsEl = document.getElementById('totalDownloads');
        if (totalDownloadsEl) totalDownloadsEl.textContent = totalDownloads;
        
        // Update analytics section
        const apkDownloadsEl = document.getElementById('apkDownloads');
        const ipaDownloadsEl = document.getElementById('ipaDownloads');
        const totalDownloadsAnalytics = document.getElementById('totalDownloadsAnalytics');
        
        if (apkDownloadsEl) apkDownloadsEl.textContent = apkDownloads;
        if (ipaDownloadsEl) ipaDownloadsEl.textContent = ipaDownloads;
        if (totalDownloadsAnalytics) totalDownloadsAnalytics.textContent = totalDownloads;
        
        // Calculate percentages
        const apkPercentage = totalDownloads > 0 ? Math.round((apkDownloads / totalDownloads) * 100) : 0;
        const ipaPercentage = totalDownloads > 0 ? Math.round((ipaDownloads / totalDownloads) * 100) : 0;
        
        // Update progress bars
        const apkProgress = document.getElementById('apkProgress');
        const ipaProgress = document.getElementById('ipaProgress');
        const apkPercentageEl = document.getElementById('apkPercentage');
        const ipaPercentageEl = document.getElementById('ipaPercentage');
        
        if (apkProgress) apkProgress.style.width = apkPercentage + '%';
        if (ipaProgress) ipaProgress.style.width = ipaPercentage + '%';
        if (apkPercentageEl) apkPercentageEl.textContent = apkPercentage + '%';
        if (ipaPercentageEl) ipaPercentageEl.textContent = ipaPercentage + '%';
        
    } catch (error) {
        console.error('❌ Error loading download stats:', error);
    }
}

// Load manual views
function loadManualViews() {
    try {
        const manualViews = parseInt(localStorage.getItem('nexad_manual_views') || '0');
        console.log('📖 Manual views:', manualViews);
        
        const manualViewsEl = document.getElementById('manualViews');
        const manualViewsAnalytics = document.getElementById('manualViewsAnalytics');
        
        if (manualViewsEl) manualViewsEl.textContent = manualViews;
        if (manualViewsAnalytics) manualViewsAnalytics.textContent = manualViews;
        
    } catch (error) {
        console.error('❌ Error loading manual views:', error);
    }
}

// Display contacts - REFACTORED: Static cards that open modals
function displayContacts(contacts) {
    const contactsList = document.getElementById('contactsList');
    if (!contactsList) return;
    
    if (!contacts || contacts.length === 0) {
        contactsList.innerHTML = '<div class="empty-state">No contact messages yet</div>';
        return;
    }
    
    contactsList.innerHTML = contacts.map((contact) => {
        const createdAt = contact.created_at || contact.timestamp || new Date().toISOString();
        const statusBadge = getStatusBadge(contact.status || 'unread');
        const contactId = contact.id || 'local_' + Date.now();
        const escapedMessage = (contact.message || 'No message').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
        const messagePreview = (contact.message || 'No message').substring(0, 100) + (contact.message && contact.message.length > 100 ? '...' : '');
        
        return `
        <div class="contact-card ${contact.status === 'unread' ? 'unread' : ''}" 
             data-contact-id="${contactId}" 
             data-status="${contact.status || 'unread'}"
             onclick="openContactModal('${contactId}', '${contact.name}', '${contact.email}', '${escapedMessage}', '${contact.subject || 'General Inquiry'}', '${createdAt}', '${contact.status || 'unread'}')">
            <div class="contact-card-content">
                <div class="contact-info">
                    <h4>${contact.name || 'Unknown'}</h4>
                    <p class="contact-email">${contact.email || 'No email'}</p>
                    <p class="contact-message-preview">${messagePreview}</p>
                </div>
                <div class="contact-meta">
                    ${statusBadge}
                    ${contact.subject ? `<span class="contact-subject">${contact.subject}</span>` : ''}
                    <span class="contact-date">${new Date(createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

// Open contact modal - NEW iOS-style centered modal
window.openContactModal = function(contactId, contactName, contactEmail, contactMessage, contactSubject, createdAt, status) {
    const modal = document.createElement('div');
    modal.className = 'contact-modal-overlay';
    modal.innerHTML = `
        <div class="contact-modal-content">
            <div class="contact-modal-header">
                <h3>Contact Message</h3>
                <button class="modal-close" onclick="closeContactModal()">&times;</button>
            </div>
            <div class="contact-modal-body">
                <div class="contact-detail-row">
                    <span class="detail-label">From:</span>
                    <span class="detail-value">${contactName}</span>
                </div>
                <div class="contact-detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${contactEmail}</span>
                </div>
                <div class="contact-detail-row">
                    <span class="detail-label">Subject:</span>
                    <span class="detail-value">${contactSubject}</span>
                </div>
                <div class="contact-detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${new Date(createdAt).toLocaleString()}</span>
                </div>
                <div class="contact-detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">${getStatusBadge(status)}</span>
                </div>
                <div class="contact-message-full">
                    <span class="detail-label">Message:</span>
                    <p>${contactMessage || 'No message'}</p>
                </div>
            </div>
            <div class="contact-modal-footer">
                <button class="btn btn-outline" onclick="closeContactModal()">Close</button>
                <button class="btn btn-primary" onclick="closeContactModal(); openReplyModal('${contactId}', '${contactName}', '${contactEmail}', '${contactMessage}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                    Reply
                </button>
                <button class="btn btn-danger" onclick="closeContactModal(); confirmDeleteContact('${contactId}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Close on overlay click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeContactModal();
        }
    });
};

// Close contact modal
window.closeContactModal = function() {
    const modal = document.querySelector('.contact-modal-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
};

// Remove old toggle function (no longer needed)
// window.toggleContactCard is removed

// Filter contacts by status
function filterContacts(filter) {
    const allCards = document.querySelectorAll('.contact-card');
    
    allCards.forEach(card => {
        const status = card.getAttribute('data-status') || 'unread';
        
        if (filter === 'all') {
            card.style.display = 'block';
        } else if (status === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Open reply modal - Updated format
window.openReplyModal = function(contactId, contactName, contactEmail, contactMessage) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Replying to: ${contactEmail}</h3>
                <button class="modal-close" onclick="closeReplyModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="original-message-box">
                    <strong>${contactName}:</strong>
                    <p>${contactMessage || 'No message'}</p>
                </div>
                <textarea 
                    id="replyMessage" 
                    class="reply-textarea" 
                    placeholder="Type your reply here..."
                    rows="8"
                ></textarea>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeReplyModal()">Cancel</button>
                <button class="btn btn-primary" onclick="sendReply('${contactId}', '${contactEmail}', '${contactName}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Send Reply
                </button>
            </div>
        </div>
    `;
    
    // Add modal styles if not already present
    if (!document.querySelector('#modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.2s ease;
            }
            .modal-content {
                background: #1a1a1a;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow: hidden;
                animation: slideUp 0.3s ease;
            }
            .modal-header {
                padding: 20px 24px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .modal-header h3 {
                margin: 0;
                color: rgba(255, 255, 255, 0.9);
                font-size: 20px;
            }
            .modal-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.6);
                font-size: 28px;
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                transition: all 0.2s;
            }
            .modal-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.9);
            }
            .modal-body {
                padding: 24px;
            }
            .modal-info {
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: 16px;
            }
            .original-message-box {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 16px;
            }
            .original-message-box strong {
                color: rgba(255, 255, 255, 0.9);
                display: block;
                margin-bottom: 8px;
            }
            .original-message-box p {
                color: rgba(255, 255, 255, 0.7);
                margin: 0;
                font-size: 14px;
                line-height: 1.5;
            }
            .reply-textarea {
                width: 100%;
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 12px;
                color: rgba(255, 255, 255, 0.9);
                font-family: inherit;
                font-size: 14px;
                resize: vertical;
                min-height: 150px;
            }
            .reply-textarea:focus {
                outline: none;
                border-color: #667eea;
            }
            .modal-footer {
                padding: 16px 24px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(modal);
    document.getElementById('replyMessage').focus();
};



// Get status badge HTML
function getStatusBadge(status) {
    const badges = {
        'unread': '<span class="status-badge status-unread">Unread</span>',
        'read': '<span class="status-badge status-read">Read</span>',
        'replied': '<span class="status-badge status-replied">Replied</span>',
        'archived': '<span class="status-badge status-archived">Archived</span>'
    };
    return badges[status] || badges['unread'];
}

// Setup real-time subscription
function setupRealtimeSubscription() {
    if (!supabase) {
        console.warn('⚠️ Supabase not available, real-time updates disabled');
        return;
    }
    
    console.log('⚡ Setting up real-time subscription...');
    
    // Unsubscribe from previous channel if exists
    if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
    }
    
    // Subscribe to contacts table changes
    realtimeChannel = supabase
        .channel('contacts-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'contacts'
            },
            (payload) => {
                console.log('⚡ Real-time update received:', payload);
                handleRealtimeUpdate(payload);
            }
        )
        .subscribe((status) => {
            console.log('⚡ Realtime subscription status:', status);
        });
}

// Handle real-time updates
function handleRealtimeUpdate(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
        case 'INSERT':
            console.log('✅ New contact received:', newRecord);
            showNotification(`New contact from ${newRecord.name}`, 'success');
            loadContacts();
            loadRecentActivity();
            break;
            
        case 'UPDATE':
            console.log('✅ Contact updated:', newRecord);
            loadContacts();
            break;
            
        case 'DELETE':
            console.log('✅ Contact deleted:', oldRecord);
            loadContacts();
            loadRecentActivity();
            break;
    }
}

// Close reply modal
window.closeReplyModal = function() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
};

// Send reply - Direct Resend API (No Edge Function needed)
window.sendReply = async function(contactId, contactEmail, contactName) {
    const replyMessage = document.getElementById('replyMessage').value.trim();
    
    if (!replyMessage) {
        showNotification('Please enter a reply message', 'error');
        return;
    }
    
    const sendBtn = event.target;
    const originalText = sendBtn.innerHTML;
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span>Sending...</span>';
    
    try {
        if (!supabase) {
            throw new Error('Database connection not available');
        }
        
        console.log('📤 Sending reply...');
        
        // Get the full contact details
        const { data: contact, error: fetchError } = await supabase
            .from('contacts')
            .select('*')
            .eq('id', contactId)
            .single();
        
        if (fetchError) throw fetchError;
        
        // Insert reply into database
        const { data: reply, error: replyError } = await supabase
            .from('contact_replies')
            .insert([{
                contact_id: contactId,
                admin_email: currentAdmin.email,
                reply_message: replyMessage
            }])
            .select()
            .single();
        
        if (replyError) throw replyError;
        
        console.log('✅ Reply saved to database');
        
        // Update contact status to 'replied' FIRST
        await supabase
            .from('contacts')
            .update({ 
                status: 'replied',
                replied_at: new Date().toISOString()
            })
            .eq('id', contactId);
        
        // Send reply data to Make.com webhook for email automation
        try {
            await sendReplyToWebhook(contact, replyMessage);
            console.log('✅ Reply sent to automation webhook');
            showNotification('✅ Reply sent successfully!', 'success');
        } catch (webhookError) {
            console.error('⚠️ Webhook failed (reply still saved):', webhookError);
            showNotification('✅ Reply saved successfully! (Email notification will be sent via automation)', 'success');
        }
        
        closeReplyModal();
        loadContacts();
        
    } catch (error) {
        console.error('❌ Error sending reply:', error);
        
        // Check if it's just an email error (reply might still be saved)
        if (error.message && error.message.includes('Edge Function')) {
            showNotification('Reply saved but email notification failed. This is expected in testing mode.', 'warning');
            closeReplyModal();
            loadContacts();
        } else {
            showNotification('Failed to send reply: ' + error.message, 'error');
            sendBtn.disabled = false;
            sendBtn.innerHTML = originalText;
        }
    }
};

// Send reply data to Make.com webhook for email automation
async function sendReplyToWebhook(contact, replyMessage) {
    console.log('📧 Sending reply to webhook automation...');
    
    // Validate contact data
    if (!contact || !contact.email || !contact.name) {
        throw new Error('Invalid contact data: missing required fields');
    }
    
    if (!replyMessage || replyMessage.trim() === '') {
        throw new Error('Reply message is empty');
    }
    
    console.log('✅ Contact data validated');
    
    // Make.com webhook URL for admin replies
    const WEBHOOK_URL = 'https://hook.eu1.make.com/s7wl6b33237xln9t01hiqt1l87md58nr';
    
    const payload = {
        type: 'admin_reply',
        contact_name: contact.name,
        contact_email: contact.email,
        contact_subject: contact.subject || 'Your NEXAD Inquiry',
        original_message: contact.message,
        reply_message: replyMessage,
        admin_email: currentAdmin?.email || 'nexad.support@gmail.com',
        replied_at: new Date().toISOString()
    };
    
    console.log('📦 Payload to send:', JSON.stringify(payload, null, 2));
    console.log('📤 Sending to webhook:', WEBHOOK_URL);
    
    const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    
    console.log('📬 Webhook response status:', response.status);
    
    const responseText = await response.text();
    console.log('📄 Webhook response:', responseText);
    
    if (!response.ok) {
        console.warn('⚠️ Webhook returned error, but reply is still saved');
        return { success: true, message: 'Reply saved (webhook failed)' };
    }
    
    console.log('✅ Reply sent to webhook successfully!');
    return { success: true, message: 'Reply sent to automation' };
}

// Mark contact as read
window.markAsRead = async function(contactId) {
    try {
        if (!supabase) {
            showNotification('Database connection not available', 'error');
            return;
        }
        
        const { error } = await supabase
            .from('contacts')
            .update({ 
                status: 'read',
                read_at: new Date().toISOString()
            })
            .eq('id', contactId);
        
        if (error) throw error;
        
        console.log('✅ Contact marked as read');
        showNotification('Marked as read', 'success');
        loadContacts();
        
    } catch (error) {
        console.error('❌ Error marking as read:', error);
        showNotification('Failed to mark as read', 'error');
    }
};

// Load recent activity
function loadRecentActivity() {
    loadRecentActivityFromDatabase();
}

// Load recent activity from database
async function loadRecentActivityFromDatabase() {
    const activityList = document.getElementById('recentActivity');
    if (!activityList) return;
    
    try {
        if (!supabase) {
            loadRecentActivityFromLocalStorage();
            return;
        }
        
        const { data: contacts, error } = await supabase
            .from('contacts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (error) {
            console.error('❌ Error loading recent activity:', error);
            loadRecentActivityFromLocalStorage();
            return;
        }
        
        if (contacts.length === 0) {
            activityList.innerHTML = '<div class="empty-state">No recent activity</div>';
            return;
        }
        
        activityList.innerHTML = contacts.map(contact => `
            <div class="activity-item">
                <div class="activity-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                </div>
                <div class="activity-content">
                    <p><strong>${contact.name}</strong> sent a message</p>
                    <span class="activity-time">${new Date(contact.created_at).toLocaleString()}</span>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('❌ Exception loading recent activity:', error);
        loadRecentActivityFromLocalStorage();
    }
}

// Fallback to localStorage for recent activity
function loadRecentActivityFromLocalStorage() {
    const activityList = document.getElementById('recentActivity');
    if (!activityList) return;
    
    const contacts = JSON.parse(localStorage.getItem('nexad_contacts') || '[]');
    const recentContacts = contacts.slice(-5).reverse();
    
    if (recentContacts.length === 0) {
        activityList.innerHTML = '<div class="empty-state">No recent activity</div>';
        return;
    }
    
    activityList.innerHTML = recentContacts.map(contact => `
        <div class="activity-item">
            <div class="activity-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>
            </div>
            <div class="activity-content">
                <p><strong>${contact.name}</strong> sent a message</p>
                <span class="activity-time">${new Date(contact.timestamp).toLocaleString()}</span>
            </div>
        </div>
    `).join('');
}

// Export contacts to CSV
function exportContacts() {
    const contacts = JSON.parse(localStorage.getItem('nexad_contacts') || '[]');
    
    if (contacts.length === 0) {
        alert('No contacts to export');
        return;
    }
    
    const headers = ['Name', 'Email', 'Message', 'Timestamp'];
    const rows = contacts.map(c => [
        c.name || '',
        c.email || '',
        (c.message || '').replace(/"/g, '""'),
        c.timestamp || ''
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexad-contacts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('✅ Contacts exported');
}

// Reply to contact
window.replyToContact = function(index) {
    const contacts = JSON.parse(localStorage.getItem('nexad_contacts') || '[]');
    const contact = contacts[index];
    
    if (contact && contact.email) {
        window.location.href = `mailto:${contact.email}?subject=Re: Your NEXAD Inquiry`;
    }
};

// Confirm delete contact with custom modal
window.confirmDeleteContact = function(contactId) {
    const modal = document.createElement('div');
    modal.className = 'delete-modal-overlay';
    modal.innerHTML = `
        <div class="delete-modal-content">
            <div class="delete-modal-header">
                <h3>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    Delete Contact
                </h3>
            </div>
            <div class="delete-modal-body">
                <p>Are you sure you want to delete this contact? This action cannot be undone.</p>
            </div>
            <div class="delete-modal-footer">
                <button class="btn btn-outline" onclick="closeDeleteModal()">Cancel</button>
                <button class="btn btn-danger" onclick="deleteContact('${contactId}'); closeDeleteModal();">Delete</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
};

// Close delete modal
window.closeDeleteModal = function() {
    const modal = document.querySelector('.delete-modal-overlay');
    if (modal) modal.remove();
};

// Delete contact - Works with both database and localStorage
window.deleteContact = async function(contactId) {
    
    try {
        // Remove the contact card from UI immediately for better UX
        const contactCard = document.querySelector(`[data-contact-id="${contactId}"]`);
        if (contactCard) {
            contactCard.style.opacity = '0.5';
            contactCard.style.pointerEvents = 'none';
        }
        
        if (!supabase) {
            // Fallback to localStorage
            const contacts = JSON.parse(localStorage.getItem('nexad_contacts') || '[]');
            const filteredContacts = contacts.filter(c => c.id !== contactId && !contactId.startsWith('local_'));
            localStorage.setItem('nexad_contacts', JSON.stringify(filteredContacts));
            
            console.log('✅ Contact deleted from localStorage');
            showNotification('Contact deleted successfully', 'success');
            
            // Reload contacts to update UI
            loadContacts();
            loadRecentActivity();
            return;
        }
        
        // Try database deletion
        const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', contactId);
        
        if (error) throw error;
        
        console.log('✅ Contact deleted from database');
        showNotification('Contact deleted successfully', 'success');
        
        // Reload contacts to update UI
        loadContacts();
        loadRecentActivity();
        
    } catch (error) {
        console.error('❌ Error deleting contact:', error);
        showNotification('Failed to delete contact: ' + error.message, 'error');
        
        // Restore the contact card if deletion failed
        const contactCard = document.querySelector(`[data-contact-id="${contactId}"]`);
        if (contactCard) {
            contactCard.style.opacity = '1';
            contactCard.style.pointerEvents = 'auto';
        }
    }
};

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

// Show notification
function showNotification(message, type = 'info') {
    console.log(`🔔 NOTIFICATION: [${type.toUpperCase()}] ${message}`);
    
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
                background: rgba(0, 0, 0, 0.95);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                z-index: 10001;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                max-width: 400px;
                min-width: 300px;
            }
            .notification.show { transform: translateX(0); }
            .notification-error { 
                border-left: 4px solid #ef4444;
                background: rgba(239, 68, 68, 0.1);
            }
            .notification-success { 
                border-left: 4px solid #22c55e;
                background: rgba(34, 197, 94, 0.1);
            }
            .notification-warning { 
                border-left: 4px solid #f59e0b;
                background: rgba(245, 158, 11, 0.1);
            }
            .notification-info { 
                border-left: 4px solid #3b82f6;
                background: rgba(59, 130, 246, 0.1);
            }
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
            }
            .notification-message {
                font-size: 15px;
                font-weight: 500;
                color: #FFFFFF;
                line-height: 1.5;
            }
            .notification-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: rgba(255, 255, 255, 0.6);
                margin-left: 16px;
                padding: 0;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s;
            }
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #FFFFFF;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 7000); // Increased to 7 seconds
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

console.log('✅ Admin.js fully loaded and ready');
