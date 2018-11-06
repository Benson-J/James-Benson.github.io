var log = console.log.bind(console)
var version = '0.0.1'
var cacheName = 'todos'
var cache = cacheName + '-' + version
filesToCache = [
    // 'http://localhost:8888/css/style.css',
    // 'http://localhost:8888/js/app.js',
    // 'http://localhost:8888/js/localforage.js',
    // 'http://localhost:8888/images/icons/favicon.ico',
    // 'http://localhost:8888/images/icons.icon-144x144.png',
    // 'http://localhost:8888/manifest.json',
    // 'http://localhost:8888/',
    // 'http://localhost:8888/index.php',
    // 'http://localhost:8888/done'
]

// importScripts('js/localforage.js')

self.addEventListener('install', function (event) {
    log('[ServiceWorker] Installing...')

    event.waitUntil(caches
        .open(cache)
        .then(function (swcache) {
            log('[ServiceWorker] Caching files')
            return swcache.addAll(filesToCache)
        })
    )
})

self.addEventListener('fetch', function (event) {
    if (filesToCache.includes(event.request.url)) {
        event.respondWith(
            caches.match(event.request)
                .then(function (response) {
                    if (response) {
                        log('Fulfilling ' + event.request.url + ' from cache.')
                        return response
                    } else {
                        log(event.request.url + ' not found in cache, fetching from network.')
                        return fetch(event.request)
                    }
                })
        )
    }
    if (event.request.url === 'http://localhost:8888/api/todo' && event.request.method == 'GET') {
        event.respondWith(async function() {
            let response = await fetch(event.request).catch(async function (err) {
                var data = {success:true, msg:'', data: []}
                await localforage.iterate(function (value, key) {
                    data.data.push([key, value])
                })
                if (data.data.length > 0) {
                    log('Returning cached data')
                    return await new Response(JSON.stringify(data), {
                        headers: {'Content-Type': 'application/json'}
                    })
                }
            })

            let responseData = await response.clone().json()
            await localforage.clear()
            log(responseData)
            await responseData.data.forEach(function (todo) {
                localforage.setItem(todo[0], todo[1])
            })
            return response
        }())
    }
})

