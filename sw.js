const CACHE_NAME = 'neurolog-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './services/geminiService.ts',
  './services/googleDriveService.ts',
  './components/Timer.tsx',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Inter:wght@300;400;500;600&display=swap',
  'https://cdn-icons-png.flaticon.com/512/2823/2823616.png',
  'https://unpkg.com/@babel/standalone/babel.min.js'
];

// Instalación: Cachear recursos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activación: Limpiar caches viejas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch: Estrategia Stale-While-Revalidate o Cache First para offline
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones a Google APIs (Auth/Drive) para no romper la lógica online
  if (event.request.url.includes('googleapis.com') || event.request.url.includes('accounts.google.com')) {
    return; 
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => {
      // Si falla todo (offline y no en cache), retornar index si es navegación
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});