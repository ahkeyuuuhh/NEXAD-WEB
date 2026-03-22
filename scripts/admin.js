// Admin Dashboard JavaScript - Secure Authentication
// Only allows nexad.support@gmail.com to access

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

// Admin email whitelist
const ADMIN_EMAIL = 'nexad.support@gmail.com';

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
        return;
    }
    
    try {
        console.log('🔵 [Admin] Checking for existing session...');
        
        // Check for OAuth tokens in URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken) {
            console.log('🟢 [Admin] Found OAuth tokens in URL');
            
            const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || ''
            });
            
            if (error) {
                console.error('🔴 [Admin] Error setting session:', error);
                showError('Authentication failed. Please try again.');
                return;
            }
            
            if (data.session && data.session.user) {
                console.log('🟢 [Admin] Session set for:', data.session.user.email);
                
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
                
                // Verify admin email
                await verifyAndShowDashboard(data.session.user);
                return;
            }
        }
        
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('🔴 [Admin] Error checking session:', error);
            return;
        }

        if (session && session.user) {
            console.log('🟢 [Admin] Existing session found:', session.user.email);
            await verifyAndShowDashboard(session.user);
        } else {
            console.log('🟡 [Admin] No existing session found');
            showLoginScreen();
        }
    } catch (error) {
        console.error('🔴 [Admin] Exception:', error);
        showLoginScreen();
    }
}

// Verify admin email and show dashboard
async function verifyAndShowDashboard(user) {
    console.log('🔍 [Admin] Verifying admin email:', user.email);
    
    // Check if email matches admin email
    if (user.email !== ADMIN_EMAIL) {
        console.error('🔴 [Admin] Unauthorized email:', user.email);
        
        // Sign out unauthorized user
        await supabase.auth.signOut();
        
        // Show error
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
    document.getElementById('adminLogin').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

// Show dashboard
function showDashboard() {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    
    // Update admin profile
    if (currentAdmin) {
        const adminName = document.getElementById('adminName');
        const adminAvatar = document.getElementById('adminAvatar');
        
        if (adminName) {
            adminName.textContent = currentAdmin.name;
        }
        
        if (adminAvatar && currentAdmin.picture) {
            adminAvatar.src = currentAdmin.picture;
        } else if (adminAvatar) {
            // Default avatar
            adminAvatar.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Ccircle cx="20" cy="20" r="20" fill="%23667eea"/%3E%3Ctext x="20" y="26" font-size="16" fill="white" text-anchor="middle" font-family="Arial"%3E' + currentAdmin.name.charAt(0).toUpperCase() + '%3C/text%3E%3C/svg%3E';
        }
    }
    
    // Load dashboard data
    loadDashboardData();
}

// Setup event listeners
function setupEventListeners() {
    // Login button (we'll add this to HTML)
    const loginBtn = document.getElementById('adminLoginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleAdminLogin);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Navigation buttons
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Export contacts button
    const exportBtn = document.getElementById('exportContacts');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportContacts);
    }
    
    // Mark all read button
    const markAllReadBtn = document.getElementById('markAllRead');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllContactsRead);
    }
    
    // Save manual button
    const saveManualBtn = document.getElementById('saveManual');
    if (saveManualBtn) {
        saveManualBtn.addEventListener('click', saveManualContent);
    }
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
                    hd: 'gmail.com' // Hint to use Gmail accounts
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
            loginBtn.textContent = 'Sign in with Google';
        }
    }
}

// Handle logout
async function handleLogout() {
    console.log('🔵 [Admin] Logging out...');
    
    if (supabase) {
        await supabase.auth.signOut();
    }
    
    currentAdmin = null;
    showLoginScreen();
    
    console.log('✅ [Admin] Logged out successfully');
}

// Show section
function showSection(sectionId) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');
    
    // Update sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId)?.classList.add('active');
}

// Load dashboard data
function loadDashboardData() {
    loadContacts();
    updateStats();
    loadRecentActivity();
}

// Load contacts from localStorage
function loadContacts() {
    try {
        const contacts = JSON.parse(localStorage.getItem('nexad_contacts') || '[]');
        console.log('📧 Loaded contacts:', contacts.length);
        
        // Update count
        const contactsCount = document.getElementById('contactsCount');
        const totalContacts = document.getElementById('totalContacts');
        
        if (contactsCount) {
            contactsCount.textContent = contacts.length;
        }
        if (totalContacts) {
            totalContacts.textContent = contacts.length;
        }
        
        // Display contacts
        displayContacts(contacts);
    } catch (error) {
        console.error('❌ Error loading contacts:', error);
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

// Update stats
function updateStats() {
    // These would normally come from a backend API
    // For now, using placeholder data
    console.log('📊 Updating stats...');
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
    
    // Create CSV content
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
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexad-contacts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('✅ Contacts exported');
}

// Mark all contacts as read
function markAllContactsRead() {
    console.log('✅ All contacts marked as read');
    alert('All contacts marked as read');
}

// Save manual content
function saveManualContent() {
    const section = document.getElementById('manualSection').value;
    const content = document.getElementById('manualEditor').value;
    
    // Save to localStorage (in production, this would go to a backend)
    const manualData = JSON.parse(localStorage.getItem('nexad_manual') || '{}');
    manualData[section] = content;
    localStorage.setItem('nexad_manual', JSON.stringify(manualData));
    
    console.log('✅ Manual content saved');
    alert('Manual content saved successfully!');
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
        console.log('✅ Contact deleted');
    }
};

// Show error message
function showError(message) {
    const loginCard = document.querySelector('.login-card');
    if (!loginCard) return;
    
    // Remove existing error
    const existingError = loginCard.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        background: #fee;
        color: #c33;
        padding: 12px 16px;
        border-radius: 8px;
        margin-top: 16px;
        font-size: 14px;
        border: 1px solid #fcc;
    `;
    
    loginCard.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

console.log('✅ Admin.js fully loaded and ready');
