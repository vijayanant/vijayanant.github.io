document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('theme-toggle');
    const icon = toggleButton.querySelector('i');
    
    // Function to set theme
    const setTheme = (theme, isInitial = false) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Track theme in GA4
        if (typeof gtag === 'function') {
            gtag('event', 'select_content', {
                'content_type': 'theme',
                'item_id': theme,
                'non_interaction': isInitial // Don't affect bounce rate on initial load
            });
        }

        // Update Icon (Action Indicator)
        // If theme is Light, show Moon (to switch to Dark)
        // If theme is Dark, show Sun (to switch to Light)
        if (theme === 'light') {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
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