// Theme Management System
(function() {
    // Initialize theme on page load
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        applyTheme(savedTheme);
    }

    // Apply theme to the entire app
    function applyTheme(theme) {
        if (theme === 'light') {
            document.documentElement.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
        }
        localStorage.setItem('theme', theme);

        // Keep any theme toggle checkbox in sync. Checked = dark mode (on).
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.checked = (theme === 'dark');
        }
    }

    // Toggle theme function — called from checkbox change handlers
    window.toggleTheme = function() {
        const toggle = document.getElementById('themeToggle');
        // If toggle exists, use its checked state: checked = dark
        if (toggle) {
            const newTheme = toggle.checked ? 'dark' : 'light';
            applyTheme(newTheme);
            return;
        }

        // Fallback: flip stored theme
        const currentTheme = localStorage.getItem('theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();
