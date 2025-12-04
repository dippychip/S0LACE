"use strict";

/**
 * Proxy UI elements (may be null on non-home pages)
 * @type {HTMLFormElement|null}
 */
const form = document.getElementById("sj-form");
/**
 * @type {HTMLInputElement|null}
 */
const address = document.getElementById("sj-address");
/**
 * @type {HTMLInputElement|null}
 */
const searchEngine = document.getElementById("sj-search-engine");
/**
 * @type {HTMLParagraphElement|null}
 */
const error = document.getElementById("sj-error");
/**
 * @type {HTMLPreElement|null}
 */
const errorCode = document.getElementById("sj-error-code");

/**
 * Only initialize Scramjet + BareMux if:
 * - We are on a page that actually has the proxy elements
 * - The Scramjet loader + BareMux globals exist
 */
if (
  form &&
  address &&
  searchEngine &&
  error &&
  errorCode &&
  typeof window.$scramjetLoadController === "function" &&
  window.BareMux
) {
  const { ScramjetController } = $scramjetLoadController();

  const scramjet = new ScramjetController({
    files: {
      wasm: "/scram/scramjet.wasm.wasm",
      all: "/scram/scramjet.all.js",
      sync: "/scram/scramjet.sync.js",
    },
  });

  scramjet.init();

  const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      // register service worker before using Scramjet
      if (typeof registerSW === "function") {
        await registerSW();
      } else {
        console.warn("registerSW is not defined");
      }
    } catch (err) {
      if (error) error.textContent = "Failed to register service worker.";
      if (errorCode) errorCode.textContent = err.toString();
      throw err;
    }

    const url = search(address.value, searchEngine.value);

    let wispUrl =
      (location.protocol === "https:" ? "wss" : "ws") +
      "://" +
      location.host +
      "/wisp/";

    // ensure BareMux has a transport set
    const current = await connection.getTransport();
    if (current !== "/epoxy/index.mjs") {
      await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
    }

    const frame = scramjet.createFrame();
    frame.frame.id = "sj-frame";
    document.body.appendChild(frame.frame);
    frame.go(url);
  });
} else {
  // Not on the proxy page or libs not loaded – do nothing.
  // This prevents crashes on media/games/apps/mediaplayer pages.
}
