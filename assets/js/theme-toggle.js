document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('theme-toggle');
    if (!toggleButton) return;

    // Function to set theme
    const setTheme = (theme, isInitial = false) => {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {}

        // Track theme in GA4
        if (typeof gtag === 'function') {
            gtag('event', 'select_content', {
                'content_type': 'theme',
                'item_id': theme,
                'non_interaction': isInitial
            });
        }

        // Update Icon - swap moon/sun SVG
        const moonIcon = toggleButton.querySelector('.icon-moon');
        const sunIcon = toggleButton.querySelector('.icon-sun');
        
        if (theme === 'light') {
            if (moonIcon) moonIcon.style.display = 'block';
            if (sunIcon) sunIcon.style.display = 'none';
        } else {
            if (moonIcon) moonIcon.style.display = 'none';
            if (sunIcon) sunIcon.style.display = 'block';
        }
    };

    // 1. Check LocalStorage safely
    let currentTheme = null;
    try {
        currentTheme = localStorage.getItem('theme');
    } catch (e) {}

    // 2. Default to Dark Mode if no local storage preference
    if (!currentTheme) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        currentTheme = prefersDark ? 'dark' : 'dark'; // Dark is default
    }

    // Apply initial theme
    setTheme(currentTheme, true);

    // Event Listener
    toggleButton.addEventListener('click', (e) => {
        e.preventDefault();
        const activeTheme = document.documentElement.getAttribute('data-theme') || currentTheme;
        const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
    });
});