const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
const navLinks = document.querySelectorAll('.nav-link'); // Select all nav links

navToggle.addEventListener('click', () => {
    navList.classList.toggle('active');
});

// Add event listener to each nav link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navList.classList.remove('active'); // Close the menu
    });
});
