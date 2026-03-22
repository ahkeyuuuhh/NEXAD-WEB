// Manual Page JavaScript - Dropdown Flow Cards

document.addEventListener('DOMContentLoaded', function() {
    initializeManual();
    setupEventListeners();
});

// Initialize manual functionality
function initializeManual() {
    // Set default active tab
    const defaultTab = 'student';
    showTab(defaultTab);
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            showTab(tab);
        });
    });
    
    // Flow card dropdown toggle
    const flowHeaders = document.querySelectorAll('.flow-header');
    flowHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const flowCard = header.closest('.flow-card');
            toggleFlowCard(flowCard);
        });
    });
    
    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        const navLinksItems = navLinks.querySelectorAll('.nav-link');
        navLinksItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
}

// Show specific tab (student or teacher)
function showTab(tabName) {
    // Update tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update content sections
    const sections = document.querySelectorAll('.manual-section');
    sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `${tabName}-content`) {
            section.classList.add('active');
        }
    });
    
    // Close all flow cards when switching tabs
    const flowCards = document.querySelectorAll('.flow-card');
    flowCards.forEach(card => {
        card.classList.remove('open');
    });
}

// Toggle flow card open/closed
function toggleFlowCard(flowCard) {
    // Simply toggle the current card without affecting others
    flowCard.classList.toggle('open');
    
    // Smooth scroll to card after opening
    if (flowCard.classList.contains('open')) {
        setTimeout(() => {
            flowCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // Escape key to close all flow cards
    if (e.key === 'Escape') {
        const openFlowCards = document.querySelectorAll('.flow-card.open');
        openFlowCards.forEach(card => {
            card.classList.remove('open');
        });
        
        // Also close mobile menu
        const navLinks = document.querySelector('.nav-links');
        const navToggle = document.querySelector('.nav-toggle');
        if (navLinks && navToggle) {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        }
    }
});

// Make functions available globally
window.showTab = showTab;
window.toggleFlowCard = toggleFlowCard;
