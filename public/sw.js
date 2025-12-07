importScripts('/scram/scramjet.all.js');

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

// URLs that SHOULD be proxied
function isScramjetRequest(url) {
  return (
    url.pathname.startsWith('/scram/') ||
    url.pathname.startsWith('/baremux/') ||
    url.pathname.startsWith('/epoxy/')
  );
}

async function handleRequest(event) {
  const req = event.request;
  const url = new URL(req.url);

  // If NOT a scramjet request → do NOT proxy
  if (!isScramjetRequest(url)) {
    return fetch(req);
  }

  // Scramjet request → run proxy logic
  await scramjet.loadConfig();
  if (scramjet.route(event)) {
    return scramjet.fetch(event);
  }

  return fetch(req);
}

self.addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event));
});
