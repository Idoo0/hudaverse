// Auto-Update Manager untuk PWA HidayahPath
class UpdateManager {
    constructor() {
        this.swRegistration = null;
        this.updateAvailable = false;
        this.refreshing = false;
        this.init();
    }

    async init() {
        if ('serviceWorker' in navigator) {
            // Register service worker
            try {
                this.swRegistration = await navigator.serviceWorker.register('sw.js');
                console.log('✅ Service Worker registered:', this.swRegistration.scope);
                
                // Setup update listeners
                this.setupUpdateListeners();
                
                // Check for updates periodically
                this.startUpdateChecker();
                
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }

    setupUpdateListeners() {
        // Listen for new service worker
        this.swRegistration.addEventListener('updatefound', () => {
            console.log('🔄 New service worker found, installing...');
            const newWorker = this.swRegistration.installing;
            
            newWorker.addEventListener('statechange', () => {
                switch (newWorker.state) {
                    case 'installed':
                        if (navigator.serviceWorker.controller) {
                            // New update available
                            console.log('🆕 New content available');
                            this.updateAvailable = true;
                            this.showUpdateNotification();
                        } else {
                            // First install
                            console.log('✅ Content cached for offline use');
                            this.showInstallSuccess();
                        }
                        break;
                    case 'redundant':
                        console.log('❌ New service worker redundant');
                        break;
                }
            });
        });

        // Listen for controller change (after update)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (this.refreshing) return;
            this.refreshing = true;
            console.log('🔄 Controller changed, reloading...');
            window.location.reload();
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
                this.showUpdateNotification();
            }
        });
    }

    showUpdateNotification() {
        // Remove existing notification
        const existing = document.querySelector('.update-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'update-notification fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm transform transition-all duration-300 translate-x-full';
        notification.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-medium">Update Tersedia!</p>
                    <p class="text-sm text-blue-100 mt-1">Versi baru aplikasi sudah siap digunakan</p>
                    <div class="mt-3 flex space-x-2">
                        <button onclick="updateManager.applyUpdate()" 
                                class="bg-white text-blue-500 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 transition-colors">
                            Update Sekarang
                        </button>
                        <button onclick="updateManager.dismissUpdate()" 
                                class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                            Nanti Saja
                        </button>
                    </div>
                </div>
                <button onclick="updateManager.dismissUpdate()" 
                        class="flex-shrink-0 text-blue-200 hover:text-white">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto dismiss after 30 seconds
        setTimeout(() => {
            this.dismissUpdate();
        }, 30000);
    }

    showInstallSuccess() {
        const notification = document.createElement('div');
        notification.className = 'install-success fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <div>
                    <p class="font-medium">Aplikasi Siap Offline!</p>
                    <p class="text-sm text-green-100">Sekarang bisa digunakan tanpa internet</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    applyUpdate() {
        if (this.swRegistration && this.swRegistration.waiting) {
            // Tell service worker to skip waiting
            this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        
        // Show loading
        this.showUpdateProgress();
    }

    dismissUpdate() {
        const notification = document.querySelector('.update-notification');
        if (notification) {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }

    showUpdateProgress() {
        const existing = document.querySelector('.update-notification');
        if (existing) {
            existing.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <div>
                        <p class="font-medium">Mengupdate...</p>
                        <p class="text-sm text-blue-100">Aplikasi akan restart otomatis</p>
                    </div>
                </div>
            `;
        }
    }

    // Check for updates manually
    async checkForUpdate() {
        if (this.swRegistration) {
            console.log('🔍 Checking for updates...');
            await this.swRegistration.update();
        }
    }

    // Start periodic update checker
    startUpdateChecker() {
        // Check for updates every 10 minutes
        setInterval(() => {
            this.checkForUpdate();
        }, 10 * 60 * 1000);

        // Check when app becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkForUpdate();
            }
        });

        // Check when online
        window.addEventListener('online', () => {
            this.checkForUpdate();
        });
    }

    // Get current app version
    async getAppVersion() {
        try {
            const response = await fetch('sw.js');
            const text = await response.text();
            const versionMatch = text.match(/APP_VERSION = ['"]([^'"]+)['"]/);
            return versionMatch ? versionMatch[1] : 'unknown';
        } catch (error) {
            console.error('Failed to get app version:', error);
            return 'unknown';
        }
    }

    // Force update (for testing)
    async forceUpdate() {
        if (this.swRegistration) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                await registration.unregister();
            }
            window.location.reload();
        }
    }
}

// Initialize update manager
let updateManager;
document.addEventListener('DOMContentLoaded', () => {
    updateManager = new UpdateManager();
});

// Export for global access
window.updateManager = updateManager;