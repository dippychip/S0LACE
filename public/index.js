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
 * Only initialize Ultraviolet if:
 * - We are on a page that actually has the proxy elements
 * - The Ultraviolet global and config exist
 */
if (
  form &&
  address &&
  searchEngine &&
  error &&
  errorCode
) {
  // Wait for Ultraviolet to load
  const initProxy = () => {
    if (typeof window.Ultraviolet === "undefined" || typeof window.__uv$config === "undefined") {
      console.warn("Ultraviolet not loaded yet, retrying...");
      setTimeout(initProxy, 100);
      return;
    }

    console.log("Initializing Ultraviolet proxy");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      try {
        // register service worker before using Ultraviolet
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

      try {
        // Wait a bit for service worker to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if config is available
        if (!window.__uv$config) {
          throw new Error("Ultraviolet config not loaded");
        }

        // Create iframe for Ultraviolet (remove old one if exists)
        const oldFrame = document.getElementById("uv-frame");
        if (oldFrame) oldFrame.remove();

        const frame = document.createElement("iframe");
        frame.id = "uv-frame";
        frame.className = "uv-frame";
        frame.style.cssText = "position: fixed; inset: 0; width: 100vw; height: 100vh; border: none; z-index: 1;";
        document.body.appendChild(frame);

        // Encode URL using Ultraviolet
        const encodedUrl = window.__uv$config.encodeUrl(url);
        const proxiedUrl = window.__uv$config.prefix + encodedUrl;
        
        console.log("Navigating to:", proxiedUrl);
        frame.src = proxiedUrl;
        
        // Clear any previous errors
        if (error) error.textContent = "";
        if (errorCode) errorCode.textContent = "";
      } catch (err) {
        console.error("Proxy error:", err);
        if (error) error.textContent = "Failed to load page.";
        if (errorCode) errorCode.textContent = err.toString();
      }
    });
  };

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProxy);
  } else {
    initProxy();
  }
} else {
  // Not on the proxy page or libs not loaded – do nothing.
  // This prevents crashes on media/games/apps/mediaplayer pages.
}
