// ============================================
// INVENTO - Layout Loader Module
// Dynamically loads sidebar and navbar for consistency
// ============================================

// Load sidebar
function loadSidebar(activePage = 'dashboard') {
    const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
    if (!sidebarPlaceholder) return;

    const user = authManager.getCurrentUser();
    const initials = user ? (user.first_name || user.email).substring(0, 1).toUpperCase() : 'U';
    const userName = user ? (user.first_name || user.email) : 'User';
    const userRole = user ? (user.role || 'viewer') : 'viewer';

    sidebarPlaceholder.innerHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <a href="/dashboard/" class="sidebar-logo">
          <svg class="sidebar-logo-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="24" height="24" rx="4" fill="#1e3a8a"/>
            <path d="M10 14h4v8h-4v-8z" fill="#10b981"/>
            <path d="M16 10h4v12h-4V10z" fill="#10b981"/>
            <path d="M22 16h4v6h-4v-6z" fill="#10b981" opacity="0.7"/>
          </svg>
          <span class="sidebar-logo-text">Invento</span>
        </a>
      </div>

      <nav class="sidebar-nav">
        <a href="/dashboard/" class="nav-item ${activePage === 'dashboard' ? 'active' : ''}">
          <svg class="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="nav-item-text">Dashboard</span>
        </a>

        <a href="/inventory/" class="nav-item ${activePage === 'inventory' ? 'active' : ''}">
          <svg class="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <span class="nav-item-text">Inventory</span>
        </a>

        <a href="/reports/" class="nav-item ${activePage === 'reports' ? 'active' : ''}">
          <svg class="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <span class="nav-item-text">Reports</span>
        </a>

        <a href="/alerts/" class="nav-item ${activePage === 'alerts' ? 'active' : ''}">
          <svg class="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span class="nav-item-text">Alerts</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-user-avatar">${initials}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${userName}</div>
            <div class="sidebar-user-role">${userRole}</div>
          </div>
        </div>
      </div>
    </aside>
  `;

    // Add sidebar toggle functionality
    const sidebar = document.getElementById('sidebar');
    document.addEventListener('click', (e) => {
        const sidebarToggle = e.target.closest('.sidebar-toggle');
        if (sidebarToggle) {
            sidebar.classList.toggle('collapsed');
            if (window.innerWidth <= 768) {
                sidebar.classList.toggle('open');
            }
        }

        // Close sidebar on mobile when clicking outside
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !e.target.closest('.sidebar-toggle')) {
                sidebar.classList.remove('open');
            }
        }
    });
}

// Load navbar
function loadNavbar(pageTitle = 'Dashboard') {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (!navbarPlaceholder) return;

    navbarPlaceholder.innerHTML = `
    <header class="navbar">
      <div class="navbar-left">
        <button class="sidebar-toggle" aria-label="Toggle sidebar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 class="page-title">${pageTitle}</h1>
      </div>

      <div class="navbar-right">
        <button class="navbar-icon-btn" id="theme-toggle" aria-label="Toggle theme">
          <span class="theme-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </span>
        </button>

        <button class="navbar-icon-btn" onclick="window.location.href='/alerts/'" aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span class="badge-count" id="notification-count" style="display: none;">0</span>
        </button>

        <button class="navbar-icon-btn" onclick="authManager.logout()" aria-label="Logout">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </header>
  `;
}

// Auto-load on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Determine active page from URL
    const path = window.location.pathname;
    let activePage = 'dashboard';
    let pageTitle = 'Dashboard';

    if (path.includes('/inventory')) {
        activePage = 'inventory';
        pageTitle = 'Inventory Management';
    } else if (path.includes('/reports')) {
        activePage = 'reports';
        pageTitle = 'Reports';
    } else if (path.includes('/alerts')) {
        activePage = 'alerts';
        pageTitle = 'Alerts & Notifications';
    }

    loadSidebar(activePage);
    loadNavbar(pageTitle);
    applyRoleBasedUI();
});
