const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
const navLinks = document.querySelectorAll('.nav-link'); // Select all nav links
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('header-scrolled');
    } else {
        header.classList.remove('header-scrolled');
    }
});

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
const writingGrid = document.querySelector('.writing-grid');
const substackUrl = 'https://vijayanant.substack.com';

// Using a CORS proxy to fetch the RSS feed
const corsProxy = 'https://api.allorigins.win/get?url=';

async function fetchPosts() {
    if (!writingGrid) return;

    try {
        const response = await fetch(`${corsProxy}${encodeURIComponent(substackUrl + '/feed')}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, "application/xml");
        const items = xmlDoc.querySelectorAll("item");

        let posts = '';
        let count = 0;
        items.forEach(item => {
            if (count < 3) {
                const title = item.querySelector("title").textContent;
                const link = item.querySelector("link").textContent;
                const pubDate = new Date(item.querySelector("pubDate").textContent);
                const description = item.querySelector("description").textContent.trim();

                posts += `
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

        writingGrid.innerHTML = posts;
    } catch (error) {
        console.error('Error fetching Substack posts:', error);
        if (writingGrid) {
            writingGrid.innerHTML = `<p style="color: var(--secondary-text-color);">Could not load posts. Please visit my <a href="${substackUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--primary-color);">Substack</a> for the latest articles.</p>`;
        }
    }
}

fetchPosts();