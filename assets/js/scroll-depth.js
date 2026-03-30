/**
 * Scroll Depth Tracking for Google Analytics 4
 * Tracks how far users scroll down the page (25%, 50%, 75%, 90%)
 */
(function() {
    // Only track on article pages (skip homepage, lists, etc.)
    const pageKind = document.body.dataset.pageKind;
    if (pageKind !== 'page') {
        return;
    }

    const thresholds = [25, 50, 75, 90];
    const tracked = { 25: false, 50: false, 75: false, 90: false };

    function getScrollPercent() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        if (scrollHeight <= 0) return 0;
        
        return Math.round((scrollTop / scrollHeight) * 100);
    }

    function trackScrollDepth() {
        const scrollPercent = getScrollPercent();
        
        thresholds.forEach(threshold => {
            if (scrollPercent >= threshold && !tracked[threshold]) {
                tracked[threshold] = true;
                
                if (typeof gtag === 'function') {
                    gtag('event', 'scroll_depth', {
                        percent: threshold,
                        page_path: window.location.pathname,
                        page_title: document.title
                    });
                }
            }
        });
    }

    // Use requestAnimationFrame for better performance
    let ticking = false;
    
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                trackScrollDepth();
                ticking = false;
            });
            ticking = true;
        }
    }

    // Track initial scroll position (in case user lands mid-page)
    setTimeout(trackScrollDepth, 1000);
    
    // Listen for scroll events
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Also track on visibility change (user might leave before hitting next threshold)
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
            trackScrollDepth();
        }
    });
})();
