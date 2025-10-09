// History Dashboard Manager
class HistoryDashboard {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.allHistory = [];
    this.filteredHistory = [];
    this.init();
  }

  async init() {
    await this.loadHistory();
    this.setupEventListeners();
    this.updateStats();
    this.renderTable();
  }

  async loadHistory() {
    try {
      const result = await chrome.storage.local.get(['analysisHistory']);
      this.allHistory = result.analysisHistory || [];
      this.filteredHistory = [...this.allHistory];
    } catch (error) {
      console.error('Error loading history:', error);
      this.allHistory = [];
      this.filteredHistory = [];
    }
  }

  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput?.addEventListener('input', () => this.applyFilters());

    // Type filter
    const typeFilter = document.getElementById('typeFilter');
    typeFilter?.addEventListener('change', () => this.applyFilters());

    // Date filters
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    dateFrom?.addEventListener('change', () => this.applyFilters());
    dateTo?.addEventListener('change', () => this.applyFilters());

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    exportBtn?.addEventListener('click', () => this.exportToCSV());

    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    if (dateTo) dateTo.value = today.toISOString().split('T')[0];
    if (dateFrom) dateFrom.value = thirtyDaysAgo.toISOString().split('T')[0];
  }

  applyFilters() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('typeFilter')?.value || '';
    const dateFrom = document.getElementById('dateFrom')?.value;
    const dateTo = document.getElementById('dateTo')?.value;

    this.filteredHistory = this.allHistory.filter(item => {
      // Search filter
      const matchesSearch = !searchTerm || 
        item.source.toLowerCase().includes(searchTerm) ||
        item.result.toLowerCase().includes(searchTerm);

      // Type filter
      const matchesType = !typeFilter || item.type === typeFilter;

      // Date filter
      const itemDate = new Date(item.timestamp);
      const matchesDateFrom = !dateFrom || itemDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || itemDate <= new Date(dateTo + 'T23:59:59');

      return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
    });

    this.currentPage = 1;
    this.updateStats();
    this.renderTable();
  }

  updateStats() {
    const imageAnalyses = this.filteredHistory.filter(item => item.type === 'image').length;
    const factChecks = this.filteredHistory.filter(item => item.type === 'text').length;
    const totalCost = this.filteredHistory.reduce((sum, item) => sum + (item.cost || 0), 0);

    document.getElementById('totalAnalyses').textContent = this.filteredHistory.length;
    document.getElementById('imageAnalyses').textContent = imageAnalyses;
    document.getElementById('factChecks').textContent = factChecks;
    document.getElementById('totalCost').textContent = `$${totalCost.toFixed(2)}`;
  }

  renderTable() {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;

    if (this.filteredHistory.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state">
            No analysis history found. Start using the extension to see your data here.
          </td>
        </tr>
      `;
      this.renderPagination();
      return;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageItems = this.filteredHistory.slice(startIndex, endIndex);

    const html = pageItems.map(item => `
      <tr>
        <td>${this.formatDate(item.timestamp)}</td>
        <td>
          <span class="type-badge type-${item.type}">
            ${item.type === 'image' ? '🖼️ Image' : '📝 Text'}
          </span>
        </td>
        <td class="result-preview" title="${item.source}">${item.source}</td>
        <td class="result-preview" title="${item.result}">${item.result}</td>
        <td class="cost">$${(item.cost || 0).toFixed(3)}</td>
        <td>
          <button class="btn" onclick="historyDashboard.viewDetails('${item.id}')">
            View
          </button>
        </td>
      </tr>
    `).join('');

    tbody.innerHTML = html;
    this.renderPagination();
  }

  renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(this.filteredHistory.length / this.itemsPerPage);
    
    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let html = '';
    
    // Previous button
    if (this.currentPage > 1) {
      html += `<button onclick="historyDashboard.goToPage(${this.currentPage - 1})">Previous</button>`;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === this.currentPage) {
        html += `<button class="active">${i}</button>`;
      } else {
        html += `<button onclick="historyDashboard.goToPage(${i})">${i}</button>`;
      }
    }

    // Next button
    if (this.currentPage < totalPages) {
      html += `<button onclick="historyDashboard.goToPage(${this.currentPage + 1})">Next</button>`;
    }

    pagination.innerHTML = html;
  }

  goToPage(page) {
    this.currentPage = page;
    this.renderTable();
  }

  formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  viewDetails(id) {
    const item = this.allHistory.find(h => h.id === id);
    if (!item) return;

    alert(`Analysis Details:\n\nType: ${item.type}\nSource: ${item.source}\nResult: ${item.result}\nCost: $${(item.cost || 0).toFixed(3)}\nDate: ${this.formatDate(item.timestamp)}`);
  }

  exportToCSV() {
    if (this.filteredHistory.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Date', 'Type', 'Source', 'Result', 'Cost'];
    const csvContent = [
      headers.join(','),
      ...this.filteredHistory.map(item => [
        `"${this.formatDate(item.timestamp)}"`,
        `"${item.type}"`,
        `"${item.source.replace(/"/g, '""')}"`,
        `"${item.result.replace(/"/g, '""')}"`,
        `"$${(item.cost || 0).toFixed(3)}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access-sentinel-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Initialize dashboard
let historyDashboard;
document.addEventListener('DOMContentLoaded', () => {
  historyDashboard = new HistoryDashboard();
});