const CACHE_NAME = 'hidayahpath-v1.0.2';
const STATIC_CACHE = 'hidayahpath-static-v1.0.2';
const DYNAMIC_CACHE = 'hidayahpath-dynamic-v1.0.2';
const APP_VERSION = '1.0.2';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/alquran.html',
  '/fahmi.html',
  '/hasanah.html',
  '/studio.html',
  '/manifest.json',
  '/logo.png',
  '/latarbelakang.jpg',
  '/js/quran-data.js',
  '/js/streak-manager.js',
  '/js/pwa-manager.js',
  '/js/update-manager.js',
  '/js/ai-service-manager.js',
  '/js/fahmi-chatbot.js',
  '/js/hasanah-generator.js',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Scheherazade+New:wght@400;700&display=swap'
];

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE;
            })
            .map(cacheName => {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome extension requests
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  // Skip requests that are not http or https
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return cachedResponse;
        }

        // Network request for new resources
        return fetch(event.request)
          .then(response => {
            // Check if response is valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response for caching
            const responseToCache = response.clone();

            // Cache dynamic content
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                // Don't cache API calls or external resources except fonts and CSS
                if (event.request.url.includes('/api/') || 
                    (event.request.url.includes('http') && 
                     !event.request.url.includes('fonts.googleapis.com') &&
                     !event.request.url.includes('fonts.gstatic.com') &&
                     !event.request.url.includes('cdn.tailwindcss.com') &&
                     !event.request.url.includes('unpkg.com'))) {
                  return;
                }
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.log('Service Worker: Fetch failed, serving offline fallback', error);
            
            // Return offline fallback for HTML pages
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // Return offline fallback for images
            if (event.request.destination === 'image') {
              return new Response('', {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'image/svg+xml' }
              });
            }
            
            throw error;
          });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'streak-sync') {
    event.waitUntil(syncStreak());
  }
});

// Push notification support
self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Waktunya beribadah!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Buka Aplikasi',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Tutup',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('HidayahPath', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// Sync streak data when online
async function syncStreak() {
  try {
    const streakData = localStorage.getItem('dailyStreak');
    if (streakData) {
      // Send to server when online
      await fetch('/api/sync-streak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ streak: streakData })
      });
    }
  } catch (error) {
    console.error('Service Worker: Failed to sync streak', error);
  }
}

// Cache management and update handling
self.addEventListener('message', event => {
  console.log('Service Worker: Received message', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Skipping waiting...');
    self.skipWaiting();
    
    // Notify all clients about the update
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_UPDATED',
          version: APP_VERSION
        });
      });
    });
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    event.waitUntil(updateCache());
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION',
      version: APP_VERSION
    });
  }
});

// Notify clients when new version is available
self.addEventListener('install', event => {
  console.log(`Service Worker: Installing version ${APP_VERSION}...`);
  
  // Notify all clients about update availability
  event.waitUntil(
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_AVAILABLE',
          version: APP_VERSION
        });
      });
    })
  );
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Error caching static files', error);
      })
  );
});

async function updateCache() {
  console.log('Service Worker: Updating cache...');
  const cache = await caches.open(STATIC_CACHE);
  const requests = STATIC_FILES.map(url => {
    return cache.add(url).catch(error => {
      console.warn(`Failed to cache ${url}:`, error);
    });
  });
  await Promise.all(requests);
  console.log('Service Worker: Cache updated successfully');
}