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
    
    const exportBtn = document.getElementById('exportContacts');
    if (exportBtn) exportBtn.addEventListener('click', exportContacts);
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
    try {
        const contacts = JSON.parse(localStorage.getItem('nexad_contacts') || '[]');
        console.log('📧 Loaded contacts:', contacts.length);
        
        const contactsCount = document.getElementById('contactsCount');
        const totalContacts = document.getElementById('totalContacts');
        const contactSubmissions = document.getElementById('contactSubmissions');
        
        if (contactsCount) contactsCount.textContent = contacts.length;
        if (totalContacts) totalContacts.textContent = contacts.length;
        if (contactSubmissions) contactSubmissions.textContent = contacts.length;
        
        displayContacts(contacts);
    } catch (error) {
        console.error('❌ Error loading contacts:', error);
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

// Display contacts
function displayContacts(contacts) {
    const contactsList = document.getElementById('contactsList');
    if (!contactsList) return;
    
    if (contacts.length === 0) {
        contactsList.innerHTML = '<div class="empty-state">No contact messages yet</div>';
        return;
    }
    
    contactsList.innerHTML = contacts.map((contact, index) => `
        <div class="contact-card">
            <div class="contact-header">
                <div class="contact-info">
                    <h4>${contact.name || 'Unknown'}</h4>
                    <p>${contact.email || 'No email'}</p>
                </div>
                <div class="contact-meta">
                    <span class="contact-date">${new Date(contact.timestamp).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="contact-body">
                <p>${contact.message || 'No message'}</p>
            </div>
            <div class="contact-actions">
                <button class="btn btn-sm btn-outline" onclick="replyToContact(${index})">Reply</button>
                <button class="btn btn-sm btn-danger" onclick="deleteContact(${index})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Load recent activity
function loadRecentActivity() {
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

// Delete contact
window.deleteContact = function(index) {
    if (confirm('Are you sure you want to delete this contact?')) {
        const contacts = JSON.parse(localStorage.getItem('nexad_contacts') || '[]');
        contacts.splice(index, 1);
        localStorage.setItem('nexad_contacts', JSON.stringify(contacts));
        loadContacts();
        loadRecentActivity();
        console.log('✅ Contact deleted');
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

console.log('✅ Admin.js fully loaded and ready');
