// AI Service Manager - Manages Gemini API integration
class AIServiceManager {
    constructor() {
        this.apiKey = null;
        this.isConfigured = false;
        this.services = {
            fahmi: null,
            hasanah: null
        };
        
        // Hardcoded API key for development (remove in production)
        this.defaultApiKey = "AIzaSyAxGvhjqziXocgMKLyqanpyxdIcMMnSWdY";
        
        this.init();
    }

    async init() {
        console.log('🤖 Initializing AI Service Manager...');
        
        // Load stored API key or use default
        const storedApiKey = this.getStoredApiKey() || this.defaultApiKey;
        console.log('🔑 Found API key:', !!storedApiKey, storedApiKey?.substring(0, 15) + '...');
        
        if (storedApiKey) {
            // For development, skip validation and set directly
            console.log('🚀 Setting API key directly (development mode)');
            this.apiKey = storedApiKey;
            this.isConfigured = true;
            
            // Save to localStorage if it's the default key
            if (storedApiKey === this.defaultApiKey && !this.getStoredApiKey()) {
                this.saveApiKeyToStorage(storedApiKey);
            }
            
            console.log('✅ API key configured successfully');
        }

        // Initialize services after setting API key
        setTimeout(() => {
            if (window.fahmiChatbot) {
                this.services.fahmi = window.fahmiChatbot;
                if (this.apiKey && !window.fahmiChatbot.isConfigured) {
                    window.fahmiChatbot.setApiKey(this.apiKey);
                }
            }
            if (window.hasanahGenerator) {
                this.services.hasanah = window.hasanahGenerator;
                if (this.apiKey && !window.hasanahGenerator.isConfigured) {
                    window.hasanahGenerator.setApiKey(this.apiKey);
                }
            }
            
            console.log('🔗 Services connected:', {
                fahmi: !!this.services.fahmi,
                hasanah: !!this.services.hasanah
            });
        }, 1000); // Increased timeout for better detection

        console.log('🤖 AI Service Manager initialized - Configured:', this.isConfigured);
    }

    // Set API key untuk semua services
    async setApiKey(apiKey) {
        try {
            // For development with default API key, skip validation
            if (apiKey === this.defaultApiKey) {
                console.log('🚀 Using default API key, skipping validation');
                this.apiKey = apiKey;
                this.isConfigured = true;
            } else {
                // Validate API key first for user-provided keys
                const isValid = await this.validateApiKey(apiKey);
                if (!isValid) {
                    throw new Error('API key tidak valid');
                }
                
                this.apiKey = apiKey;
                this.isConfigured = true;
            }

            // Re-initialize services in case they weren't detected before
            this.reinitializeServices();
            
            // Set API key untuk semua services
            if (this.services.fahmi) {
                this.services.fahmi.setApiKey(apiKey);
            }
            if (this.services.hasanah) {
                this.services.hasanah.setApiKey(apiKey);
            }

            // Save to localStorage
            this.saveApiKeyToStorage(apiKey);
            
            console.log('✅ API key configured successfully:', this.isConfigured);
            
            // Show success notification
            this.showNotification('✅ API key berhasil dikonfigurasi!', 'success');
            
            // Hide API key setup UI
            this.hideApiKeySetup();
            
            return true;
        } catch (error) {
            console.error('Error setting API key:', error);
            this.showNotification('❌ API key tidak valid atau bermasalah', 'error');
            return false;
        }
    }

    // Validate API key
    async validateApiKey(apiKey) {
        try {
            console.log('🔍 Validating API key:', apiKey?.substring(0, 10) + '...');
            
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
            
            const testRequest = {
                contents: [{
                    parts: [{
                        text: "Test connection. Reply with 'OK' only."
                    }]
                }]
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testRequest)
            });

            console.log('✅ API validation response:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ API validation successful');
                return true;
            } else {
                const errorText = await response.text();
                console.error('❌ API validation failed:', response.status, errorText);
                return false;
            }
        } catch (error) {
            console.error('❌ API key validation error:', error);
            return false;
        }
    }

    // Get stored API key
    getStoredApiKey() {
        return localStorage.getItem('gemini_api_key');
    }

    // Save API key to localStorage
    saveApiKeyToStorage(apiKey) {
        localStorage.setItem('gemini_api_key', apiKey);
    }

    // Remove API key
    removeApiKey() {
        this.apiKey = null;
        this.isConfigured = false;
        localStorage.removeItem('gemini_api_key');
        
        // Clear API key dari services
        if (this.services.fahmi) {
            this.services.fahmi.apiKey = null;
            this.services.fahmi.isConfigured = false;
        }
        if (this.services.hasanah) {
            this.services.hasanah.apiKey = null;
            this.services.hasanah.isConfigured = false;
        }

        this.showNotification('API key dihapus', 'info');
        this.showApiKeySetup();
    }

    // Re-initialize services (useful for late-loaded services)
    reinitializeServices() {
        console.log('🔄 Re-initializing services...');
        
        if (window.fahmiChatbot && !this.services.fahmi) {
            this.services.fahmi = window.fahmiChatbot;
            if (this.apiKey && !window.fahmiChatbot.isConfigured) {
                window.fahmiChatbot.setApiKey(this.apiKey);
            }
            console.log('✅ Fahmi Chatbot connected');
        }
        
        if (window.hasanahGenerator && !this.services.hasanah) {
            this.services.hasanah = window.hasanahGenerator;
            if (this.apiKey && !window.hasanahGenerator.isConfigured) {
                window.hasanahGenerator.setApiKey(this.apiKey);
            }
            console.log('✅ Hasanah Generator connected');
        }
        
        console.log('🔗 Services status after re-init:', {
            fahmi: !!this.services.fahmi,
            hasanah: !!this.services.hasanah
        });
    }

    // Check if configured
    isReady() {
        return this.isConfigured && this.apiKey;
    }

    // Show API key setup UI
    showApiKeySetup() {
        // Remove existing setup if any
        const existing = document.querySelector('#api-key-setup');
        if (existing) existing.remove();

        const setupDiv = document.createElement('div');
        setupDiv.id = 'api-key-setup';
        setupDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        setupDiv.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-lg font-bold mb-4">🤖 Setup AI Service</h3>
                <p class="text-gray-600 mb-4">
                    Untuk menggunakan fitur Fahmi dan Hasanah, diperlukan API key Google Gemini.
                </p>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">Google Gemini API Key:</label>
                    <input 
                        type="password" 
                        id="api-key-input" 
                        placeholder="Masukkan API key Anda..."
                        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                    <p class="text-xs text-gray-500 mt-1">
                        Dapatkan gratis di <a href="https://makersuite.google.com/app/apikey" target="_blank" class="text-blue-500">Google AI Studio</a>
                    </p>
                </div>
                
                <div class="flex space-x-3">
                    <button 
                        onclick="aiServiceManager.handleApiKeySetup()" 
                        class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Simpan API Key
                    </button>
                    <button 
                        onclick="aiServiceManager.hideApiKeySetup()" 
                        class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Nanti
                    </button>
                </div>
                
                <div class="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p class="text-xs text-blue-700">
                        💡 API key disimpan lokal di browser Anda dan tidak dikirim ke server kami.
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(setupDiv);
        
        // Focus input
        setTimeout(() => {
            document.getElementById('api-key-input')?.focus();
        }, 100);
    }

    // Hide API key setup
    hideApiKeySetup() {
        const setup = document.querySelector('#api-key-setup');
        if (setup) {
            setup.remove();
        }
    }

    // Handle API key setup from UI
    async handleApiKeySetup() {
        const input = document.getElementById('api-key-input');
        const apiKey = input?.value.trim();
        
        if (!apiKey) {
            this.showNotification('Silakan masukkan API key', 'warning');
            return;
        }

        // Show loading
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'Memvalidasi...';
        button.disabled = true;

        const success = await this.setApiKey(apiKey);
        
        // Reset button
        button.textContent = originalText;
        button.disabled = false;

        if (success) {
            this.hideApiKeySetup();
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.ai-notification');
        if (existing) existing.remove();

        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const notification = document.createElement('div');
        notification.className = `ai-notification fixed top-4 right-4 ${colors[type]} text-white p-4 rounded-lg shadow-lg z-50 max-w-sm`;
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white opacity-70 hover:opacity-100">
                    ×
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Get service status
    getServiceStatus() {
        return {
            configured: this.isConfigured,
            fahmi: this.services.fahmi?.isConfigured || false,
            hasanah: this.services.hasanah?.isConfigured || false
        };
    }

    // Show service settings
    showServiceSettings() {
        const status = this.getServiceStatus();
        
        const settingsDiv = document.createElement('div');
        settingsDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        settingsDiv.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-lg font-bold mb-4">⚙️ AI Service Settings</h3>
                
                <div class="space-y-3 mb-4">
                    <div class="flex justify-between items-center">
                        <span>API Configuration:</span>
                        <span class="${status.configured ? 'text-green-500' : 'text-red-500'}">
                            ${status.configured ? '✅ Active' : '❌ Not Set'}
                        </span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span>Fahmi Chatbot:</span>
                        <span class="${status.fahmi ? 'text-green-500' : 'text-red-500'}">
                            ${status.fahmi ? '✅ Ready' : '❌ Not Ready'}
                        </span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span>Hasanah Generator:</span>
                        <span class="${status.hasanah ? 'text-green-500' : 'text-red-500'}">
                            ${status.hasanah ? '✅ Ready' : '❌ Not Ready'}
                        </span>
                    </div>
                </div>
                
                <div class="flex space-x-3">
                    ${!status.configured ? 
                        '<button onclick="aiServiceManager.showApiKeySetup(); this.closest(\'div\').parentElement.remove()" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg">Setup API Key</button>' :
                        '<button onclick="aiServiceManager.removeApiKey(); this.closest(\'div\').parentElement.remove()" class="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg">Remove API Key</button>'
                    }
                    <button onclick="this.closest(\'div\').parentElement.remove()" class="px-4 py-2 border border-gray-300 rounded-lg">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(settingsDiv);
    }

    // Check if services need setup
    checkSetupRequired() {
        if (!this.isConfigured) {
            // Show setup on first visit after 2 seconds
            setTimeout(() => {
                const hasShownSetup = localStorage.getItem('ai_setup_shown');
                if (!hasShownSetup) {
                    this.showApiKeySetup();
                    localStorage.setItem('ai_setup_shown', 'true');
                }
            }, 2000);
        }
    }
}

// Initialize global AI Service Manager
window.aiServiceManager = new AIServiceManager();

// Auto-check setup on page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.aiServiceManager.checkSetupRequired();
        // Re-initialize services after a delay to catch late-loaded services
        setTimeout(() => {
            window.aiServiceManager.reinitializeServices();
        }, 2000);
    }, 1000);
});

// Make class available globally for debugging
window.AIServiceManager = AIServiceManager;