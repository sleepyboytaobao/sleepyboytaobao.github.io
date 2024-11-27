class UpdatesManager {
    constructor() {
        this.updatesContainer = document.getElementById('updatesContainer');
    }

    async fetchUpdates() {
        const targetUrl = 'https://www.xiaohongshu.com/user/profile/6338737e000000001802ec16?xhsshare=WeixinSession&appuid=6338737e000000001802ec16&apptime=1732607221';
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
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Find all note items in the feed container
        const noteItems = doc.querySelectorAll('.note-item');
        const updates = [];

        noteItems.forEach(note => {
            const titleEl = note.querySelector('.title span');
            const imageEl = note.querySelector('.cover img');
            const likesEl = note.querySelector('.count');
            const dateEl = note.querySelector('.date');
            const linkEl = note.querySelector('a.cover');

            if (titleEl && imageEl) {
                updates.push({
                    title: titleEl.textContent.trim(),
                    image: imageEl.src,
                    link: linkEl ? linkEl.href : null,
                    likes: likesEl ? likesEl.textContent.trim() : null,
                    date: dateEl ? dateEl.textContent.trim() : null
                });
            }
        });

        return updates;
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

        this.updatesContainer.innerHTML = updates.map(update => `
            <div class="update-card">
                <a href="${update.link || '#'}" target="_blank">
                    <img src="${update.image}" alt="${update.title}">
                    <div class="update-info">
                        <h3>${update.title}</h3>
                        <div class="update-details">
                            ${update.likes ? `<span class="likes">♥ ${update.likes}</span>` : ''}
                            ${update.date ? `<span class="date">${update.date}</span>` : ''}
                        </div>
                    </div>
                </a>
            </div>
        `).join('');
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
