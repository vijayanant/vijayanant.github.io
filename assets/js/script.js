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

// Fetch and display Substack posts
const latestPostsGrid = document.querySelector('#latest-posts-grid');
const latestPostsTitle = document.querySelector('#latest-posts-title');
const substackUrl = 'https://vijayanant.substack.com';

// Using a CORS proxy to fetch the RSS feed
const corsProxy = 'https://api.allorigins.win/get?url=';

async function fetchPosts() {
    if (!latestPostsGrid) return;

    try {
        const response = await fetch(`${corsProxy}${encodeURIComponent(substackUrl + '/feed')}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, "application/xml");
        const items = xmlDoc.querySelectorAll("item");

        let postsHtml = '';
        let count = 0;
        items.forEach(item => {
            if (count < 3) { // Only append the latest 3 posts
                const title = item.querySelector("title").textContent;
                const link = item.querySelector("link").textContent;
                const pubDate = new Date(item.querySelector("pubDate").textContent);
                const description = item.querySelector("description").textContent.trim();

                postsHtml += `
                    <div class="writing-item">
                        <h3 class="writing-title"><a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a></h3>
                        <p class="writing-meta"><span>${pubDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                        <p class="writing-description">${description}</p>
                        <a href="${link}" class="read-more-button" target="_blank" rel="noopener noreferrer">Read More &rarr;</a>
                    </div>
                `;
                count++;
            }
        });

        if (postsHtml !== '') {
            latestPostsTitle.style.display = 'block';
            latestPostsGrid.innerHTML = postsHtml;
        }
    } catch (error) {
        console.error('Error fetching Substack posts:', error);
        // If fetch fails, do nothing. Hardcoded content will remain.
    }
}

fetchPosts();