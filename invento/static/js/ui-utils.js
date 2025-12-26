// ============================================
// INVENTO - UI Utilities Module
// Common UI functions and helpers
// ============================================

// Toast notification system
class ToastManager {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    show(title, message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = this.getIcon(type);

        toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

        this.container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                this.container.removeChild(toast);
            }, 300);
        }, duration);
    }

    getIcon(type) {
        const icons = {
            success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>`,
            error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>`,
            warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>`,
            info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>`,
        };
        return icons[type] || icons.info;
    }
}

const toastManager = new ToastManager();

// Global toast function
window.showToast = (title, message, type = 'info', duration = 4000) => {
    toastManager.show(title, message, type, duration);
};

// Modal manager
class ModalManager {
    show(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    hide(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    confirm(title, message, onConfirm, onCancel) {
        // Create confirmation modal
        const modalId = 'confirm-modal';
        let modal = document.getElementById(modalId);

        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal-backdrop';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" onclick="modalManager.hide('${modalId}')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="cancel-btn">Cancel</button>
          <button class="btn btn-danger" id="confirm-btn">Confirm</button>
        </div>
      </div>
    `;

        this.show(modalId);

        // Add event listeners
        const confirmBtn = modal.querySelector('#confirm-btn');
        const cancelBtn = modal.querySelector('#cancel-btn');

        confirmBtn.onclick = () => {
            this.hide(modalId);
            if (onConfirm) onConfirm();
        };

        cancelBtn.onclick = () => {
            this.hide(modalId);
            if (onCancel) onCancel();
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                this.hide(modalId);
                if (onCancel) onCancel();
            }
        };
    }
}

const modalManager = new ModalManager();
window.modalManager = modalManager;

// Form validation helpers
window.validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

window.validateRequired = (value) => {
    return value && value.trim().length > 0;
};

window.validateNumber = (value) => {
    return !isNaN(value) && value !== '';
};

window.validatePositiveNumber = (value) => {
    return validateNumber(value) && parseFloat(value) > 0;
};

// Form field error display
window.showFieldError = (fieldId, message) => {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.add('is-invalid');
    field.classList.remove('is-valid');

    let errorEl = field.parentElement.querySelector('.form-error');
    if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'form-error';
        field.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = message;
};

window.showFieldSuccess = (fieldId) => {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.add('is-valid');
    field.classList.remove('is-invalid');

    const errorEl = field.parentElement.querySelector('.form-error');
    if (errorEl) {
        errorEl.remove();
    }
};

window.clearFieldError = (fieldId) => {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.remove('is-invalid', 'is-valid');

    const errorEl = field.parentElement.querySelector('.form-error');
    if (errorEl) {
        errorEl.remove();
    }
};

// Loading state helpers
window.showLoading = (elementId) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.disabled = true;
    element.dataset.originalText = element.innerHTML;
    element.innerHTML = `
    <span class="spinner"></span>
    <span>Loading...</span>
  `;
};

window.hideLoading = (elementId) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.disabled = false;
    if (element.dataset.originalText) {
        element.innerHTML = element.dataset.originalText;
        delete element.dataset.originalText;
    }
};

// Format currency
window.formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(value);
};

// Format date
window.formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
};

// Format relative time
window.formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateString);
};

// Debounce function for search inputs
window.debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Role-based UI visibility
window.applyRoleBasedUI = () => {
    const userRole = authManager.getUserRole();

    // Hide elements that require admin role
    document.querySelectorAll('[data-role="admin"]').forEach(element => {
        if (userRole !== 'admin') {
            element.style.display = 'none';
        }
    });

    // Disable buttons for viewers
    if (userRole === 'viewer') {
        document.querySelectorAll('.btn-edit, .btn-delete, .btn-export').forEach(button => {
            button.disabled = true;
            button.classList.add('cursor-not-allowed');

            // Add tooltip
            const wrapper = document.createElement('div');
            wrapper.className = 'tooltip-wrapper';
            button.parentNode.insertBefore(wrapper, button);
            wrapper.appendChild(button);

            const tooltip = document.createElement('span');
            tooltip.className = 'tooltip';
            tooltip.textContent = 'Admin access required';
            wrapper.appendChild(tooltip);
        });
    }
};
