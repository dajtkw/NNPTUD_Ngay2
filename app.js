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
        
        // Update sort dropdown
        this.updateSortDropdown();
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
        
        // Sort dropdown event
        const sortDropdown = document.getElementById('sort-dropdown');
        if (sortDropdown) {
            sortDropdown.addEventListener('change', (e) => {
                this.handleSortChange(e.target.value);
            });
        }
        
        // Update page size info
        document.getElementById('page-size-info').textContent = this.pageSize;
    }
    
    /**
     * Handle search input change (called from HTML oninput)
     * @param {string} value - Search term
     */
    onChanged(value) {
        this.searchTerm = value;
        this.applyFilters();
    }
    
    /**
     * Handle search input change (called from HTML oninput) - alias for onChanged
     * @param {string} value - Search term
     */
    handleSearchChange(value) {
        this.onChanged(value);
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
     * Handle sort dropdown change
     * @param {string} value - Sort option value
     */
    handleSortChange(value) {
        switch(value) {
            case 'title_asc':
                this.sortField = 'title';
                this.sortAscending = true;
                break;
            case 'title_desc':
                this.sortField = 'title';
                this.sortAscending = false;
                break;
            case 'price_asc':
                this.sortField = 'price';
                this.sortAscending = true;
                break;
            case 'price_desc':
                this.sortField = 'price';
                this.sortAscending = false;
                break;
            case 'id_asc':
            default:
                this.sortField = 'id';
                this.sortAscending = true;
                break;
        }
        
        this.applyFilters();
    }
    
    /**
     * Update sort dropdown selection
     */
    updateSortDropdown() {
        const sortDropdown = document.getElementById('sort-dropdown');
        if (!sortDropdown) return;
        
        let value = 'id_asc'; // default
        if (this.sortField === 'title') {
            value = this.sortAscending ? 'title_asc' : 'title_desc';
        } else if (this.sortField === 'price') {
            value = this.sortAscending ? 'price_asc' : 'price_desc';
        } else if (this.sortField === 'id') {
            value = 'id_asc';
        }
        
        sortDropdown.value = value;
    }
    
    /**
     * Reset all filters to default
     */
    resetToDefault() {
        this.searchTerm = '';
        this.selectedCategory = '';
        this.sortField = 'id';
        this.sortAscending = true;
        this.currentPage = 1;
        
        // Reset UI elements
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) categoryFilter.value = '';
        
        // Update sort dropdown
        this.updateSortDropdown();
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
     * Refresh data from source and reset to default
     */
    async refreshData() {
        // Reset all filters to default
        this.resetToDefault();
        
        // Reload data
        await this.loadData();
        
        // Apply filters (which will use default settings)
        this.applyFilters();
        
        // Show notification
        this.showNotification('Dữ liệu đã được làm mới!', 'success');
    }
    
    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     */
    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.getElementById('app-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.id = 'app-notification';
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                const bsAlert = new bootstrap.Alert(notification);
                bsAlert.close();
            }
        }, 3000);
    }
    
    /**
     * Soft delete a product (set isDeleted to true)
     * @param {number} productId - ID of product to delete
     */
    softDeleteProduct(productId) {
        const productIndex = this.products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            this.products[productIndex].isDeleted = true;
            this.products[productIndex].updatedAt = new Date().toISOString();
            
            // Update filtered products
            const filteredIndex = this.filteredProducts.findIndex(p => p.id === productId);
            if (filteredIndex !== -1) {
                this.filteredProducts[filteredIndex].isDeleted = true;
                this.filteredProducts[filteredIndex].updatedAt = this.products[productIndex].updatedAt;
            }
            
            this.render();
            this.showNotification(`Đã xoá mềm sản phẩm #${productId}`, 'success');
            
            // In a real app, you would save to server/database here
            console.log(`Soft deleted product ${productId}`);
        }
    }
    
    /**
     * Restore a soft-deleted product (set isDeleted to false)
     * @param {number} productId - ID of product to restore
     */
    restoreProduct(productId) {
        const productIndex = this.products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            this.products[productIndex].isDeleted = false;
            this.products[productIndex].updatedAt = new Date().toISOString();
            
            // Update filtered products
            const filteredIndex = this.filteredProducts.findIndex(p => p.id === productId);
            if (filteredIndex !== -1) {
                this.filteredProducts[filteredIndex].isDeleted = false;
                this.filteredProducts[filteredIndex].updatedAt = this.products[productIndex].updatedAt;
            }
            
            this.render();
            this.showNotification(`Đã khôi phục sản phẩm #${productId}`, 'success');
            
            console.log(`Restored product ${productId}`);
        }
    }
    
    /**
     * Get the next available ID for a new product
     * @returns {string} Next ID as string
     */
    getNextProductId() {
        if (this.products.length === 0) {
            return "1";
        }
        
        // Find max ID (convert to number for comparison)
        const maxId = Math.max(...this.products.map(p => {
            const idNum = parseInt(p.id);
            return isNaN(idNum) ? 0 : idNum;
        }));
        
        // Return next ID as string
        return (maxId + 1).toString();
    }
    
    /**
     * Add a new product
     * @param {Object} productData - Product data (without id)
     */
    addNewProduct(productData) {
        const newId = this.getNextProductId();
        const now = new Date().toISOString();
        
        const newProduct = {
            id: parseInt(newId), // Store as number for compatibility
            title: productData.title || '',
            slug: productData.slug || productData.title.toLowerCase().replace(/\s+/g, '-'),
            price: parseFloat(productData.price) || 0,
            description: productData.description || '',
            category: productData.category || { id: 1, name: 'Clothes' },
            images: productData.images || [],
            creationAt: now,
            updatedAt: now,
            isDeleted: false,
            comments: []
        };
        
        this.products.push(newProduct);
        this.applyFilters();
        this.showNotification(`Đã thêm sản phẩm mới: ${newProduct.title}`, 'success');
        
        // In a real app, you would save to server/database here
        console.log('Added new product:', newProduct);
        
        return newProduct;
    }
    
    /**
     * Handle add product form submission
     * @param {Event} event - Form submit event
     */
    handleAddProduct(event) {
        event.preventDefault();
        
        // Get form values
        const title = document.getElementById('product-title').value;
        const price = document.getElementById('product-price').value;
        const categoryId = document.getElementById('product-category').value;
        const description = document.getElementById('product-description').value;
        const imagesText = document.getElementById('product-images').value;
        
        // Parse images (split by newline and trim)
        const images = imagesText.split('\n')
            .map(url => url.trim())
            .filter(url => url.length > 0);
        
        // Map category ID to category object
        const categoryMap = {
            '1': { id: 1, name: 'Clothes', slug: 'clothes', image: 'https://i.imgur.com/QkIa5tT.jpeg' },
            '2': { id: 2, name: 'Electronics', slug: 'electronics', image: 'https://i.imgur.com/ZANVnHE.jpeg' },
            '4': { id: 4, name: 'Shoes', slug: 'shoes', image: 'https://i.imgur.com/qNOjJje.jpeg' },
            '5': { id: 5, name: 'Miscellaneous', slug: 'miscellaneous', image: 'https://i.imgur.com/BG8J0Fj.jpg' }
        };
        
        const category = categoryMap[categoryId] || categoryMap['1'];
        
        // Create product data
        const productData = {
            title,
            price,
            description,
            category,
            images
        };
        
        // Add the product
        this.addNewProduct(productData);
        
        // Reset form
        event.target.reset();
        
        return false;
    }
    
    /**
     * Get next comment ID for a product
     * @param {number} productId - Product ID
     * @returns {string} Next comment ID
     */
    getNextCommentId(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product || !product.comments || product.comments.length === 0) {
            return "c1";
        }
        
        // Extract numeric part from comment IDs (e.g., "c1" -> 1)
        const commentIds = product.comments.map(comment => {
            const match = comment.id.match(/c(\d+)/);
            return match ? parseInt(match[1]) : 0;
        });
        
        const maxId = Math.max(...commentIds);
        return `c${maxId + 1}`;
    }
    
    /**
     * Add a comment to a product
     * @param {number} productId - Product ID
     * @param {string} content - Comment content
     * @param {string} author - Comment author (optional)
     */
    addComment(productId, content, author = 'Người dùng') {
        const productIndex = this.products.findIndex(p => p.id === productId);
        if (productIndex === -1) return;
        
        const commentId = this.getNextCommentId(productId);
        const now = new Date().toISOString();
        
        const newComment = {
            id: commentId,
            content: content,
            author: author,
            createdAt: now
        };
        
        // Initialize comments array if it doesn't exist
        if (!this.products[productIndex].comments) {
            this.products[productIndex].comments = [];
        }
        
        this.products[productIndex].comments.push(newComment);
        this.products[productIndex].updatedAt = now;
        
        // Update filtered products if needed
        const filteredIndex = this.filteredProducts.findIndex(p => p.id === productId);
        if (filteredIndex !== -1) {
            if (!this.filteredProducts[filteredIndex].comments) {
                this.filteredProducts[filteredIndex].comments = [];
            }
            this.filteredProducts[filteredIndex].comments.push(newComment);
            this.filteredProducts[filteredIndex].updatedAt = now;
        }
        
        this.render();
        this.showNotification(`Đã thêm bình luận cho sản phẩm #${productId}`, 'success');
        
        console.log(`Added comment to product ${productId}:`, newComment);
    }
    
    /**
     * Update a comment
     * @param {number} productId - Product ID
     * @param {string} commentId - Comment ID
     * @param {string} newContent - New comment content
     */
    updateComment(productId, commentId, newContent) {
        const productIndex = this.products.findIndex(p => p.id === productId);
        if (productIndex === -1) return;
        
        const commentIndex = this.products[productIndex].comments?.findIndex(c => c.id === commentId);
        if (commentIndex === -1 || commentIndex === undefined) return;
        
        this.products[productIndex].comments[commentIndex].content = newContent;
        this.products[productIndex].updatedAt = new Date().toISOString();
        
        // Update filtered products if needed
        const filteredIndex = this.filteredProducts.findIndex(p => p.id === productId);
        if (filteredIndex !== -1) {
            const filteredCommentIndex = this.filteredProducts[filteredIndex].comments?.findIndex(c => c.id === commentId);
            if (filteredCommentIndex !== -1 && filteredCommentIndex !== undefined) {
                this.filteredProducts[filteredIndex].comments[filteredCommentIndex].content = newContent;
                this.filteredProducts[filteredIndex].updatedAt = this.products[productIndex].updatedAt;
            }
        }
        
        this.render();
        this.showNotification(`Đã cập nhật bình luận`, 'success');
    }
    
    /**
     * Delete a comment
     * @param {number} productId - Product ID
     * @param {string} commentId - Comment ID
     */
    deleteComment(productId, commentId) {
        const productIndex = this.products.findIndex(p => p.id === productId);
        if (productIndex === -1) return;
        
        if (!this.products[productIndex].comments) return;
        
        const commentIndex = this.products[productIndex].comments.findIndex(c => c.id === commentId);
        if (commentIndex === -1) return;
        
        this.products[productIndex].comments.splice(commentIndex, 1);
        this.products[productIndex].updatedAt = new Date().toISOString();
        
        // Update filtered products if needed
        const filteredIndex = this.filteredProducts.findIndex(p => p.id === productId);
        if (filteredIndex !== -1 && this.filteredProducts[filteredIndex].comments) {
            const filteredCommentIndex = this.filteredProducts[filteredIndex].comments.findIndex(c => c.id === commentId);
            if (filteredCommentIndex !== -1) {
                this.filteredProducts[filteredIndex].comments.splice(filteredCommentIndex, 1);
                this.filteredProducts[filteredIndex].updatedAt = this.products[productIndex].updatedAt;
            }
        }
        
        this.render();
        this.showNotification(`Đã xoá bình luận`, 'success');
    }
    
    /**
     * Show comments modal for a product
     * @param {number} productId - Product ID
     */
    showComments(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        // Create modal HTML
        const modalId = `comments-modal-${productId}`;
        let modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-label" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="${modalId}-label">
                                <i class="bi bi-chat-text"></i> Bình luận cho: ${this.escapeHtml(product.title)}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="comment-section">
        `;
        
        // Show comments if any
        if (product.comments && product.comments.length > 0) {
            product.comments.forEach(comment => {
                const commentDate = this.formatDate(comment.createdAt);
                modalHtml += `
                    <div class="comment-item mb-3" id="comment-${comment.id}">
                        <div class="comment-header">
                            <span class="comment-author">${this.escapeHtml(comment.author)}</span>
                            <span class="comment-date">${commentDate}</span>
                        </div>
                        <div class="comment-content">${this.escapeHtml(comment.content)}</div>
                        <div class="comment-actions">
                            <button class="btn btn-sm btn-outline-warning" onclick="productApp.editComment(${productId}, '${comment.id}')">
                                <i class="bi bi-pencil"></i> Sửa
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="productApp.deleteComment(${productId}, '${comment.id}')">
                                <i class="bi bi-trash"></i> Xoá
                            </button>
                        </div>
                    </div>
                `;
            });
        } else {
            modalHtml += `
                <div class="text-center py-4">
                    <i class="bi bi-chat-dots display-4 text-muted"></i>
                    <p class="mt-3">Chưa có bình luận nào</p>
                </div>
            `;
        }
        
        // Add comment form
        modalHtml += `
                            </div>
                            <div class="comment-form mt-4">
                                <h6><i class="bi bi-plus-circle"></i> Thêm bình luận mới</h6>
                                <div class="mb-3">
                                    <label for="comment-author-${productId}" class="form-label">Tên của bạn</label>
                                    <input type="text" class="form-control" id="comment-author-${productId}" value="Người dùng">
                                </div>
                                <div class="mb-3">
                                    <label for="comment-content-${productId}" class="form-label">Nội dung bình luận</label>
                                    <textarea class="form-control" id="comment-content-${productId}" rows="3" placeholder="Viết bình luận của bạn..."></textarea>
                                </div>
                                <button class="btn btn-primary" onclick="productApp.submitComment(${productId})">
                                    <i class="bi bi-send"></i> Gửi bình luận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer.firstElementChild);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
    }
    
    /**
     * Submit a new comment
     * @param {number} productId - Product ID
     */
    submitComment(productId) {
        const authorInput = document.getElementById(`comment-author-${productId}`);
        const contentInput = document.getElementById(`comment-content-${productId}`);
        
        if (!authorInput || !contentInput) return;
        
        const author = authorInput.value.trim();
        const content = contentInput.value.trim();
        
        if (!content) {
            this.showNotification('Vui lòng nhập nội dung bình luận', 'error');
            return;
        }
        
        this.addComment(productId, content, author);
        
        // Clear form
        contentInput.value = '';
        
        // Close modal after a short delay
        setTimeout(() => {
            const modalId = `comments-modal-${productId}`;
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                }
            }
        }, 1000);
    }
    
    /**
     * Edit a comment (show edit form)
     * @param {number} productId - Product ID
     * @param {string} commentId - Comment ID
     */
    editComment(productId, commentId) {
        const product = this.products.find(p => p.id === productId);
        if (!product || !product.comments) return;
        
        const comment = product.comments.find(c => c.id === commentId);
        if (!comment) return;
        
        // Replace comment content with edit form
        const commentElement = document.getElementById(`comment-${commentId}`);
        if (!commentElement) return;
        
        commentElement.innerHTML = `
            <div class="comment-edit-form">
                <div class="mb-2">
                    <label class="form-label">Sửa bình luận</label>
                    <textarea class="form-control" id="edit-comment-${commentId}" rows="2">${this.escapeHtml(comment.content)}</textarea>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-success" onclick="productApp.saveCommentEdit(${productId}, '${commentId}')">
                        <i class="bi bi-check"></i> Lưu
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="productApp.cancelCommentEdit(${productId}, '${commentId}')">
                        <i class="bi bi-x"></i> Hủy
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Save edited comment
     * @param {number} productId - Product ID
     * @param {string} commentId - Comment ID
     */
    saveCommentEdit(productId, commentId) {
        const editTextarea = document.getElementById(`edit-comment-${commentId}`);
        if (!editTextarea) return;
        
        const newContent = editTextarea.value.trim();
        if (!newContent) {
            this.showNotification('Nội dung bình luận không được để trống', 'error');
            return;
        }
        
        this.updateComment(productId, commentId, newContent);
    }
    
    /**
     * Cancel comment edit
     * @param {number} productId - Product ID
     * @param {string} commentId - Comment ID
     */
    cancelCommentEdit(productId, commentId) {
        // Just refresh the view
        this.render();
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
        this.updateSortDropdown();
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
                <td colspan="9" class="text-center py-5">
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
            
            // Add soft-deleted class if product is deleted
            if (product.isDeleted) {
                row.classList.add('soft-deleted');
            }
            
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
            
            // Comments count
            const commentsCount = product.comments ? product.comments.length : 0;
            const commentsBadge = commentsCount > 0 ?
                `<span class="badge bg-info">${commentsCount} bình luận</span>` :
                '<span class="text-muted small">Không có bình luận</span>';
            
            // Action buttons
            let actionButtons = '';
            if (product.isDeleted) {
                actionButtons = `
                    <button class="btn btn-sm btn-success" onclick="productApp.restoreProduct(${product.id})">
                        <i class="bi bi-arrow-counterclockwise"></i> Khôi phục
                    </button>
                `;
            } else {
                actionButtons = `
                    <button class="btn btn-sm btn-danger" onclick="productApp.softDeleteProduct(${product.id})">
                        <i class="bi bi-trash"></i> Xoá
                    </button>
                    <button class="btn btn-sm btn-outline-primary mt-1" onclick="productApp.showComments(${product.id})">
                        <i class="bi bi-chat"></i> Bình luận
                    </button>
                `;
            }
            
            row.innerHTML = `
                <td class="fw-bold">#${product.id}</td>
                <td class="fw-semibold">${this.escapeHtml(product.title)}</td>
                <td class="${priceClass}">$${price.toFixed(2)}</td>
                <td>
                    <span class="badge badge-category rounded-pill px-3 py-1">
                        ${this.escapeHtml(product.category.name)}
                    </span>
                </td>
                <td class="small">${this.escapeHtml(description)}</td>
                <td>${imagesHtml}</td>
                <td class="small">${createdDate}</td>
                <td class="small">${updatedDate}</td>
                <td>
                    <div class="product-actions">
                        ${actionButtons}
                    </div>
                    <div class="mt-2">
                        ${commentsBadge}
                    </div>
                </td>
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