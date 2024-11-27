class ProductManager {
    constructor() {
        this.productsGrid = document.getElementById('productsGrid');
    }

    async fetchProducts() {
        try {
            const response = await fetch('https://retoolapi.dev/xgS1V9/data');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            return data || [];
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        const imageUrl = product['cardContainer--CwazTl0O src'].replace(/^https?:\/\//, '');
        const formattedImageUrl = `https://${imageUrl}`;
        
        card.innerHTML = `
            <a href="${product['linkWrapperArea--qYAJSUqA href']}" target="_blank">
                <img src="${formattedImageUrl}" alt="${product['title--GExDBPUi']}" loading="lazy">
                <div class="product-info">
                    <h3>${product['title--GExDBPUi']}</h3>
                    <div class="product-details">
                        <span class="price">¥${product['priceUnEncode--_dE4HANk']}</span>
                    </div>
                </div>
            </a>
        `;
        return card;
    }

    filterProducts(products, category) {
        const normalizedCategory = category.toLowerCase();
        if (normalizedCategory === 'all products' || normalizedCategory === 'all') return products;
        
        const categoryKeywords = {
            'erd': ['erd', '忧郁的富二代'],
            'undercover': ['undercover', 'undercove'],
            'accessories': ['项链', '帽', 'hat', '包', 'bag', 'belt', 'necklace'],
            'archive': ['archive', '档案', 'rare', '稀有', 'extinct', '绝迹']
        };

        return products.filter(product => {
            const keywords = categoryKeywords[normalizedCategory];
            return keywords?.some(keyword => 
                product['title--GExDBPUi'].toLowerCase().includes(keyword.toLowerCase())
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

            // Get category from text content
            const category = item.textContent.trim();
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