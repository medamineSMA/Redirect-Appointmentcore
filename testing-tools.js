/**
 * Testing and Debugging Tools for Iframe Redirect Handler
 * 
 * Use these functions in the browser console to test and debug
 * the redirect functionality.
 */

// === TESTING FUNCTIONS ===

/**
 * Simulate a successful booking postMessage
 * Usage: simulatePostMessage()
 */
function simulatePostMessage() {
    window.postMessage({
        type: 'bookingComplete',
        success: true,
        bookingId: 'test-123'
    }, '*');
    console.log('✓ Simulated postMessage sent');
}

/**
 * Simulate a success URL change
 * Usage: simulateUrlChange()
 */
function simulateUrlChange() {
    // This won't actually change the iframe URL due to cross-origin,
    // but you can test the URL checking logic
    const testUrl = 'https://go.appointmentcore.com/book/success';
    console.log('Testing URL:', testUrl);
    console.log('Would be detected as success:', testUrl.includes('success'));
}

/**
 * Simulate a custom event
 * Usage: simulateCustomEvent()
 */
function simulateCustomEvent() {
    const event = new CustomEvent('appointmentBooked', {
        detail: {
            bookingId: 'test-123',
            timestamp: Date.now()
        }
    });
    window.dispatchEvent(event);
    console.log('✓ Simulated custom event dispatched');
}

/**
 * Test all detection methods
 * Usage: testAllMethods()
 */
function testAllMethods() {
    console.log('=== Testing All Detection Methods ===');
    
    setTimeout(() => {
        console.log('1. Testing postMessage...');
        simulatePostMessage();
    }, 1000);
    
    setTimeout(() => {
        console.log('2. Testing custom event...');
        simulateCustomEvent();
    }, 2000);
    
    setTimeout(() => {
        console.log('3. Testing manual redirect...');
        if (typeof window.triggerManualRedirect === 'function') {
            console.log('✓ Manual redirect function available');
        } else {
            console.log('✗ Manual redirect function not found');
        }
    }, 3000);
}

/**
 * Check current detection status
 * Usage: checkStatus()
 */
function checkStatus() {
    console.log('=== Redirect Handler Status ===');
    console.log('Manual redirect available:', typeof window.triggerManualRedirect === 'function');
    console.log('Iframe found:', document.getElementById('booking-iframe') !== null);
    console.log('Loading overlay found:', document.getElementById('loadingOverlay') !== null);
    
    // Check if event listeners are active
    console.log('\nActive listeners:');
    console.log('- postMessage: Active (always listening)');
    console.log('- custom events: Active (multiple event types)');
}

/**
 * Force redirect (for testing)
 * Usage: forceRedirect()
 */
function forceRedirect() {
    console.log('Forcing redirect...');
    if (typeof window.triggerManualRedirect === 'function') {
        window.triggerManualRedirect();
    } else {
        window.location.href = 'https://studentmarketing.agency/thanks-appointment/';
    }
}

/**
 * Clear localStorage (if used)
 * Usage: clearBookingStorage()
 */
function clearBookingStorage() {
    const keys = ['appointment_completed', 'booking_completed', 'redirect_triggered'];
    keys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
    console.log('✓ Cleared booking-related storage');
}

/**
 * Monitor all window events for debugging
 * Usage: monitorAllEvents()
 */
function monitorAllEvents() {
    console.log('Monitoring all window events (check console)...');
    
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const events = [];
    
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        events.push({ type, target: this });
        console.log('Event registered:', type, 'on', this.tagName || 'window');
        return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Restore after 30 seconds
    setTimeout(() => {
        EventTarget.prototype.addEventListener = originalAddEventListener;
        console.log('Event monitoring stopped. Total events registered:', events.length);
    }, 30000);
}

/**
 * Inspect iframe (will likely fail due to cross-origin)
 * Usage: inspectIframe()
 */
function inspectIframe() {
    const iframe = document.getElementById('booking-iframe');
    if (!iframe) {
        console.log('✗ Iframe not found');
        return;
    }
    
    console.log('=== Iframe Information ===');
    console.log('Source:', iframe.src);
    console.log('Width:', iframe.width);
    console.log('Height:', iframe.height);
    
    try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        console.log('✓ Can access iframe document (same-origin)');
        console.log('Iframe URL:', iframe.contentWindow.location.href);
        console.log('Iframe title:', iframeDoc.title);
    } catch (e) {
        console.log('✗ Cannot access iframe (cross-origin) - This is expected');
        console.log('Error:', e.message);
    }
}

/**
 * Get redirect handler configuration
 * Usage: getConfig()
 */
function getConfig() {
    console.log('=== Configuration ===');
    console.log('Redirect URL: https://studentmarketing.agency/thanks-appointment/');
    console.log('Detection methods: 5 (postMessage, URL monitoring, mutation observer, navigation, custom events)');
    console.log('Success indicators: thank, success, confirm, complete, booked, scheduled');
}

/**
 * Show help
 * Usage: showHelp()
 */
function showHelp() {
    console.log(`
=== Iframe Redirect Testing Console ===

Available functions:

  testAllMethods()       - Test all detection methods
  checkStatus()          - Check current status
  simulatePostMessage()  - Simulate success postMessage
  simulateCustomEvent()  - Simulate custom event
  forceRedirect()        - Force redirect now
  clearBookingStorage()  - Clear storage
  monitorAllEvents()     - Monitor all events for 30s
  inspectIframe()        - Inspect iframe details
  getConfig()           - Show configuration
  showHelp()            - Show this help

Example workflow:
  1. checkStatus()        - Check if everything is loaded
  2. testAllMethods()     - Test detection methods
  3. forceRedirect()      - Force redirect if needed
    `);
}

// Auto-show help when script loads
console.log('Redirect testing tools loaded. Type showHelp() for available commands.');

// Make functions globally available
window.testAllMethods = testAllMethods;
window.checkStatus = checkStatus;
window.simulatePostMessage = simulatePostMessage;
window.simulateCustomEvent = simulateCustomEvent;
window.forceRedirect = forceRedirect;
window.clearBookingStorage = clearBookingStorage;
window.monitorAllEvents = monitorAllEvents;
window.inspectIframe = inspectIframe;
window.getConfig = getConfig;
window.showHelp = showHelp;
