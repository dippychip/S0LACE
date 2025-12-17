importScripts('/uv/uv.bundle.js');

// Service worker config
self.__uv$config = {
    prefix: '/service/',
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/uv/uv.handler.js',
    client: '/uv/uv.client.js',
    bundle: '/uv/uv.bundle.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js',
};

importScripts(self.__uv$config.sw || '/uv/uv.sw.js');

const uv = new UVServiceWorker();

async function handleRequest(event) {
  const url = new URL(event.request.url);

  // let TMDB images go straight to the network (no proxy)
  if (url.hostname === 'image.tmdb.org') {
    return; // do NOT call respondWith -> browser handles normally
  }

  if (uv.route(event)) {
    return await uv.fetch(event);
  }
  
  return await fetch(event.request);
}

self.addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event));
});
