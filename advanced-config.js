/**
 * Advanced Configuration for Iframe Redirect Handler
 * 
 * This file provides additional configuration options and alternative
 * detection strategies for the redirect handler.
 */

// Advanced Configuration Object
const ADVANCED_CONFIG = {
    
    // === REDIRECT SETTINGS ===
    redirectUrl: 'https://studentmarketing.agency/thanks-appointment/',
    
    // Add query parameters to track the source
    appendSourceParam: true,
    sourceParamName: 'source',
    sourceParamValue: 'appointment_booking',
    
    // Delay before redirect (gives user time to see confirmation)
    redirectDelay: 2000, // 2 seconds
    
    // Show countdown timer
    showCountdown: true,
    
    
    // === DETECTION SETTINGS ===
    
    // Polling interval for URL checking
    checkInterval: 500, // Check every 500ms
    
    // Maximum time to keep polling (in milliseconds)
    maxPollingTime: 300000, // 5 minutes
    
    // Enable/disable specific detection methods
    methods: {
        postMessage: true,
        urlMonitoring: true,
        mutationObserver: true,
        navigationWatcher: true,
        customEvents: true
    },
    
    
    // === SUCCESS DETECTION ===
    
    // Custom success indicators
    successIndicators: {
        // URL patterns that indicate success
        urlPatterns: [
            'thank',
            'success',
            'confirm',
            'complete',
            'booked',
            'scheduled',
            'appointment-confirmed',
            'booking-complete'
        ],
        
        // Message patterns
        messagePatterns: [
            'booking confirmed',
            'appointment scheduled',
            'successfully booked',
            'reservation confirmed'
        ],
        
        // CSS classes that might appear on success
        cssClasses: [
            'success-message',
            'booking-confirmed',
            'appointment-success',
            'confirmation-page'
        ],
        
        // Data attributes to watch for
        dataAttributes: [
            'data-booking-status',
            'data-appointment-confirmed',
            'data-success'
        ]
    },
    
    
    // === ANALYTICS SETTINGS ===
    
    analytics: {
        enabled: true,
        
        // Google Analytics 4
        ga4: {
            enabled: true,
            eventName: 'appointment_complete',
            eventParams: {
                method: '', // Will be filled dynamically
                value: 1,
                currency: 'USD'
            }
        },
        
        // Facebook Pixel
        facebook: {
            enabled: true,
            eventName: 'Schedule'
        },
        
        // Custom tracking endpoint
        custom: {
            enabled: false,
            endpoint: '/api/track-appointment',
            method: 'POST'
        }
    },
    
    
    // === FALLBACK OPTIONS ===
    
    fallback: {
        // Show manual button after timeout
        showManualButton: true,
        manualButtonDelay: 30000, // Show after 30 seconds
        
        // Enable localStorage to prevent duplicate redirects
        useLocalStorage: true,
        storageKey: 'appointment_completed',
        storageDuration: 3600000, // 1 hour
        
        // Custom callback URL parameter
        // Some booking systems support ?return_url= or ?callback=
        tryCallbackParam: true,
        callbackParamName: 'return_url'
    },
    
    
    // === DEBUG SETTINGS ===
    
    debug: {
        enabled: true, // Set to false in production
        logPrefix: '[Iframe Redirect]',
        verboseLogging: true
    },
    
    
    // === CUSTOM CALLBACKS ===
    
    callbacks: {
        // Called before redirect
        beforeRedirect: function(method) {
            console.log('About to redirect via method:', method);
            // Add custom logic here
        },
        
        // Called if redirect fails
        onRedirectFail: function(error) {
            console.error('Redirect failed:', error);
            // Add custom error handling
        },
        
        // Called when success is detected
        onSuccessDetected: function(method, data) {
            console.log('Success detected:', method, data);
            // Add custom success handling
        }
    }
};

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ADVANCED_CONFIG;
}


// === ALTERNATIVE DETECTION STRATEGIES ===

/**
 * Strategy 1: Iframe Size Change Detection
 * Some booking systems resize the iframe on success
 */
function detectIframeSizeChange() {
    const iframe = document.getElementById('booking-iframe');
    if (!iframe) return;
    
    let lastHeight = iframe.offsetHeight;
    
    setInterval(function() {
        const currentHeight = iframe.offsetHeight;
        if (currentHeight !== lastHeight) {
            console.log('Iframe height changed:', lastHeight, '→', currentHeight);
            lastHeight = currentHeight;
            
            // If height significantly reduced, might indicate completion
            if (currentHeight < lastHeight * 0.5) {
                console.log('Significant height reduction detected - possible success');
                // Trigger success check
            }
        }
    }, 1000);
}


/**
 * Strategy 2: Focus Change Detection
 * Detect when iframe loses focus (might indicate redirect)
 */
function detectFocusChange() {
    const iframe = document.getElementById('booking-iframe');
    if (!iframe) return;
    
    iframe.contentWindow.addEventListener('blur', function() {
        console.log('Iframe lost focus');
        // Might indicate a popup or redirect
    });
}


/**
 * Strategy 3: Network Activity Monitoring
 * Check for specific network requests (requires Service Worker)
 */
function monitorNetworkActivity() {
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name.includes('appointmentcore.com')) {
                    console.log('Network request:', entry.name);
                    
                    // Check if it's a booking confirmation endpoint
                    if (entry.name.includes('confirm') || 
                        entry.name.includes('book') ||
                        entry.name.includes('submit')) {
                        console.log('Potential booking request detected');
                    }
                }
            }
        });
        
        observer.observe({ entryTypes: ['resource'] });
    }
}


/**
 * Strategy 4: Cookie/Storage Change Detection
 * Monitor for cookies that might be set on success
 */
function monitorStorageChanges() {
    let lastCookies = document.cookie;
    
    setInterval(function() {
        const currentCookies = document.cookie;
        if (currentCookies !== lastCookies) {
            console.log('Cookies changed');
            
            // Check for success-related cookies
            if (currentCookies.includes('booking') || 
                currentCookies.includes('appointment') ||
                currentCookies.includes('confirmed')) {
                console.log('Success-related cookie detected');
            }
            
            lastCookies = currentCookies;
        }
    }, 1000);
}


/**
 * Strategy 5: URL Hash Change Detection
 * Some systems use hash changes for navigation
 */
function monitorHashChanges() {
    window.addEventListener('hashchange', function(event) {
        console.log('Hash changed:', event.oldURL, '→', event.newURL);
        
        // Check if new hash indicates success
        if (window.location.hash.includes('success') ||
            window.location.hash.includes('complete')) {
            console.log('Success hash detected');
        }
    });
}


// Initialize alternative strategies
if (ADVANCED_CONFIG.debug.enabled) {
    document.addEventListener('DOMContentLoaded', function() {
        detectIframeSizeChange();
        monitorNetworkActivity();
        monitorStorageChanges();
        monitorHashChanges();
    });
}
