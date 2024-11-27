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
                            images: []
                        };
                    } else if (currentAnnouncement) {
                        node.children.forEach(child => {
                            if (typeof child === 'string') {
                                currentAnnouncement.content += child;
                            } else if (child.tag === 'br') {
                                currentAnnouncement.content += '\n';
                            } else if (child.tag === 'a' && child.attrs && child.attrs.href) {
                                if (child.attrs.href.match(/\.(jpg|jpeg|png|gif)$/i) || child.attrs.href.includes('imgur.com')) {
                                    currentAnnouncement.images.push(child.attrs.href);
                                } else {
                                    currentAnnouncement.content += child.attrs.href;
                                }
                            }
                        });
                        currentAnnouncement.content += '\n';
                    }
                } else if (node.tag === 'br' && currentAnnouncement) {
                    currentAnnouncement.content += '\n';
                }
                // Handle figure/image tags
                else if (node.tag === 'figure' && currentAnnouncement) {
                    const img = node.children?.find(child => child.tag === 'img');
                    if (img && img.attrs && img.attrs.src) {
                        const imageUrl = img.attrs.src.startsWith('http') ? 
                            img.attrs.src : 
                            'https://telegra.ph' + img.attrs.src;
                        currentAnnouncement.images.push(imageUrl);
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
                    width: 100%;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .announcement-card {
                    background: white;
                    border-radius: 12px;
                    padding: 25px;
                    margin-bottom: 20px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                @media (max-width: 768px) {
                    .announcement-card {
                        padding: 20px;
                        border-radius: 8px;
                    }
                }

                .announcement-card.important {
                    border-left: 4px solid #ff2442;
                }

                .announcement-date {
                    color: #666;
                    font-size: 0.9em;
                    margin-bottom: 12px;
                }

                .announcement-title {
                    font-size: 1.3em;
                    font-weight: 600;
                    margin-bottom: 20px;
                    color: #333;
                    line-height: 1.3;
                }

                @media (max-width: 768px) {
                    .announcement-title {
                        font-size: 1.2em;
                        margin-bottom: 15px;
                    }
                }

                .announcement-content {
                    color: #444;
                    line-height: 1.6;
                    margin-bottom: 0;
                    white-space: pre-wrap;
                    font-size: 1em;
                    word-break: break-word;
                }

                @media (max-width: 768px) {
                    .announcement-content {
                        font-size: 0.95em;
                        line-height: 1.6;
                        margin-bottom: 0;
                    }
                }

                .store-link {
                    display: block;
                    padding: 15px;
                    background: #f8f8f8;
                    border-radius: 8px;
                    margin: 15px 0;
                    color: #333;
                    text-decoration: none;
                    transition: background 0.2s;
                }

                .store-link:hover {
                    background: #f0f0f0;
                    text-decoration: none;
                }

                .contact-section {
                    margin-top: 25px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                }

                .contact-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 0;
                }

                .contact-label {
                    min-width: 120px;
                    color: #666;
                }

                .contact-value {
                    font-weight: 500;
                    margin-left: 15px;
                }

                @media (max-width: 768px) {
                    .contact-item {
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 8px 0;
                    }

                    .contact-label {
                        min-width: auto;
                        margin-bottom: 4px;
                    }

                    .contact-value {
                        margin-left: 0;
                    }
                }

                .announcement-images {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    margin-top: 15px;
                }

                @media (max-width: 768px) {
                    .announcement-images {
                        grid-template-columns: 1fr;
                        gap: 15px;
                        margin-top: 12px;
                    }
                }

                .announcement-images img {
                    width: 100%;
                    aspect-ratio: 1;
                    object-fit: contain;
                    background: #f8f8f8;
                    border-radius: 12px;
                    display: block;
                }

                @media (max-width: 768px) {
                    .announcement-images img {
                        aspect-ratio: 1;
                        border-radius: 8px;
                    }
                }

                .important-badge {
                    display: inline-block;
                    background: #ff2442;
                    color: white;
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-size: 0.85em;
                    margin-left: 10px;
                    font-weight: 500;
                }

                a {
                    color: #007AFF;
                    text-decoration: none;
                    word-break: break-all;
                }

                a:hover {
                    text-decoration: underline;
                }

                .contact-item {
                    margin: 4px 0;
                    padding: 8px 0;
                }

                .store-link {
                    margin: 8px 0;
                }

                .empty-line {
                    height: 8px;
                }
            </style>
            ${announcements.map(announcement => {
                const content = announcement.content
                    .split('\n')
                    .map(line => {
                        if (!line.trim()) {
                            return '';
                        }
                        if (line.includes('taobao.com')) {
                            const storeName = line.split('：')[0];
                            const storeUrl = line.split('：')[1].trim();
                            return `<a href="${storeUrl}" class="store-link" target="_blank">${storeName}</a>`;
                        }
                        if (line.includes('wechat')) {
                            const [label, value] = line.split('：');
                            return `<div class="contact-item">
                                <span class="contact-label">${label}</span>
                                <span class="contact-value">${value}</span>
                            </div>`;
                        }
                        return line;
                    })
                    .filter(line => line !== '')
                    .join('\n');

                return `
                    <div class="announcement-card ${announcement.important ? 'important' : ''}">
                        <div class="announcement-date">
                            ${this.formatDate(announcement.date)}
                            ${announcement.important ? 
                                '<span class="important-badge">Important</span>' : 
                                ''}
                        </div>
                        <div class="announcement-title">
                            ${announcement.title
                                .replace('购买地址', 'Shopping Links')
                                .replace('联系方式', 'Contact Info')}
                        </div>
                        <div class="announcement-content">${content}</div>
                        ${announcement.images.length > 0 ? `
                            <div class="announcement-images">
                                ${announcement.images.map(imageUrl => `
                                    <img src="${imageUrl}" alt="Announcement image">
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('')}
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