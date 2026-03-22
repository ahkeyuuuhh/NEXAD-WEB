// Page View Tracker - Tracks manual page views
// Increments localStorage counter when manual page is loaded

console.log('📖 Page view tracker loaded');

// Initialize manual views counter if it doesn't exist
function initializeManualViews() {
    if (!localStorage.getItem('nexad_manual_views')) {
        localStorage.setItem('nexad_manual_views', '0');
    }
}

// Track manual page view
function trackManualView() {
    const currentCount = parseInt(localStorage.getItem('nexad_manual_views') || '0');
    const newCount = currentCount + 1;
    localStorage.setItem('nexad_manual_views', newCount.toString());
    console.log('📖 Manual page view tracked:', newCount);
}

// Track page view on load
document.addEventListener('DOMContentLoaded', function() {
    initializeManualViews();
    trackManualView();
});
