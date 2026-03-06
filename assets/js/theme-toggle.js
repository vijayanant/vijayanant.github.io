document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('theme-toggle');
    const icon = toggleButton.querySelector('.icon');

    // Function to set theme
    const setTheme = (theme, isInitial = false) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

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
            // Light theme: show moon icon (to switch to dark)
            if (moonIcon) moonIcon.style.display = 'block';
            if (sunIcon) sunIcon.style.display = 'none';
        } else {
            // Dark theme: show sun icon (to switch to light)
            if (moonIcon) moonIcon.style.display = 'none';
            if (sunIcon) sunIcon.style.display = 'block';
        }
    };

    // 1. Check LocalStorage
    let currentTheme = localStorage.getItem('theme');

    // 2. Default to Dark Mode if no local storage preference
    if (!currentTheme) {
        currentTheme = 'dark';
    }

    // Apply initial theme
    setTheme(currentTheme, true);

    // Event Listener
    toggleButton.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(currentTheme);
    });
});