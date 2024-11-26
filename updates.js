class UpdatesManager {
    constructor() {
        this.updatesGrid = document.getElementById('updatesGrid');
    }

    async fetchUpdates() {
        try {
            const targetUrl = 'https://www.xiaohongshu.com/user/profile/6338737e000000001802ec16?xhsshare=WeixinSession&appuid=6338737e000000001802ec16&apptime=1732607221&share_id=f64c2e4aa66d476a916875cfbe10ae8d';
            const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(targetUrl);
            
            const headers = {
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'accept-language': 'en-GB,en;q=0.7',
                'cache-control': 'max-age=0',
                'cookie': 'acw_tc=0a00d20517326115990835104e35ebd7b5235e37079a688b72d92f79d6e50; abRequestId=9caac597-5b5-52f1-b929-f89891d4e2b5',
                'priority': 'u=0, i',
                'sec-ch-ua': '"Chromium";v="130", "Brave";v="130", "Not?A_Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'none',
                'sec-fetch-user': '?1',
                'sec-gpc': '1',
                'upgrade-insecure-requests': '1',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
            };

            console.log('Fetching from:', proxyUrl); // Debug log

            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();
            console.log('Response HTML:', html.substring(0, 200)); // Debug log
            
            // Extract the data from the HTML
            const dataMatch = html.match(/window\.__INITIAL_STATE__=(.*?);\s*<\/script>/);
            if (!dataMatch) {
                throw new Error('Could not find data in response');
            }

            const data = JSON.parse(dataMatch[1]);
            const notes = [];

            if (data.user && data.user.notes) {
                data.user.notes[0].forEach(note => {
                    if (note.noteCard) {
                        notes.push({
                            title: note.noteCard.displayTitle,
                            image: note.noteCard.cover.urlDefault,
                            likes: note.noteCard.interactInfo.likedCount,
                            author: note.noteCard.user.nickname,
                            link: `https://www.xiaohongshu.com/explore/${note.noteCard.noteId}`
                        });
                    }
                });
            }

            return notes;
        } catch (error) {
            console.error('Error fetching updates:', error);
            throw error;
        }
    }

    createUpdateCard(update) {
        const card = document.createElement('div');
        card.className = 'update-card';
        
        card.innerHTML = `
            <a href="${update.link}" target="_blank">
                <img src="${update.image}" alt="${update.title}" loading="lazy">
                <div class="update-info">
                    <h3>${update.title}</h3>
                    <div class="update-details">
                        <span>${update.author}</span>
                        <span>♥ ${update.likes}</span>
                    </div>
                </div>
            </a>
        `;
        return card;
    }

    async displayUpdates() {
        this.updatesGrid.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
            </div>
        `;
        
        try {
            const updates = await this.fetchUpdates();
            this.updatesGrid.innerHTML = '';
            
            if (updates.length === 0) {
                throw new Error('No updates available');
            }

            updates.forEach(update => {
                this.updatesGrid.appendChild(this.createUpdateCard(update));
            });
        } catch (error) {
            console.error('Error displaying updates:', error);
            this.updatesGrid.innerHTML = `
                <div class="error">
                    <p>Unable to load updates. Please try again later.</p>
                    <a href="https://www.xiaohongshu.com/user/profile/6338737e000000001802ec16" target="_blank">
                        View on Xiaohongshu
                    </a>
                </div>
            `;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const updatesManager = new UpdatesManager();
    updatesManager.displayUpdates();
});
