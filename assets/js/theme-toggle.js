document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('theme-toggle');
    const icon = toggleButton.querySelector('i');
    
    // Function to set theme
    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
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

    // 2. Check System Preference if no local storage
    if (!currentTheme) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            currentTheme = 'light';
        } else {
            currentTheme = 'dark';
        }
    }

    // Apply initial theme
    setTheme(currentTheme);

    // Event Listener
    toggleButton.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(currentTheme);
    });
});