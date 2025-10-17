const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
const navLinks = document.querySelectorAll('.nav-link'); // Select all nav links
const header = document.querySelector('header');

// Get all sections with an ID
const sections = document.querySelectorAll('section[id]');

function handleScrollspy() {
    // Sticky header logic
    if (window.scrollY > 100) {
        header.classList.add('header-scrolled');
    } else {
        header.classList.remove('header-scrolled');
    }

    // Scrollspy logic
    if (document.body.dataset.pageKind === 'home') {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - header.offsetHeight; // Adjust for fixed header
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (current && link.href.includes(current)) {
                link.classList.add('active');
            }
        });

        if (window.scrollY === 0) {
            const homeLink = document.querySelector('a.nav-link[href*="#hero"]');
            if (homeLink) {
                navLinks.forEach(link => link.classList.remove('active'));
                homeLink.classList.add('active');
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
