
const CACHE_NAME = 'pharma-erp-cache-v1';
// These are the core files for the app shell to work offline.
// In a production Next.js PWA, this would be auto-generated to include build artifacts.
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/maskable_icon.png'
];

// --- Caching Strategy ---

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache, caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
    // We only want to cache GET requests for http/https.
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
        return;
    }

    // Network first strategy for dynamic content, then cache fallback
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // If the request is successful, cache it
                if (response && response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            // Don't cache API calls or hot-update files
                            if (event.request.url.includes('/api/') || event.request.url.includes('/_next/static/webpack/')) {
                                return;
                            }
                            cache.put(event.request, responseToCache);
                        });
                }
                return response;
            })
            .catch(() => {
                // If the network request fails, try to serve from cache
                return caches.match(event.request)
                    .then(response => {
                        return response || caches.match('/'); // Fallback to home page if specific asset isn't cached
                    });
            })
    );
});


self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


// --- Background Sync Logic ---

const DB_NAME_SW = 'PharmaERP-DB';
const DB_VERSION_SW = 1;
const STORE_NAME_SW = 'sync-queue';

function openDBSW() {
    return new Promise((resolve, reject) => {
        const request = self.indexedDB.open(DB_NAME_SW, DB_VERSION_SW);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME_SW)) {
                db.createObjectStore(STORE_NAME_SW, { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

async function syncData() {
    console.log('Service Worker: Sync event triggered');
    const db = await openDBSW() as IDBDatabase;
    const transaction = db.transaction(STORE_NAME_SW, 'readwrite');
    const store = transaction.objectStore(STORE_NAME_SW);
    const queuedItems = await new Promise<any[]>((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });

    if (!queuedItems || queuedItems.length === 0) {
        console.log('Service Worker: No items to sync.');
        return;
    }

    console.log('Service Worker: Syncing items:', queuedItems);

    for (const item of queuedItems) {
        try {
            const response = await fetch(item.endpoint, {
                method: item.method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.payload),
            });

            if (response.ok) {
                console.log(`Service Worker: Successfully synced item ${item.id}`);
                const deleteTx = db.transaction(STORE_NAME_SW, 'readwrite');
                await new Promise<void>((resolve, reject) => {
                    const req = deleteTx.objectStore(STORE_NAME_SW).delete(item.id);
                    req.onsuccess = () => resolve();
                    req.onerror = () => reject(req.error);
                });
            } else {
                console.error(`Service Worker: Failed to sync item ${item.id}. Server responded with ${response.status}`);
            }
        } catch (error) {
            console.error(`Service Worker: Network error during sync for item ${item.id}. Will retry later.`, error);
            return; // Exit and retry on next sync event
        }
    }
    console.log('Service Worker: Sync completed.');
}

self.addEventListener('sync', (event: any) => {
    if (event.tag === 'sync-forms') {
        event.waitUntil(syncData());
    }
});