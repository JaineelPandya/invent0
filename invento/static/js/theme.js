// ============================================
// INVENTO - Theme Manager Module
// Handles light/dark mode toggling
// ============================================

class ThemeManager {
    constructor() {
        this.currentTheme = this.getSavedTheme() || 'light';
        this.applyTheme(this.currentTheme);
    }

    // Get saved theme from localStorage
    getSavedTheme() {
        return localStorage.getItem('theme');
    }

    // Save theme to localStorage
    saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    // Apply theme to document
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        this.saveTheme(theme);
        this.updateThemeIcon(theme);
    }

    // Toggle between light and dark
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    // Update theme toggle button icon
    updateThemeIcon(theme) {
        const themeToggleBtn = document.getElementById('theme-toggle');
        if (!themeToggleBtn) return;

        const icon = themeToggleBtn.querySelector('.theme-icon');
        if (!icon) return;

        if (theme === 'dark') {
            // Show sun icon (to switch to light)
            icon.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
        } else {
            // Show moon icon (to switch to dark)
            icon.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
        }
    }

    // Get current theme
    getTheme() {
        return this.currentTheme;
    }

    // Check if dark mode
    isDark() {
        return this.currentTheme === 'dark';
    }
}

// Create singleton instance
const themeManager = new ThemeManager();

// Export for use in other modules
window.themeManager = themeManager;

// Initialize theme toggle button when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            themeManager.toggle();
        });
    }
});
