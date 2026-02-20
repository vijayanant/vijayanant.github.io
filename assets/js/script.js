const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
const navLinks = document.querySelectorAll('a.nav-link.js-scrollspy-item'); // Select all anchor nav links managed by scrollspy
const header = document.querySelector('header');

// Get all sections with an ID
const sections = document.querySelectorAll('section[id]');

const HEADER_SCROLL_THRESHOLD = 100;

function handleScrollspy() {
    // Sticky header logic
    if (window.scrollY > HEADER_SCROLL_THRESHOLD) {
        header.classList.add('header-scrolled');
    } else {
        header.classList.remove('header-scrolled');
    }

    // Scrollspy logic (Only on Homepage)
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        let current = '';
        
        // Only perform scrollspy if we have sections to spy on
        if (sections.length > 0) {
            sections.forEach(section => {
                const sectionTop = section.offsetTop - header.offsetHeight; // Adjust for fixed header
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });

            if (current) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.href.includes(current)) {
                        link.classList.add('active');
                    }
                });
            } else if (window.scrollY < HEADER_SCROLL_THRESHOLD) {
                 // If near top of homepage, highlight Home
                 navLinks.forEach(link => link.classList.remove('active'));
                 const homeLink = document.querySelector('a.nav-link.js-scrollspy-item[href*="#hero"]');
                 if (homeLink) homeLink.classList.add('active');
            }
        }
    }
}

window.addEventListener('scroll', handleScrollspy); // Continue to run on scroll
document.addEventListener('DOMContentLoaded', handleScrollspy);

navToggle.addEventListener('click', () => {
    navList.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Add event listener to each nav link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navList.classList.remove('active'); // Close the menu
        navToggle.classList.remove('active');
    });
});

// Close hamburger menu on outside click
document.addEventListener('click', function(event) {
  if (!navList.classList.contains('active')) {
    return;
  }

  const isClickOnToggle = navToggle.contains(event.target);
  const isClickInsideNav = navList.contains(event.target);

  if (!isClickOnToggle && !isClickInsideNav) {
    navList.classList.remove('active');
    navToggle.classList.remove('active');
  }
});

// Track Workshop Contact Clicks
document.addEventListener('click', function(event) {
    const workshopButton = event.target.closest('.workshop-contact-button');
    if (workshopButton) {
        if (typeof gtag === 'function') {
            gtag('event', 'generate_lead', {
                'event_category': 'business',
                'event_label': 'workshop_inquiry'
            });
        }
    }

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
