(function() {
    // Check if search is enabled in Hugo params (passed via data attribute in baseof.html)
    const enableSearch = document.body.dataset.enableSearch === 'true';
    if (!enableSearch) {
        return; // Exit if search is not enabled
    }

    const searchButton = document.getElementById('search-button');
    const searchOverlay = document.getElementById('search-overlay');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    let fuse; // Variable to hold our Fuse instance
    let searchData = []; // Variable to hold the fetched JSON data

    // Function to fetch the search index
    async function fetchSearchIndex() {
        if (searchData.length === 0) { // Only fetch if not already fetched
            try {
                const response = await fetch('/index.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                searchData = await response.json();
                // Initialize Fuse.js once data is fetched
                fuse = new Fuse(searchData, {
                    minMatchCharLength: 3,
                    threshold: 0.2,
                    distance: 25,
                    ignoreLocation: true,
                    // includeMatches: true,
                    keys: [
                        { name: 'title', weight: 0.8 },
                        { name: 'tags', weight: 0.5 },
                        { name: 'categories', weight: 0.5 },
                        { name: 'content', weight: 0.2 }
                    ]
                });
            } catch (error) {
                console.error("Error fetching search index:", error);
                searchResults.innerHTML = '<p>Error loading search results. Please try again later.</p>';
            }
        }
    }

    // Event listener for opening the search
    if (searchButton) {
        // Pre-fetch on hover or focus for performance
        searchButton.addEventListener('mouseenter', fetchSearchIndex);
        searchButton.addEventListener('focus', fetchSearchIndex);

        searchButton.addEventListener('click', () => {
            searchOverlay.style.display = 'flex';
            searchInput.focus();
            fetchSearchIndex(); // Ensure it's called
        });
    }

    // Close search overlay when clicking outside the content (optional, but good UX)
    if (searchOverlay) {
        searchOverlay.addEventListener('click', (event) => {
            if (event.target === searchOverlay) {
                searchOverlay.style.display = 'none';
                searchInput.value = '';
                searchResults.innerHTML = '';
            }
        });
    }

    // Event listener for search input
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();
            if (query.length > 2) { // Only search for queries longer than 2 characters
                if (fuse) { // Ensure Fuse is initialized
                    const results = fuse.search(query);
                    displayResults(results, query);

                    // Track search query with debouncing
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => {
                        if (typeof gtag === 'function') {
                            gtag('event', 'search', {
                                'search_term': query
                            });
                        }
                    }, 1000); // Wait for 1 second of inactivity before logging
                } else {
                    searchResults.innerHTML = '<p>Loading search index...</p>';
                }
            }
            else {
                searchResults.innerHTML = ''; // Clear results for short queries
            }
        });
    }

    // Function to display search results
    function displayResults(results, query) {
        if (results.length > 0) {
            let resultsHtml = '<ul>';
            results.forEach(result => {
                const postDescription = result.item.description ? result.item.description : result.item.content.substring(0, 150) + '...';
                
                resultsHtml += `
                    <li>
                        <a href="${result.item.uri}">${result.item.title}</a>
                        <p>${postDescription}</p>
                    </li>
                `;
            });
            resultsHtml += '</ul>';
            searchResults.innerHTML = resultsHtml;
        } else {
            searchResults.innerHTML = '<p>No results found.</p>';
        }
    }
})();
