// Admin Dashboard JavaScript

// Configuration
const ADMIN_CONFIG = {
    authorizedEmails: [
        'admin@nexad.app',
        'aki.zita@nexad.app',
        'developer@nexad.app'
    ],
    googleClientId: 'YOUR_GOOGLE_CLIENT_ID' // Replace with actual client ID
};

// Global state
let currentAdmin = null;
let contacts = [];
let manualContent = {};

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    loadStoredData();
    setupEventListeners();
});

// Initialize admin authentication
function initializeAdmin() {
    const adminLogin = document.getElementById('adminLogin');
    const adminDashboard = document.getElementById('adminDashboard');
    
    // Check if admin is already logged in
    const storedAdmin = localStorage.getItem('nexad_admin');
    if (storedAdmin) {
        currentAdmin = JSON.parse(storedAdmin);
        showDashboard();
    } else {
        adminLogin.style.display = 'flex';
        adminDashboard.style.display = 'none';
    }
}

// Handle Google Sign-In for admin
function handleAdminLogin(response) {
    try {
        const userInfo = parseJwt(response.credential);
        
        // Check if user is authorized admin
        if (!ADMIN_CONFIG.authorizedEmails.includes(userInfo.email)) {
            alert('Access denied. You are not authorized to access this admin panel.');
            return;
        }
        
        currentAdmin = {
            name: userInfo.name,
            email: userInfo.email,
            picture: userInfo.picture,
            loginTime: new Date().toISOString()
        };
        
        // Store admin session
        localStorage.setItem('nexad_admin', JSON.stringify(currentAdmin));
        
        showDashboard();
        
    } catch (error) {
        console.error('Admin login error:', error);
        alert('Login failed. Please try again.');
    }
}

// Parse JWT token
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
}

// Show admin dashboard
function showDashboard() {
    const adminLogin = document.getElementById('adminLogin');
    const adminDashboard = document.getElementById('adminDashboard');
    const adminAvatar = document.getElementById('adminAvatar');
    const adminName = document.getElementById('adminName');
    
    adminLogin.style.display = 'none';
    adminDashboard.style.display = 'block';
    
    // Update admin profile display
    if (currentAdmin) {
        adminAvatar.src = currentAdmin.picture;
        adminName.textContent = currentAdmin.name;
    }
    
    // Load dashboard data
    loadDashboardData();
}

// Load stored data
function loadStoredData() {
    // Load contacts
    const storedContacts = localStorage.getItem('nexad_contacts');
    if (storedContacts) {
        contacts = JSON.parse(storedContacts);
    }
    
    // Load manual content
    const storedManual = localStorage.getItem('nexad_manual');
    if (storedManual) {
        manualContent = JSON.parse(storedManual);
    } else {
        // Initialize with default content
        manualContent = {
            'student-getting-started': 'Welcome to NEXAD! This guide will help you get started...',
            'student-profile': 'Setting up your profile helps teachers identify you...',
            'student-classrooms': 'Join your classes to access assignments...',
            'teacher-getting-started': 'Welcome to NEXAD teacher interface...',
            'teacher-profile': 'Create a comprehensive profile...',
            'teacher-classrooms': 'Create and manage your virtual classrooms...'
        };
        localStorage.setItem('nexad_manual', JSON.stringify(manualContent));
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            showSection(section);
            
            // Update active nav button
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Contact filters
    const contactFilter = document.getElementById('contactFilter');
    if (contactFilter) {
        contactFilter.addEventListener('change', filterContacts);
    }
    
    // Contact actions
    const markAllReadBtn = document.getElementById('markAllRead');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllContactsRead);
    }
    
    const exportContactsBtn = document.getElementById('exportContacts');
    if (exportContactsBtn) {
        exportContactsBtn.addEventListener('click', exportContacts);
    }
    
    // Manual editor
    const manualSection = document.getElementById('manualSection');
    const saveManualBtn = document.getElementById('saveManual');
    
    if (manualSection) {
        manualSection.addEventListener('change', loadManualSection);
    }
    
    if (saveManualBtn) {
        saveManualBtn.addEventListener('click', saveManualContent);
    }
}

// Show specific section
function showSection(sectionName) {
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Load section-specific data
    switch (sectionName) {
        case 'contacts':
            loadContacts();
            break;
        case 'manual':
            loadManualEditor();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        default:
            loadDashboardData();
    }
}

// Load dashboard overview data
function loadDashboardData() {
    // Update stats
    document.getElementById('totalContacts').textContent = contacts.length;
    document.getElementById('contactsCount').textContent = contacts.filter(c => !c.read).length;
    
    // Load recent activity
    loadRecentActivity();
}

// Load recent activity
function loadRecentActivity() {
    const activityList = document.getElementById('recentActivity');
    if (!activityList) return;
    
    const recentContacts = contacts.slice(-5).reverse();
    
    if (recentContacts.length === 0) {
        activityList.innerHTML = '<p style="text-align: center; color: #64748b;">No recent activity</p>';
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
                <p>New contact from ${contact.name}</p>
                <span class="activity-time">${formatTimeAgo(contact.timestamp)}</span>
            </div>
        </div>
    `).join('');
}

// Load contacts section
function loadContacts() {
    const contactsList = document.getElementById('contactsList');
    if (!contactsList) return;
    
    if (contacts.length === 0) {
        contactsList.innerHTML = '<p style="text-align: center; padding: 40px; color: #64748b;">No contact messages yet</p>';
        return;
    }
    
    const sortedContacts = [...contacts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    contactsList.innerHTML = sortedContacts.map(contact => `
        <div class="contact-item ${!contact.read ? 'contact-unread' : ''}" onclick="toggleContactRead('${contact.timestamp}')">
            <div class="contact-header">
                <div class="contact-info">
                    <h4>${contact.name}</h4>
                    <p>${contact.email}</p>
                </div>
                <div class="contact-meta">
                    <div class="contact-subject">${contact.subject}</div>
                    <div>${formatDate(contact.timestamp)}</div>
                </div>
            </div>
            <div class="contact-message">${contact.message}</div>
        </div>
    `).join('');
}

// Filter contacts
function filterContacts() {
    const filter = document.getElementById('contactFilter').value;
    let filteredContacts = [...contacts];
    
    switch (filter) {
        case 'unread':
            filteredContacts = contacts.filter(c => !c.read);
            break;
        case 'technical':
            filteredContacts = contacts.filter(c => c.subject === 'technical');
            break;
        case 'general':
            filteredContacts = contacts.filter(c => c.subject === 'general');
            break;
        case 'bug':
            filteredContacts = contacts.filter(c => c.subject === 'bug');
            break;
    }
    
    // Update display with filtered contacts
    const contactsList = document.getElementById('contactsList');
    if (filteredContacts.length === 0) {
        contactsList.innerHTML = '<p style="text-align: center; padding: 40px; color: #64748b;">No contacts match the selected filter</p>';
        return;
    }
    
    const sortedContacts = filteredContacts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    contactsList.innerHTML = sortedContacts.map(contact => `
        <div class="contact-item ${!contact.read ? 'contact-unread' : ''}" onclick="toggleContactRead('${contact.timestamp}')">
            <div class="contact-header">
                <div class="contact-info">
                    <h4>${contact.name}</h4>
                    <p>${contact.email}</p>
                </div>
                <div class="contact-meta">
                    <div class="contact-subject">${contact.subject}</div>
                    <div>${formatDate(contact.timestamp)}</div>
                </div>
            </div>
            <div class="contact-message">${contact.message}</div>
        </div>
    `).join('');
}

// Toggle contact read status
function toggleContactRead(timestamp) {
    const contact = contacts.find(c => c.timestamp === timestamp);
    if (contact) {
        contact.read = !contact.read;
        localStorage.setItem('nexad_contacts', JSON.stringify(contacts));
        loadContacts();
        loadDashboardData(); // Update counters
    }
}

// Mark all contacts as read
function markAllContactsRead() {
    contacts.forEach(contact => contact.read = true);
    localStorage.setItem('nexad_contacts', JSON.stringify(contacts));
    loadContacts();
    loadDashboardData();
}

// Export contacts to CSV
function exportContacts() {
    if (contacts.length === 0) {
        alert('No contacts to export');
        return;
    }
    
    const csvContent = [
        ['Name', 'Email', 'Subject', 'Message', 'Date', 'Read'],
        ...contacts.map(contact => [
            contact.name,
            contact.email,
            contact.subject,
            contact.message.replace(/"/g, '""'), // Escape quotes
            formatDate(contact.timestamp),
            contact.read ? 'Yes' : 'No'
        ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexad-contacts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Load manual editor
function loadManualEditor() {
    const manualSection = document.getElementById('manualSection');
    const manualEditor = document.getElementById('manualEditor');
    
    if (manualSection && manualEditor) {
        const selectedSection = manualSection.value;
        manualEditor.value = manualContent[selectedSection] || '';
    }
}

// Load specific manual section
function loadManualSection() {
    const manualSection = document.getElementById('manualSection');
    const manualEditor = document.getElementById('manualEditor');
    
    if (manualSection && manualEditor) {
        const selectedSection = manualSection.value;
        manualEditor.value = manualContent[selectedSection] || '';
    }
}

// Save manual content
function saveManualContent() {
    const manualSection = document.getElementById('manualSection');
    const manualEditor = document.getElementById('manualEditor');
    const saveBtn = document.getElementById('saveManual');
    
    if (!manualSection || !manualEditor) return;
    
    const selectedSection = manualSection.value;
    const content = manualEditor.value;
    
    // Show loading state
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    // Save content
    manualContent[selectedSection] = content;
    localStorage.setItem('nexad_manual', JSON.stringify(manualContent));
    
    // Show success state
    setTimeout(() => {
        saveBtn.textContent = 'Saved!';
        setTimeout(() => {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Changes';
        }, 1000);
    }, 500);
}

// Load analytics
function loadAnalytics() {
    // This would typically fetch real analytics data from your backend
    // For now, we'll use mock data
    console.log('Analytics loaded');
}

// Logout function
function logout() {
    localStorage.removeItem('nexad_admin');
    currentAdmin = null;
    location.reload();
}

// Utility functions
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// Make functions available globally for Google Sign-In callback
window.handleAdminLogin = handleAdminLogin;
window.toggleContactRead = toggleContactRead;