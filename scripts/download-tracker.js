// Download Tracker - Tracks APK and IPA downloads
// Increments localStorage counters when download buttons are clicked

console.log('📊 Download tracker loaded');

// Initialize download counters if they don't exist
function initializeCounters() {
    if (!localStorage.getItem('nexad_apk_downloads')) {
        localStorage.setItem('nexad_apk_downloads', '0');
    }
    if (!localStorage.getItem('nexad_ipa_downloads')) {
        localStorage.setItem('nexad_ipa_downloads', '0');
    }
    console.log('✅ Download counters initialized');
}

// Track APK download
function trackAPKDownload() {
    const currentCount = parseInt(localStorage.getItem('nexad_apk_downloads') || '0');
    const newCount = currentCount + 1;
    localStorage.setItem('nexad_apk_downloads', newCount.toString());
    console.log('📱 APK download tracked:', newCount);
}

// Track IPA download
function trackIPADownload() {
    const currentCount = parseInt(localStorage.getItem('nexad_ipa_downloads') || '0');
    const newCount = currentCount + 1;
    localStorage.setItem('nexad_ipa_downloads', newCount.toString());
    console.log('🍎 IPA download tracked:', newCount);
}

// Setup download tracking on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeCounters();
    
    // Find all download buttons
    const androidBtn = document.querySelector('.android-btn');
    const iosBtn = document.querySelector('.ios-btn');
    
    // Track Android APK downloads
    if (androidBtn) {
        androidBtn.addEventListener('click', function(e) {
            // Only track if there's an actual download URL
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                trackAPKDownload();
            }
        });
        console.log('✅ Android download button tracked');
    }
    
    // Track iOS IPA downloads
    if (iosBtn) {
        iosBtn.addEventListener('click', function(e) {
            // Only track if there's an actual download URL
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                trackIPADownload();
            }
        });
        console.log('✅ iOS download button tracked');
    }
});
