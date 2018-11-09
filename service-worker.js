var log = console.log.bind(console)
var version = '0.0.1'
var cacheName = ''
var cache = cacheName + '-' + version
filesToCache = [

]

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

