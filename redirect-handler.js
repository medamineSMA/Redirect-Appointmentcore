/**
 * Robust Iframe Redirect Handler
 * Handles redirect after appointment submission in cross-origin iframe
 */

(function() {
    'use strict';
    
    const CONFIG = {
        redirectUrl: 'https://studentmarketing.agency/thanks-appointment/',
        iframe: null,
        loadingOverlay: null,
        redirectDelay: 1500, // Delay before redirect (ms)
        checkInterval: 500, // Polling interval (ms)
        maxRedirectAttempts: 3,
        redirectAttempts: 0
    };
    
    // Keywords that might appear in success URLs or messages
    const SUCCESS_INDICATORS = [
        'thank',
        'success',
        'confirm',
        'complete',
        'booked',
        'scheduled',
        'appointment-confirmed'
    ];
    
    /**
     * Initialize the redirect handler
     */
    function init() {
        CONFIG.iframe = document.getElementById('booking-iframe');
        CONFIG.loadingOverlay = document.getElementById('loadingOverlay');
        
        if (!CONFIG.iframe) {
            console.error('Booking iframe not found');
            return;
        }
        
        console.log('Redirect handler initialized');
        
        // Method 1: Listen for postMessage from iframe
        setupPostMessageListener();
        
        // Method 2: Monitor iframe URL changes (if accessible)
        setupUrlMonitoring();
        
        // Method 3: Monitor for DOM changes around iframe
        setupMutationObserver();
        
        // Method 4: Watch for navigation events
        setupNavigationWatcher();
        
        // Method 5: Custom event listener (if booking system dispatches events)
        setupCustomEventListener();
    }
    
    /**
     * Method 1: PostMessage API
     * Listen for messages from the iframe (if the booking system supports it)
     */
    function setupPostMessageListener() {
        window.addEventListener('message', function(event) {
            // Verify origin for security
            if (!event.origin.includes('appointmentcore.com')) {
                return;
            }
            
            console.log('PostMessage received:', event.data);
            
            // Check if message indicates success
            if (isSuccessMessage(event.data)) {
                console.log('Success detected via postMessage');
                triggerRedirect('postMessage');
            }
        });
        
        console.log('PostMessage listener setup complete');
    }
    
    /**
     * Method 2: URL Monitoring
     * Periodically check if iframe URL has changed to success page
     */
    function setupUrlMonitoring() {
        let lastUrl = '';
        
        const urlChecker = setInterval(function() {
            try {
                // This will throw an error if cross-origin, but worth trying
                const currentUrl = CONFIG.iframe.contentWindow.location.href;
                
                if (currentUrl !== lastUrl) {
                    lastUrl = currentUrl;
                    console.log('URL changed:', currentUrl);
                    
                    if (isSuccessUrl(currentUrl)) {
                        console.log('Success detected via URL monitoring');
                        clearInterval(urlChecker);
                        triggerRedirect('urlMonitoring');
                    }
                }
            } catch (e) {
                // Expected for cross-origin iframes
                // Silently continue
            }
        }, CONFIG.checkInterval);
        
        console.log('URL monitoring setup complete');
    }
    
    /**
     * Method 3: Mutation Observer
     * Watch for DOM changes that might indicate completion
     */
    function setupMutationObserver() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // Check if new nodes contain success indicators
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        const text = node.textContent || node.innerText || '';
                        if (containsSuccessIndicator(text)) {
                            console.log('Success detected via mutation observer');
                            observer.disconnect();
                            triggerRedirect('mutationObserver');
                        }
                    }
                });
            });
        });
        
        // Observe the body for any changes
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
        
        console.log('Mutation observer setup complete');
    }
    
    /**
     * Method 4: Navigation Watcher
     * Monitor for beforeunload or other navigation events from iframe
     */
    function setupNavigationWatcher() {
        CONFIG.iframe.addEventListener('load', function() {
            console.log('Iframe loaded/reloaded');
            
            // Check if the new URL (if accessible) indicates success
            try {
                const url = CONFIG.iframe.contentWindow.location.href;
                if (isSuccessUrl(url)) {
                    console.log('Success detected via navigation watcher');
                    triggerRedirect('navigationWatcher');
                }
            } catch (e) {
                // Cross-origin restriction
            }
        });
        
        console.log('Navigation watcher setup complete');
    }
    
    /**
     * Method 5: Custom Event Listener
     * Listen for custom events that might be dispatched by the booking system
     */
    function setupCustomEventListener() {
        const eventNames = [
            'appointmentBooked',
            'bookingComplete',
            'bookingSuccess',
            'appointmentSubmitted',
            'formSubmitted'
        ];
        
        eventNames.forEach(function(eventName) {
            window.addEventListener(eventName, function(event) {
                console.log('Custom event detected:', eventName, event.detail);
                triggerRedirect('customEvent');
            });
        });
        
        console.log('Custom event listeners setup complete');
    }
    
    /**
     * Check if a message indicates success
     */
    function isSuccessMessage(data) {
        if (!data) return false;
        
        // Check if data is an object with success property
        if (typeof data === 'object' && data.success === true) {
            return true;
        }
        
        if (typeof data === 'object' && data.status === 'success') {
            return true;
        }
        
        if (typeof data === 'object' && data.type === 'bookingComplete') {
            return true;
        }
        
        // Check string content
        const dataStr = JSON.stringify(data).toLowerCase();
        return SUCCESS_INDICATORS.some(indicator => dataStr.includes(indicator));
    }
    
    /**
     * Check if URL indicates success
     */
    function isSuccessUrl(url) {
        if (!url) return false;
        
        const urlLower = url.toLowerCase();
        return SUCCESS_INDICATORS.some(indicator => urlLower.includes(indicator));
    }
    
    /**
     * Check if text contains success indicators
     */
    function containsSuccessIndicator(text) {
        if (!text) return false;
        
        const textLower = text.toLowerCase();
        return SUCCESS_INDICATORS.some(indicator => textLower.includes(indicator));
    }
    
    /**
     * Trigger the redirect with loading overlay
     */
    function triggerRedirect(method) {
        // Prevent multiple redirects
        if (CONFIG.redirectAttempts >= CONFIG.maxRedirectAttempts) {
            console.log('Max redirect attempts reached');
            return;
        }
        
        CONFIG.redirectAttempts++;
        
        console.log(`Triggering redirect (method: ${method}, attempt: ${CONFIG.redirectAttempts})`);
        
        // Show loading overlay
        if (CONFIG.loadingOverlay) {
            CONFIG.loadingOverlay.classList.add('active');
        }
        
        // Optional: Send analytics event
        trackRedirect(method);
        
        // Perform redirect after delay
        setTimeout(function() {
            window.location.href = CONFIG.redirectUrl;
        }, CONFIG.redirectDelay);
    }
    
    /**
     * Track redirect for analytics (optional)
     */
    function trackRedirect(method) {
        try {
            // Google Analytics 4
            if (typeof gtag !== 'undefined') {
                gtag('event', 'appointment_complete', {
                    'method': method,
                    'redirect_url': CONFIG.redirectUrl
                });
            }
            
            // Google Analytics Universal
            if (typeof ga !== 'undefined') {
                ga('send', 'event', 'Appointment', 'Complete', method);
            }
            
            // Facebook Pixel
            if (typeof fbq !== 'undefined') {
                fbq('track', 'Schedule', {
                    method: method
                });
            }
            
            console.log('Analytics tracked:', method);
        } catch (e) {
            console.log('Analytics tracking failed:', e);
        }
    }
    
    /**
     * Manual trigger function (can be called from console or by custom button)
     */
    window.triggerManualRedirect = function() {
        console.log('Manual redirect triggered');
        triggerRedirect('manual');
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
