(function() {
    const enableSearch = document.body.dataset.enableSearch === 'true';
    if (!enableSearch) {
        return;
    }

    const searchButton = document.getElementById('search-button');
    const searchOverlay = document.getElementById('search-overlay');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchCloseBtn = document.getElementById('search-close-btn');

    let fuse = null;
    let searchData = [];
    let isFetching = false;
    let pendingQuery = null;
    let selectedIndex = -1;

    async function fetchSearchIndex() {
        if (searchData.length > 0 || isFetching) {
            return;
        }
        isFetching = true;
        try {
            const response = await fetch('/index.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            searchData = await response.json();
            fuse = new Fuse(searchData, {
                minMatchCharLength: 2,
                threshold: 0.25,
                distance: 100,
                ignoreLocation: true,
                keys: [
                    { name: 'title', weight: 0.8 },
                    { name: 'tags', weight: 0.5 },
                    { name: 'categories', weight: 0.5 },
                    { name: 'content', weight: 0.2 }
                ]
            });
            isFetching = false;
            if (pendingQuery && searchInput && searchInput.value.trim() === pendingQuery) {
                runSearch(pendingQuery);
            }
        } catch (error) {
            isFetching = false;
            console.error("Error fetching search index:", error);
            if (searchResults) {
                searchResults.innerHTML = '<p class="search-message">Error loading search index. Please try again.</p>';
            }
        }
    }

    function openSearch() {
        if (!searchOverlay) return;
        searchOverlay.classList.add('active');
        document.body.classList.add('search-open');
        fetchSearchIndex();
        selectedIndex = -1;
        setTimeout(() => {
            if (searchInput) {
                searchInput.focus();
                if (searchInput.value.trim().length >= 2) {
                    runSearch(searchInput.value.trim());
                }
            }
        }, 30);
    }

    function closeSearch() {
        if (!searchOverlay) return;
        searchOverlay.classList.remove('active');
        document.body.classList.remove('search-open');
        if (searchInput) {
            searchInput.value = '';
        }
        if (searchResults) {
            searchResults.innerHTML = '';
        }
        pendingQuery = null;
        selectedIndex = -1;
    }

    function runSearch(query) {
        if (!fuse) {
            pendingQuery = query;
            if (searchResults) {
                searchResults.innerHTML = '<p class="search-message">Loading index...</p>';
            }
            return;
        }

        const results = fuse.search(query);
        selectedIndex = -1;
        displayResults(results, query);
    }

    function displayResults(results, query) {
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = `<p class="search-message">No essays found for <em>&ldquo;${escapeHtml(query)}&rdquo;</em></p>`;
            return;
        }

        let html = '<ul class="search-results-list" role="listbox">';
        results.forEach((result, idx) => {
            const item = result.item;
            const desc = item.description || (item.content ? item.content.substring(0, 140) + '...' : '');
            const category = (item.categories && item.categories.length > 0) ? item.categories[0] : '';
            const date = item.date || '';

            html += `
                <li class="search-result-item" role="option" data-index="${idx}" id="search-opt-${idx}">
                    <a href="${item.uri}" class="search-result-link">
                        <div class="result-header">
                            <span class="result-title">${escapeHtml(item.title)}</span>
                            <span class="result-meta">
                                ${category ? `<span class="result-category">${escapeHtml(category)}</span>` : ''}
                                ${category && date ? '<span class="result-sep">&middot;</span>' : ''}
                                ${date ? `<span class="result-date">${escapeHtml(date)}</span>` : ''}
                            </span>
                        </div>
                        ${desc ? `<p class="result-snippet">${escapeHtml(desc)}</p>` : ''}
                    </a>
                </li>
            `;
        });
        html += '</ul>';
        searchResults.innerHTML = html;
    }

    function updateActiveResult() {
        const items = searchResults.querySelectorAll('.search-result-item');
        if (items.length === 0) return;

        items.forEach((item, idx) => {
            if (idx === selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Event Listeners
    if (searchButton) {
        searchButton.addEventListener('mouseenter', fetchSearchIndex, { once: true });
        searchButton.addEventListener('focus', fetchSearchIndex, { once: true });
        searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            openSearch();
        });
    }

    if (searchCloseBtn) {
        searchCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeSearch();
        });
    }

    if (searchOverlay) {
        searchOverlay.addEventListener('click', (event) => {
            if (event.target === searchOverlay) {
                closeSearch();
            }
        });
    }

    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const query = searchInput.value.trim();
            if (query.length >= 2) {
                debounceTimer = setTimeout(() => {
                    runSearch(query);
                }, 100);
            } else {
                if (searchResults) searchResults.innerHTML = '';
                selectedIndex = -1;
            }
        });

        searchInput.addEventListener('keydown', (e) => {
            const items = searchResults.querySelectorAll('.search-result-item');
            if (items.length === 0) {
                if (e.key === 'Escape') {
                    closeSearch();
                }
                return;
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = (selectedIndex + 1) % items.length;
                updateActiveResult();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                updateActiveResult();
            } else if (e.key === 'Enter') {
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    e.preventDefault();
                    const link = items[selectedIndex].querySelector('a');
                    if (link) link.click();
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeSearch();
            }
        });
    }

    // Global keyboard shortcuts: Cmd+K / Ctrl+K, '/', and Escape
    document.addEventListener('keydown', (e) => {
        const isSearchOpen = searchOverlay && searchOverlay.classList.contains('active');

        if (e.key === 'Escape' && isSearchOpen) {
            e.preventDefault();
            closeSearch();
            return;
        }

        // Cmd+K or Ctrl+K
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (isSearchOpen) {
                closeSearch();
            } else {
                openSearch();
            }
            return;
        }

        // Forward slash '/' when not inside an editable field
        if (e.key === '/' && !isSearchOpen) {
            const targetTag = e.target.tagName.toLowerCase();
            const isEditable = targetTag === 'input' || targetTag === 'textarea' || e.target.isContentEditable;
            if (!isEditable) {
                e.preventDefault();
                openSearch();
            }
        }
    });

    if (window.requestIdleCallback) {
        requestIdleCallback(() => fetchSearchIndex(), { timeout: 3000 });
    }
})();
