// PWA Functionality
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }

    async init() {
        // Register Service Worker
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully:', registration.scope);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }

        // Handle install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Handle app installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallButton();
        });

        // Check if already installed
        this.checkIfInstalled();
    }

    showInstallButton() {
        const installBtn = document.getElementById('install-button');
        if (installBtn) {
            installBtn.style.display = 'flex';
            installBtn.addEventListener('click', () => this.installApp());
        }
    }

    hideInstallButton() {
        const installBtn = document.getElementById('install-button');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }

    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log('User choice:', outcome);
            this.deferredPrompt = null;
            this.hideInstallButton();
        }
    }

    showUpdateNotification() {
        // Remove existing notification
        const existing = document.querySelector('.pwa-update-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'pwa-update-notification fixed top-4 right-4 bg-emerald-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <i data-lucide="download" class="w-5 h-5 flex-shrink-0"></i>
                <div class="flex-1">
                    <p class="font-medium">Update tersedia!</p>
                    <p class="text-sm opacity-90">Versi baru aplikasi sudah siap</p>
                </div>
                <button onclick="this.closest('.pwa-update-notification').remove(); location.reload()" 
                        class="bg-white text-emerald-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
                    Update
                </button>
            </div>
            <button onclick="this.closest('.pwa-update-notification').remove()" 
                    class="absolute top-2 right-2 text-white opacity-70 hover:opacity-100">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        `;
        document.body.appendChild(notification);

        // Initialize Lucide icons for the notification
        if (window.lucide) {
            lucide.createIcons();
        }
        
        // Auto remove after 15 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 15000);
    }

    checkIfInstalled() {
        // Check if running as PWA
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            this.hideInstallButton();
            return true;
        }
        
        // Check iOS Safari
        if (window.navigator.standalone === true) {
            this.hideInstallButton();
            return true;
        }
        
        return false;
    }

    // Utility methods
    isOnline() {
        return navigator.onLine;
    }

    // Push notification support
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }

    async showNotification(title, options = {}) {
        if (await this.requestNotificationPermission()) {
            const defaultOptions = {
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                vibrate: [200, 100, 200]
            };
            
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                // Use service worker for notifications
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, { ...defaultOptions, ...options });
                });
            } else {
                // Fallback to regular notification
                new Notification(title, { ...defaultOptions, ...options });
            }
        }
    }
}

// Initialize PWA Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
});

// Network status monitoring
window.addEventListener('online', () => {
    console.log('App is online');
    // You can add logic here to sync data when back online
});

window.addEventListener('offline', () => {
    console.log('App is offline');
    // You can add logic here to show offline notification
});