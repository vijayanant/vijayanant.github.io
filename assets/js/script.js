// Analytics & interaction tracking
document.addEventListener('click', function(event) {
    const socialLink = event.target.closest('.social-link-click');
    if (socialLink) {
        if (typeof gtag === 'function') {
            const platform = socialLink.getAttribute('aria-label') || 'unknown';
            gtag('event', 'click', {
                'event_category': 'social',
                'event_label': platform,
                'destination_url': socialLink.href
            });
        }
    }

    const shareBtn = event.target.closest('.share-btn-click');
    if (shareBtn) {
        if (typeof gtag === 'function') {
            const platform = shareBtn.title || shareBtn.getAttribute('aria-label') || 'unknown';
            gtag('event', 'share', {
                'method': platform,
                'item_id': window.location.pathname
            });
        }
    }

    const outboundLink = event.target.closest('.outbound-link-click');
    if (outboundLink) {
        if (typeof gtag === 'function') {
            gtag('event', 'click', {
                'event_category': 'outbound',
                'event_label': outboundLink.innerText.trim(),
                'destination_url': outboundLink.href
            });
        }
    }

    const relatedLink = event.target.closest('.related-post-link');
    if (relatedLink) {
        if (typeof gtag === 'function') {
            const postTitle = relatedLink.querySelector('.related-post-title')?.innerText || 'unknown';
            gtag('event', 'select_content', {
                'content_type': 'related_post',
                'item_id': relatedLink.href,
                'item_name': postTitle
            });
        }
    }
});
