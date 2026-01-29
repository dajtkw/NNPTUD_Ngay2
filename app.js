// Main application for displaying product data
class ProductTableApp {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.pageSize = 10;
        this.searchTerm = '';
        this.selectedCategory = '';
        this.sortField = 'id';
        this.sortAscending = true;
        this.sortStates = {
            'title': { ascending: true, icon: 'bi-sort-alpha-down' },
            'price': { ascending: true, icon: 'bi-sort-numeric-down' },
            'id': { ascending: true, icon: 'bi-sort-numeric-down' }
        };
        
        // Initialize the application
        this.init();
    }
    
    /**
     * Initialize the application
     */
    async init() {
        // Load data from db.json
        await this.loadData();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Render the initial view
        this.render();
        
        // Update sort icons
        this.updateSortIcons();
    }
    
    /**
     * Load product data from db.json
     */
    async loadData() {
        try {
            // Use the DataConverter to fetch and parse JSON data
            this.products = await DataConverter.fetchJsonData('db.json');
            this.filteredProducts = [...this.products];
            
            // Update last updated timestamp
            this.updateLastUpdated();
            
            console.log(`Loaded ${this.products.length} products`);
        } catch (error) {
            console.error('Failed to load data:', error);
            // Fallback: try to load from a variable if fetch fails
            this.loadFallbackData();
        }
    }
    
    /**
     * Fallback data loading method
     */
    loadFallbackData() {
        // This would be used if fetch fails - in a real app, you might have
        // the data embedded or use a different approach
        console.log('Using fallback data loading method');
        // For now, we'll leave products as empty array
    }
    
    /**
     * Set up event listeners for UI controls
     */
    setupEventListeners() {
        // Search input event is handled via oninput attribute in HTML
        // Category filter event is handled via onchange attribute in HTML
        
        // Update page size info
        document.getElementById('page-size-info').textContent = this.pageSize;
    }
    
    /**
     * Handle search input change (called from HTML oninput)
     * @param {string} value - Search term
     */
    handleSearchChange(value) {
        this.searchTerm = value;
        this.applyFilters();
    }
    
    /**
     * Handle category filter change (called from HTML onchange)
     * @param {string} value - Selected category
     */
    handleCategoryChange(value) {
        this.selectedCategory = value;
        this.applyFilters();
    }
    
    /**
     * Toggle sort for a specific field
     * @param {string} field - Field to sort by
     */
    toggleSort(field) {
        if (this.sortField === field) {
            // Toggle direction if same field
            this.sortAscending = !this.sortAscending;
            this.sortStates[field].ascending = this.sortAscending;
        } else {
            // Switch to new field with default ascending order
            this.sortField = field;
            this.sortAscending = true;
            this.sortStates[field].ascending = true;
        }
        
        // Update sort icons
        this.updateSortIcons();
        
        // Apply filters with new sort
        this.applyFilters();
    }
    
    /**
     * Update sort icons in UI
     */
    updateSortIcons() {
        // Update title sort icon
        const titleIcon = document.getElementById('title-sort-icon');
        if (this.sortField === 'title') {
            titleIcon.className = this.sortAscending ? 'bi bi-sort-alpha-down' : 'bi bi-sort-alpha-up';
        } else {
            titleIcon.className = 'bi bi-sort-alpha-down';
        }
        
        // Update price sort icon
        const priceIcon = document.getElementById('price-sort-icon');
        if (this.sortField === 'price') {
            priceIcon.className = this.sortAscending ? 'bi bi-sort-numeric-down' : 'bi bi-sort-numeric-up';
        } else {
            priceIcon.className = 'bi bi-sort-numeric-down';
        }
    }
    
    /**
     * Apply filters and sorting to products
     */
    applyFilters() {
        // Filter products
        this.filteredProducts = DataConverter.filterProducts(
            this.products, 
            this.searchTerm, 
            this.selectedCategory
        );
        
        // Sort products
        this.filteredProducts = DataConverter.sortProducts(
            this.filteredProducts, 
            this.sortField, 
            this.sortAscending
        );
        
        // Reset to first page
        this.currentPage = 1;
        
        // Update UI
        this.render();
    }
    
    /**
     * Refresh data from source
     */
    async refreshData() {
        await this.loadData();
        this.applyFilters();
    }
    
    /**
     * Go to previous page
     */
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTable();
            this.updatePagination();
        }
    }
    
    /**
     * Go to next page
     */
    nextPage() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderTable();
            this.updatePagination();
        }
    }
    
    /**
     * Render the entire application
     */
    render() {
        this.updateStatistics();
        this.updateCategoryFilter();
        this.renderTable();
        this.updatePagination();
        this.updateRecordCount();
    }
    
    /**
     * Update statistics display
     */
    updateStatistics() {
        const stats = DataConverter.calculateStatistics(this.filteredProducts);
        
        document.getElementById('total-products').textContent = stats.totalProducts;
        document.getElementById('total-categories').textContent = stats.totalCategories;
        document.getElementById('avg-price').textContent = stats.averagePrice.toFixed(2);
    }
    
    /**
     * Update category filter dropdown
     */
    updateCategoryFilter() {
        const categoryFilter = document.getElementById('category-filter');
        const categories = DataConverter.getUniqueCategories(this.products);
        
        // Clear existing options except the first one
        while (categoryFilter.options.length > 1) {
            categoryFilter.remove(1);
        }
        
        // Add category options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = `${category.name}`;
            if (category.name === this.selectedCategory) {
                option.selected = true;
            }
            categoryFilter.appendChild(option);
        });
    }
    
    /**
     * Render the product table with Bootstrap styling
     */
    renderTable() {
        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = '';
        
        if (this.filteredProducts.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="8" class="text-center py-5">
                    <div class="text-muted">
                        <i class="bi bi-search display-4"></i>
                        <h5 class="mt-3">Không tìm thấy sản phẩm</h5>
                        <p class="mb-0">Thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn</p>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
            return;
        }
        
        // Calculate pagination slice
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = Math.min(startIndex + this.pageSize, this.filteredProducts.length);
        const pageProducts = this.filteredProducts.slice(startIndex, endIndex);
        
        // Create table rows
        pageProducts.forEach(product => {
            const row = document.createElement('tr');
            
            // Format dates
            const createdDate = this.formatDate(product.creationAt);
            const updatedDate = this.formatDate(product.updatedAt);
            
            // Format images (show first image or count)
            let imagesHtml = 'Không có ảnh';
            if (product.images.length > 0) {
                const firstImage = product.images[0];
                imagesHtml = `
                    <div class="d-flex align-items-center">
                        <img src="${firstImage}" alt="${product.title}" 
                             class="product-image me-2" 
                             onerror="this.src='https://via.placeholder.com/50x50?text=No+Image'">
                        <span class="badge bg-secondary">${product.images.length}</span>
                    </div>
                `;
            }
            
            // Format description (truncate if too long)
            const description = product.description.length > 80 
                ? product.description.substring(0, 80) + '...' 
                : product.description;
            
            // Format price with color based on value
            const price = product.price || 0;
            const priceClass = price > 100 ? 'text-danger fw-bold' : price > 50 ? 'text-warning' : 'text-success';
            
            row.innerHTML = `
                <td class="fw-bold">#${product.id}</td>
                <td>
                    <div class="fw-semibold">${this.escapeHtml(product.title)}</div>
                    <small class="text-muted">${this.escapeHtml(product.slug)}</small>
                </td>
                <td class="${priceClass}">$${price.toFixed(2)}</td>
                <td>
                    <span class="badge badge-category rounded-pill px-3 py-1">
                        ${this.escapeHtml(product.category.name)}
                    </span>
                    <div class="small text-muted mt-1">ID: ${product.category.id}</div>
                </td>
                <td class="small">${this.escapeHtml(description)}</td>
                <td>${imagesHtml}</td>
                <td class="small">${createdDate}</td>
                <td class="small">${updatedDate}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    /**
     * Update pagination controls
     */
    updatePagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
        const pageInfo = document.getElementById('page-info');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        pageInfo.textContent = `Trang ${this.currentPage} / ${totalPages}`;
        prevBtn.disabled = this.currentPage <= 1;
        nextBtn.disabled = this.currentPage >= totalPages;
        
        // Update button classes based on state
        if (prevBtn.disabled) {
            prevBtn.classList.add('disabled');
        } else {
            prevBtn.classList.remove('disabled');
        }
        
        if (nextBtn.disabled) {
            nextBtn.classList.add('disabled');
        } else {
            nextBtn.classList.remove('disabled');
        }
    }
    
    /**
     * Update record count display
     */
    updateRecordCount() {
        document.getElementById('total-records').textContent = this.filteredProducts.length;
    }
    
    /**
     * Update last updated timestamp
     */
    updateLastUpdated() {
        const now = new Date();
        const formattedDate = now.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('last-updated').textContent = formattedDate;
    }
    
    /**
     * Format date string for display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }
    
    /**
     * Escape HTML special characters to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productApp = new ProductTableApp();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductTableApp;
}