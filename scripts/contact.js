// Contact Page JavaScript

// Google Sign-In Configuration
let currentUser = null;

// Handle Google Sign-In Response
function handleCredentialResponse(response) {
    // Decode the JWT token to get user info
    const userInfo = parseJwt(response.credential);
    
    currentUser = {
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture
    };
    
    // Show the contact form and populate user info
    showContactForm();
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

// Show contact form after authentication
function showContactForm() {
    const authSection = document.getElementById('authSection');
    const contactForm = document.getElementById('contactForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    
    // Hide auth section and show form
    authSection.style.display = 'none';
    contactForm.style.display = 'flex';
    
    // Populate user information
    nameInput.value = currentUser.name;
    emailInput.value = currentUser.email;
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const contactData = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message'),
                timestamp: new Date().toISOString(),
                userInfo: currentUser
            };
            
            // Simulate form submission (replace with actual API call)
            submitContactForm(contactData);
        });
    }
    
    // Handle URL parameters for direct navigation
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject');
    if (subject) {
        const subjectSelect = document.getElementById('subject');
        if (subjectSelect) {
            subjectSelect.value = subject;
        }
    }
});

// Submit contact form (replace with actual API endpoint)
async function submitContactForm(data) {
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = contactForm.querySelector('.submit-btn-modern');
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
        // Simulate API call (replace with actual endpoint)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Store contact data locally for admin (in real app, send to backend)
        const contacts = JSON.parse(localStorage.getItem('nexad_contacts') || '[]');
        contacts.push(data);
        localStorage.setItem('nexad_contacts', JSON.stringify(contacts));
        
        // Show success message
        contactForm.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Send confirmation email (simulate)
        console.log('Contact form submitted:', data);
        
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('There was an error sending your message. Please try again.');
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
    }
}

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        const navItems = navLinks.querySelectorAll('.nav-link');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
});

// Add CSS for loading animation
const style = document.createElement('style');
style.textContent = `
    .animate-spin {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
`;
document.head.appendChild(style);