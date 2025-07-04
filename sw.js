// Service Worker for WebTools Pro
const CACHE_NAME = 'webtools-pro-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/css/style.css',
  '/assets/js/main.js',
  '/assets/js/image-compressor.js',
  '/assets/js/html-formatter.js',
  '/assets/js/calculator.js',
  '/assets/js/qr-generator.js',
  '/tools/image-compressor.html',
  '/tools/html-formatter.html',
  '/tools/calculator.html',
  '/tools/qr-generator.html',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js',
  'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.log('Cache installation failed:', error);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // Clone the request because it's a stream and can only be consumed once
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response because it's a stream and can only be consumed once
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New tool available on WebTools Pro!',
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore Tools',
        icon: '/assets/icons/explore.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/icons/close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('WebTools Pro', options)
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync function
function doBackgroundSync() {
  // Implement background sync logic here
  console.log('Background sync completed');
}

// Message handling
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Error handling
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

// Unhandled rejection
self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason);
}); 