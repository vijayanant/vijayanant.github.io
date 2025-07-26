const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
const navLinks = document.querySelectorAll('.nav-link');

navToggle.addEventListener('click', () => {
    navList.classList.toggle('active');
    navToggle.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navList.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Fetch and display Substack posts
const writingGrid = document.querySelector('.writing-grid');
const substackUrl = 'https://vijayanant.substack.com';

// Using a CORS proxy to fetch the RSS feed
const corsProxy = 'https://api.allorigins.win/get?url=';

async function fetchPosts() {
    try {
        const response = await fetch(`${corsProxy}${encodeURIComponent(substackUrl + '/feed')}`);
        const data = await response.json();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, "application/xml");
        const items = xmlDoc.querySelectorAll("item");

        let posts = '';
        items.forEach((item, index) => {
            if (index < 3) { // Display the latest 3 posts
                const title = item.querySelector("title").textContent;
                const link = item.querySelector("link").textContent;
                const pubDate = new Date(item.querySelector("pubDate").textContent);
                const description = item.querySelector("description").textContent;

                posts += `
                    <div class="writing-item">
                        <h3 class="writing-title"><a href="${link}" target="_blank">${title}</a></h3>
                        <p class="writing-meta"><span>${pubDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                        <p class="writing-description">${description}</p>
                        <a href="${link}" class="read-more-button" target="_blank">Read More</a>
                    </div>
                `;
            }
        });

        if (writingGrid) {
            writingGrid.innerHTML = posts;
        }
    } catch (error) {
        console.error('Error fetching Substack posts:', error);
        if (writingGrid) {
            writing-grid.innerHTML = '<p>Could not load posts. Please visit my <a href="https://vijayanant.substack.com">Substack</a>.</p>';
        }
    }
}

fetchPosts();
