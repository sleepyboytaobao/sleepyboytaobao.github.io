class AnnouncementsManager {
    constructor() {
        this.announcementsContainer = document.getElementById('announcementsContainer');
        this.TELEGRAPH_PATH = 'Annoucments-11-27';
    }

    async fetchAnnouncements() {
        try {
            const response = await fetch(`https://api.telegra.ph/getPage/${this.TELEGRAPH_PATH}?return_content=true`);
            const data = await response.json();
            
            if (!data.ok) throw new Error('Failed to fetch page');
            
            const content = data.result.content;
            const announcements = [];
            let currentAnnouncement = null;

            content.forEach(node => {
                if (node.tag === 'p' && Array.isArray(node.children) && node.children.length > 0) {
                    const firstChild = node.children[0];
                    const text = typeof firstChild === 'string' ? firstChild : '';

                    if (text.includes('#')) {
                        if (currentAnnouncement) {
                            announcements.push(currentAnnouncement);
                        }
                        const title = text.replace(/^#+\s/, '');
                        currentAnnouncement = {
                            id: Date.now(),
                            title: title,
                            date: new Date().toISOString().split('T')[0],
                            content: '',
                            important: title.includes('❗'),
                            mediaType: 'none',
                            mediaUrl: ''
                        };
                    } else if (currentAnnouncement) {
                        node.children.forEach(child => {
                            if (typeof child === 'string' && !child.includes('[video]')) {
                                currentAnnouncement.content += child + ' ';
                            }
                        });
                    }
                }
                else if (node.tag === 'figure' && currentAnnouncement) {
                    const img = node.children?.find(child => child.tag === 'img');
                    if (img && img.attrs && img.attrs.src) {
                        currentAnnouncement.mediaType = 'image';
                        currentAnnouncement.mediaUrl = img.attrs.src.startsWith('http') ? 
                            img.attrs.src : 
                            'https://telegra.ph' + img.attrs.src;
                    }
                }
                else if (node.tag === 'iframe' && currentAnnouncement) {
                    if (node.attrs && node.attrs.src) {
                        currentAnnouncement.mediaType = 'video';
                        currentAnnouncement.mediaUrl = node.attrs.src;
                    }
                }
            });

            if (currentAnnouncement) {
                announcements.push(currentAnnouncement);
            }

            return announcements;
        } catch (error) {
            console.error('Error fetching announcements:', error);
            return [];
        }
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    createMediaElement(announcement) {
        if (!announcement.mediaType || announcement.mediaType === 'none') return '';
        
        if (announcement.mediaType === 'image') {
            return `
                <div class="announcement-media">
                    <img src="${announcement.mediaUrl}" alt="Announcement image">
                </div>
            `;
        } else if (announcement.mediaType === 'video') {
            return `
                <div class="announcement-media">
                    <iframe src="${announcement.mediaUrl}" allowfullscreen></iframe>
                </div>
            `;
        }
        
        return '';
    }

    displayAnnouncements(announcements) {
        if (!this.announcementsContainer) return;

        const announcementsHTML = `
            <style>
                .announcements-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .announcement-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    transition: transform 0.2s ease;
                }

                .announcement-card:hover {
                    transform: translateY(-2px);
                }

                .announcement-card.important {
                    border-left: 4px solid #ff2442;
                }

                .announcement-date {
                    color: #666;
                    font-size: 0.9em;
                    margin-bottom: 8px;
                }

                .announcement-title {
                    font-size: 1.2em;
                    font-weight: 600;
                    margin-bottom: 12px;
                    color: #333;
                }

                .announcement-content {
                    color: #444;
                    line-height: 1.5;
                    margin-bottom: 15px;
                }

                .announcement-media {
                    margin-top: 15px;
                }

                .announcement-media img {
                    max-width: 100%;
                    border-radius: 8px;
                }

                .announcement-media iframe {
                    width: 100%;
                    aspect-ratio: 16/9;
                    border: none;
                    border-radius: 8px;
                }

                .important-badge {
                    display: inline-block;
                    background: #ff2442;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 0.8em;
                    margin-left: 8px;
                }
            </style>
            ${announcements
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(announcement => `
                    <div class="announcement-card ${announcement.important ? 'important' : ''}">
                        <div class="announcement-date">
                            ${this.formatDate(announcement.date)}
                            ${announcement.important ? 
                                '<span class="important-badge">Important</span>' : 
                                ''}
                        </div>
                        <div class="announcement-title">${announcement.title}</div>
                        <div class="announcement-content">${announcement.content}</div>
                        ${this.createMediaElement(announcement)}
                    </div>
                `).join('')}
        `;

        this.announcementsContainer.innerHTML = announcementsHTML;
    }

    async init() {
        const announcements = await this.fetchAnnouncements();
        this.displayAnnouncements(announcements);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const announcementsManager = new AnnouncementsManager();
    announcementsManager.init();
}); 