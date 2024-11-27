class UpdatesManager {
    constructor() {
        this.updatesContainer = document.getElementById('updatesContainer');
    }

    async fetchUpdates() {
        const targetUrl = 'https://www.xiaohongshu.com/user/profile/6338737e000000001802ec16';
        const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(targetUrl);

        try {
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            return this.parseUpdates(html);
        } catch (error) {
            console.error('Error fetching updates:', error);
            this.displayError();
            return [];
        }
    }

    parseUpdates(html) {
        // Get all the titles from the HTML content
        const titles = html.match(/displayTitle":\s*"([^"]+)"/g)
            .map(match => match.match(/"([^"]+)"$/)[1]);
        
        if (!titles) return [];

        // Remove duplicates
        const uniqueTitles = [...new Set(titles)];

        // Create updates array with just titles and a link to his profile
        return uniqueTitles.map(title => ({
            title: title.trim(),
            link: 'https://www.xiaohongshu.com/user/profile/6338737e000000001802ec16'
        }));
    }

    displayError() {
        if (!this.updatesContainer) return;
        this.updatesContainer.innerHTML = `
            <div class="error-message">
                <p>Unable to load updates at this time.</p>
                <a href="https://www.xiaohongshu.com/user/profile/6338737e000000001802ec16" target="_blank">
                    View on Xiaohongshu
                </a>
            </div>
        `;
    }

    displayUpdates(updates) {
        if (!this.updatesContainer) return;
        if (updates.length === 0) {
            this.displayError();
            return;
        }

        this.updatesContainer.innerHTML = `
            <style>
                #updatesContainer {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    min-height: 100vh;
                    padding: 0;
                    margin: 0;
                }

                .updates-container {
                    width: 100%;
                    max-width: 600px;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 40px 20px;
                }

                .updates-header {
                    font-size: 24px;
                    font-weight: 600;
                    margin-bottom: 30px;
                    text-align: center;
                    color: #333;
                }

                .updates-list {
                    width: 100%;
                    margin: 0 auto;
                }
                
                .update-item {
                    background: #fff;
                    border: 1px solid #eee;
                    border-radius: 8px;
                    margin-bottom: 12px;
                    transition: all 0.2s ease;
                    text-align: center;
                }
                
                .update-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                
                .update-item a {
                    display: block;
                    padding: 20px;
                    color: #333;
                    text-decoration: none;
                    font-size: 16px;
                    line-height: 1.4;
                }
                
                .update-item a:hover {
                    color: #ff2442;
                }
            </style>
            <div class="updates-container">
                <div class="updates-header">SLEEPBOY UPDATES</div>
                <div class="updates-list">
                    ${updates.map(update => `
                        <div class="update-item">
                            <a href="${update.link}" target="_blank" rel="noopener noreferrer">
                                ${update.title}
                            </a>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async init() {
        this.updatesContainer.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading updates...</p>
            </div>
        `;
        
        const updates = await this.fetchUpdates();
        this.displayUpdates(updates);
    }
}

// Initialize updates when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const updatesManager = new UpdatesManager();
    updatesManager.init();
});
