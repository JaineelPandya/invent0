// ============================================
// INVENTO - Inventory Module
// Handles inventory list display and management
// ============================================

let currentPage = 1;
let pageSize = 25;
let totalItems = 0;
let inventoryData = [];
let filteredData = [];
let sortColumn = '';
let sortDirection = 'asc';

// Load inventory data
async function loadInventory() {
    try {
        const response = await apiClient.get('/inventory/');
        inventoryData = response.results || response || [];
        totalItems = response.count || inventoryData.length;

        // Apply filters
        applyFilters();

        // Load categories for filter
        loadCategories();

    } catch (error) {
        console.error('Inventory load error:', error);
        showToast('Error', 'Failed to load inventory data', 'error');
    }
}

// Load categories
async function loadCategories() {
    try {
        const categories = new Set();
        inventoryData.forEach(item => {
            if (item.category_name) {
                categories.add(item.category_name);
            }
        });

        const categoryFilter = document.getElementById('category-filter');
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Category load error:', error);
    }
}

// Apply filters
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const statusFilter = document.getElementById('status-filter').value;

    filteredData = inventoryData.filter(item => {
        // Search filter
        const matchesSearch = !searchTerm ||
            item.name.toLowerCase().includes(searchTerm) ||
            item.sku.toLowerCase().includes(searchTerm);

        // Category filter
        const matchesCategory = !categoryFilter || item.category_name === categoryFilter;

        // Status filter
        let matchesStatus = true;
        if (statusFilter === 'low_stock') {
            matchesStatus = item.quantity <= (item.reorder_level || 10);
        } else if (statusFilter === 'expired') {
            matchesStatus = item.expiry_date && new Date(item.expiry_date) < new Date();
        } else if (statusFilter === 'in_stock') {
            matchesStatus = item.quantity > (item.reorder_level || 10);
        }

        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Apply sorting
    if (sortColumn) {
        filteredData.sort((a, b) => {
            let aVal = a[sortColumn];
            let bVal = b[sortColumn];

            if (sortColumn === 'quantity' || sortColumn === 'unit_price') {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Reset to first page
    currentPage = 1;
    renderTable();
}

// Render table
function renderTable() {
    const tbody = document.getElementById('inventory-tbody');
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = filteredData.slice(start, end);

    if (pageData.length === 0) {
        tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">
          <div class="empty-state-title">No inventory items found</div>
          <div class="empty-state-text">Try adjusting your filters or add a new item.</div>
        </td>
      </tr>
    `;
        updatePaginationInfo();
        return;
    }

    tbody.innerHTML = pageData.map(item => {
        const isLowStock = item.quantity <= (item.reorder_level || 10);
        const isExpired = item.expiry_date && new Date(item.expiry_date) < new Date();
        const rowClass = isExpired ? 'row-expired' : (isLowStock ? 'row-low-stock' : '');
        const totalValue = (item.quantity || 0) * (item.unit_price || 0);

        return `
      <tr class="${rowClass}">
        <td><code>${item.sku}</code></td>
        <td><strong>${item.name}</strong></td>
        <td><span class="badge badge-secondary">${item.category_name || 'N/A'}</span></td>
        <td>${item.quantity}</td>
        <td>${formatCurrency(item.unit_price || 0)}</td>
        <td>${formatCurrency(totalValue)}</td>
        <td class="${isExpired ? 'text-danger font-semibold' : ''}"}>
          ${item.expiry_date ? formatDate(item.expiry_date) : 'N/A'}
        </td>
        <td>
          <div class="d-flex gap-1">
            <a href="/inventory/edit/${item.id}/" class="btn btn-sm btn-secondary btn-icon btn-edit" title="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </a>
            <button class="btn btn-sm btn-danger btn-icon btn-delete" onclick="confirmDelete(${item.id}, '${item.name}')" title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
    }).join('');

    updatePaginationInfo();
    applyRoleBasedUI();
}

// Update pagination info
function updatePaginationInfo() {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, filteredData.length);
    const total = filteredData.length;

    document.getElementById('pagination-info').textContent =
        `Showing ${start} to ${end} of ${total} results`;

    document.getElementById('prev-btn').disabled = currentPage === 1;
    document.getElementById('next-btn').disabled = end >= total;
}

// Delete item
async function deleteItem(id) {
    try {
        await apiClient.delete(`/inventory/${id}/`);
        showToast('Success', 'Item deleted successfully', 'success');
        loadInventory();
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Error', 'Failed to delete item', 'error');
    }
}

// Confirm delete
window.confirmDelete = (id, name) => {
    modalManager.confirm(
        'Delete Item',
        `Are you sure you want to delete "${name}"? This action cannot be undone.`,
        () => deleteItem(id)
    );
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!authManager.requireAuth()) return;

    // Load inventory
    loadInventory();

    // Search input
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', debounce(applyFilters, 300));

    // Filters
    document.getElementById('category-filter').addEventListener('change', applyFilters);
    document.getElementById('status-filter').addEventListener('change', applyFilters);

    // Page size
    document.getElementById('page-size').addEventListener('change', (e) => {
        pageSize = parseInt(e.target.value);
        currentPage = 1;
        renderTable();
    });

    // Pagination
    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        if (currentPage * pageSize < filteredData.length) {
            currentPage++;
            renderTable();
        }
    });

    // Table sorting
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.column;

            if (sortColumn === column) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortColumn = column;
                sortDirection = 'asc';
            }

            // Update UI
            document.querySelectorAll('.sortable').forEach(t => {
                t.classList.remove('sorted-asc', 'sorted-desc');
            });
            th.classList.add(`sorted-${sortDirection}`);

            applyFilters();
        });
    });
});
