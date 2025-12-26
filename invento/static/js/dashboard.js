// ============================================
// INVENTO - Dashboard Module
// Handles dashboard data fetching and visualization
// ============================================

let stockTrendChart = null;
let categoryChart = null;

// Load dashboard data
async function loadDashboardData() {
    try {
        const data = await apiClient.get('/dashboard/');

        // Update KPIs
        updateKPIs(data);

        // Initialize charts
        initializeCharts(data);

        // Load recent activity
        loadRecentActivity();

        // Load notification count
        loadNotificationCount();

    } catch (error) {
        console.error('Dashboard data error:', error);
        showToast('Error', 'Failed to load dashboard data', 'error');
    }
}

// Update KPI cards
function updateKPIs(data) {
    // Total Items
    const totalEl = document.getElementById('kpi-total-items');
    totalEl.innerHTML = data.total_items || 0;

    const totalChange = document.getElementById('kpi-total-change');
    totalChange.textContent = `${data.total_items || 0} items in stock`;

    // Low Stock
    const lowStockEl = document.getElementById('kpi-low-stock');
    lowStockEl.innerHTML = data.low_stock_items || 0;

    const lowChange = document.getElementById('kpi-low-change');
    lowChange.textContent = `Requires attention`;

    // Expired Items
    const expiredEl = document.getElementById('kpi-expired');
    expiredEl.innerHTML = data.expired_items || 0;

    const expiredChange = document.getElementById('kpi-expired-change');
    expiredChange.textContent = data.expired_items > 0 ? 'Action needed' : 'All good';

    // Total Stock Value
    const valueEl = document.getElementById('kpi-stock-value');
    valueEl.innerHTML = formatCurrency(data.total_stock_value || 0);

    const valueChange = document.getElementById('kpi-value-change');
    valueChange.textContent = 'Current inventory value';
}

// Initialize charts
function initializeCharts(data) {
    // Stock Trend Chart
    const trendCtx = document.getElementById('stock-trend-chart');
    if (trendCtx) {
        if (stockTrendChart) {
            stockTrendChart.destroy();
        }

        const trendData = data.stock_trend || [];
        const labels = trendData.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const values = trendData.map(item => item.total_items || 0);

        stockTrendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: labels.length > 0 ? labels : ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
                datasets: [{
                    label: 'Total Items',
                    data: values.length > 0 ? values : [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                resizeDelay: 100,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    // Category Chart
    const categoryCtx = document.getElementById('category-chart');
    if (categoryCtx) {
        if (categoryChart) {
            categoryChart.destroy();
        }

        const categoryData = data.category_distribution || [];
        const categoryLabels = categoryData.map(item => item.category_name || 'Unknown');
        const categoryCounts = categoryData.map(item => item.count || 0);

        // Generate colors
        const colors = [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
            '#ec4899',
        ];

        categoryChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: categoryLabels.length > 0 ? categoryLabels : ['No Data'],
                datasets: [{
                    data: categoryCounts.length > 0 ? categoryCounts : [1],
                    backgroundColor: colors,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                resizeDelay: 100,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }
}

// Load recent activity
async function loadRecentActivity() {
    try {
        const tbody = document.querySelector('#recent-activity tbody');

        // Mock data for now - replace with actual API call when available
        const activities = [
            { item: 'Laptop Dell XPS 15', action: 'Added', quantity: 5, date: new Date().toISOString() },
            { item: 'Wireless Mouse', action: 'Updated', quantity: 20, date: new Date(Date.now() - 3600000).toISOString() },
            { item: 'USB Cable Type-C', action: 'Removed', quantity: 10, date: new Date(Date.now() - 7200000).toISOString() },
        ];

        if (activities.length === 0) {
            tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: var(--space-4); color: var(--text-tertiary);">
            No recent activity
          </td>
        </tr>
      `;
            return;
        }

        tbody.innerHTML = activities.map(activity => `
      <tr>
        <td>${activity.item}</td>
        <td>
          <span class="badge ${activity.action === 'Added' ? 'badge-success' : activity.action === 'Removed' ? 'badge-danger' : 'badge-primary'}">
            ${activity.action}
          </span>
        </td>
        <td>${activity.quantity}</td>
        <td>${formatRelativeTime(activity.date)}</td>
      </tr>
    `).join('');

    } catch (error) {
        console.error('Recent activity error:', error);
    }
}

// Load notification count
async function loadNotificationCount() {
    try {
        // Mock count - replace with actual API call
        const count = 3;
        const badge = document.getElementById('notification-count');
        if (badge) {
            badge.textContent = count;
            if (count === 0) {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Notification count error:', error);
    }
}

// Auto-refresh dashboard data every 30 seconds
setInterval(() => {
    if (document.visibilityState === 'visible') {
        loadDashboardData();
    }
}, 30000);
