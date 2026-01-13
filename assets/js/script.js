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

    // Scrollspy logic
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
        } else if (window.scrollY < HEADER_SCROLL_THRESHOLD && (window.location.pathname === '/' || window.location.pathname === '/index.html')) {
             // If near top of homepage, highlight Home
             navLinks.forEach(link => link.classList.remove('active'));
             const homeLink = document.querySelector('a.nav-link.js-scrollspy-item[href*="#hero"]');
             if (homeLink) homeLink.classList.add('active');
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

// Handle Newsletter Form Submission
document.querySelectorAll('.newsletter-form').forEach(form => {
  form.addEventListener('submit', function(event) {
    event.preventDefault();

    const messageDiv = form.querySelector('.newsletter-message');
    const submitButton = form.querySelector('input[type="submit"]');
    messageDiv.textContent = 'Submitting...';
    submitButton.disabled = true;

    const formData = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: formData,
      mode: 'no-cors', // Important for cross-domain form posts that don't need to read the response
    })
    .then(response => {
        // Because of no-cors, we can't read the response body.
        // We have to assume success and instruct the user to check their email.
        form.reset();
        messageDiv.textContent = 'Great! Now check your inbox to confirm your subscription.';
        messageDiv.style.color = 'var(--primary-color)';
    })
    .catch(error => {
      messageDiv.textContent = 'An error occurred. Please try again.';
      messageDiv.style.color = 'var(--note-danger-border)';
      console.error('Form submission error:', error);
    })
    .finally(() => {
      submitButton.disabled = false;
    });
  });
});
