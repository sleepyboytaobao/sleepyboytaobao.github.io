class ProductManager {
    constructor() {
        this.productsGrid = document.getElementById('productsGrid');
        this.currentCategory = 'all';
    }

    async fetchProducts() {
        try {
            const apiUrl = 'https://joyabuy.com/search-info/get-tb-shop-full';
            const params = new URLSearchParams({
                ShopId: '336502708',
                Page: '1',
                Language: 'en'
            });

            const response = await fetch(`${apiUrl}?${params}`, {
                headers: {
                    'accept': '*/*',
                    'accept-language': 'en-GB,en;q=0.9',
                    'referer': 'https://joyabuy.com/shops/',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.data.shopProducts.productList;
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <a href="https://item.taobao.com/item.htm?id=${product.id}" target="_blank">
                <img src="${product.imgUrl}" alt="${product.name}" loading="lazy">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-details">
                        <span class="price">¥${product.price}</span>
                        ${product.sold ? `<span class="sold">${product.sold} sold</span>` : ''}
                    </div>
                </div>
            </a>
        `;
        return card;
    }

    filterProducts(products, category) {
        if (category === 'all') return products;
        
        // Simple keyword matching for categories
        const categoryKeywords = {
            'new': ['new', '2024'],
            'tops': ['shirt', 'tee', 'hoodie', 'sweater', 'jacket'],
            'bottoms': ['pants', 'shorts', 'jeans', 'trousers'],
            'accessories': ['hat', 'cap', 'bag', 'socks', 'shoes'],
            'sale': ['sale', 'discount']
        };

        return products.filter(product => {
            const keywords = categoryKeywords[category.toLowerCase()];
            return keywords?.some(keyword => 
                product.name.toLowerCase().includes(keyword)
            );
        });
    }

    async displayProducts(category = 'all') {
        this.productsGrid.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
            </div>
        `;
        
        try {
            const products = await this.fetchProducts();
            const filteredProducts = this.filterProducts(products, category);
            
            this.productsGrid.innerHTML = '';
            
            if (filteredProducts.length === 0) {
                this.productsGrid.innerHTML = `
                    <div class="error">
                        <p>No products found in this category.</p>
                    </div>
                `;
                return;
            }

            filteredProducts.forEach(product => {
                this.productsGrid.appendChild(this.createProductCard(product));
            });
        } catch (error) {
            this.productsGrid.innerHTML = `
                <div class="error">
                    <p>Unable to load products. Please try again later.</p>
                    <a href="https://shop336502708.taobao.com" target="_blank" class="error-link">
                        Visit Taobao Store
                    </a>
                </div>
            `;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Declare productManager at the top level of the DOMContentLoaded scope
    let productManager;

    // Add intro animation handling
    const introOverlay = document.querySelector('.intro-overlay');
    const enterButton = document.querySelector('.enter-button');
    const mainContent = document.querySelector('.content');
    
    enterButton.addEventListener('click', () => {
        introOverlay.classList.add('fade-out');
        setTimeout(() => {
            introOverlay.style.display = 'none';
            mainContent.classList.add('visible');
            
            // Initialize the site
            productManager = new ProductManager();
            productManager.displayProducts();
        }, 800);
    });

    // Menu toggle functionality
    const menuToggle = document.querySelector('.menu-toggle');
    const sideNav = document.querySelector('.side-nav');
    const content = document.querySelector('.content');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        sideNav.classList.toggle('active');
        
        if (sideNav.classList.contains('active')) {
            setTimeout(() => {
                content.style.marginLeft = '250px';
            }, 50);
        } else {
            content.style.marginLeft = '0';
        }
    });

    // Category navigation
    const navItems = document.querySelectorAll('.nav-items a');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Make sure productManager exists
            if (!productManager) return;
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');

            // Get category from text
            const category = item.textContent.toLowerCase();
            productManager.displayProducts(category);

            // Close menu on mobile
            if (window.innerWidth <= 768) {
                menuToggle.classList.remove('active');
                sideNav.classList.remove('active');
                content.style.marginLeft = '0';
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!sideNav.contains(e.target) && !menuToggle.contains(e.target) && sideNav.classList.contains('active')) {
            menuToggle.classList.remove('active');
            sideNav.classList.remove('active');
            content.style.marginLeft = '0';
        }
    });

    // Update WeChat click handler
    const wechatContact = document.querySelector('.contact-info p');
    wechatContact.addEventListener('click', async () => {
        const wechatId = 'sleepboy02';
        
        // Try to open WeChat with the specific user
        window.location.href = `weixin://dl/profile/${wechatId}`;
        
        // Copy WeChat ID to clipboard
        try {
            await navigator.clipboard.writeText(wechatId);
            
            // Show a more detailed message
            const message = `
                Opening WeChat...
                WeChat ID "${wechatId}" has been copied to your clipboard.
                
                If WeChat doesn't open automatically:
                1. Open WeChat manually
                2. Click "+" to add contacts
                3. Paste the copied ID
            `;
            
            setTimeout(() => {
                alert(message);
            }, 500);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert(`Please add this WeChat ID manually: ${wechatId}`);
        }
    });
}); 