// JSON to Object conversion function
class DataConverter {
    /**
     * Convert JSON string to JavaScript object
     * @param {string} jsonString - JSON string to convert
     * @returns {Array} Array of product objects
     */
    static jsonToObject(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            // Validate the data structure
            if (!Array.isArray(data)) {
                console.error('Expected an array of products');
                return [];
            }
            
            // Process each product to ensure proper structure
            return data.map(product => ({
                id: Number(product.id) || 0,
                title: String(product.title || ''),
                slug: String(product.slug || ''),
                price: Number(product.price) || 0,
                description: String(product.description || ''),
                category: {
                    id: Number(product.category?.id) || 0,
                    name: String(product.category?.name || ''),
                    slug: String(product.category?.slug || ''),
                    image: String(product.category?.image || ''),
                    creationAt: String(product.category?.creationAt || ''),
                    updatedAt: String(product.category?.updatedAt || '')
                },
                images: Array.isArray(product.images) ? product.images.map(img => String(img)) : [],
                creationAt: String(product.creationAt || ''),
                updatedAt: String(product.updatedAt || '')
            }));
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return [];
        }
    }
    
    /**
     * Convert object to JSON string
     * @param {Array} dataArray - Array of product objects
     * @returns {string} JSON string
     */
    static objectToJson(dataArray) {
        try {
            return JSON.stringify(dataArray, null, 2);
        } catch (error) {
            console.error('Error converting to JSON:', error);
            return '[]';
        }
    }
    
    /**
     * Fetch JSON data from a file
     * @param {string} filePath - Path to JSON file
     * @returns {Promise<Array>} Promise resolving to array of products
     */
    static async fetchJsonData(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonString = await response.text();
            return this.jsonToObject(jsonString);
        } catch (error) {
            console.error('Error fetching JSON data:', error);
            return [];
        }
    }
    
    /**
     * Get unique categories from product data
     * @param {Array} products - Array of product objects
     * @returns {Array} Array of unique category objects
     */
    static getUniqueCategories(products) {
        const categoryMap = new Map();
        
        products.forEach(product => {
            if (product.category && product.category.id) {
                const key = `${product.category.id}-${product.category.name}`;
                if (!categoryMap.has(key)) {
                    categoryMap.set(key, { ...product.category });
                }
            }
        });
        
        return Array.from(categoryMap.values());
    }
    
    /**
     * Calculate statistics from product data
     * @param {Array} products - Array of product objects
     * @returns {Object} Statistics object
     */
    static calculateStatistics(products) {
        if (!products.length) {
            return {
                totalProducts: 0,
                totalCategories: 0,
                averagePrice: 0,
                minPrice: 0,
                maxPrice: 0,
                totalValue: 0
            };
        }
        
        const categories = this.getUniqueCategories(products);
        const totalPrice = products.reduce((sum, product) => sum + (product.price || 0), 0);
        const prices = products.map(p => p.price || 0).filter(p => p > 0);
        
        return {
            totalProducts: products.length,
            totalCategories: categories.length,
            averagePrice: prices.length ? Math.round(totalPrice / prices.length * 100) / 100 : 0,
            minPrice: prices.length ? Math.min(...prices) : 0,
            maxPrice: prices.length ? Math.max(...prices) : 0,
            totalValue: totalPrice
        };
    }
    
    /**
     * Filter products based on search criteria
     * @param {Array} products - Array of product objects
     * @param {string} searchTerm - Search term
     * @param {string} category - Category filter
     * @returns {Array} Filtered products
     */
    static filterProducts(products, searchTerm = '', category = '') {
        return products.filter(product => {
            // Search term filter
            const searchMatch = !searchTerm || 
                product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.slug.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Category filter
            const categoryMatch = !category || 
                product.category.name.toLowerCase() === category.toLowerCase() ||
                product.category.id.toString() === category;
            
            return searchMatch && categoryMatch;
        });
    }
    
    /**
     * Sort products by specified field
     * @param {Array} products - Array of product objects
     * @param {string} sortBy - Field to sort by
     * @param {boolean} ascending - Sort order
     * @returns {Array} Sorted products
     */
    static sortProducts(products, sortBy = 'id', ascending = true) {
        return [...products].sort((a, b) => {
            let valueA, valueB;
            
            switch(sortBy) {
                case 'title':
                    valueA = a.title.toLowerCase();
                    valueB = b.title.toLowerCase();
                    break;
                case 'price':
                    valueA = a.price;
                    valueB = b.price;
                    break;
                case 'category':
                    valueA = a.category.name.toLowerCase();
                    valueB = b.category.name.toLowerCase();
                    break;
                case 'id':
                default:
                    valueA = a.id;
                    valueB = b.id;
                    break;
            }
            
            if (valueA < valueB) return ascending ? -1 : 1;
            if (valueA > valueB) return ascending ? 1 : -1;
            return 0;
        });
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataConverter;
}