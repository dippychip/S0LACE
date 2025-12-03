// global-hub.js
(function () {
  // Same presets as settings page
  const TAB_PRESETS = {
    default: {
      title: "S0LACE",
      favicon: "favicon.ico",
    },
    gdocs: {
      title: "Untitled document - Google Docs",
      favicon: "https://ssl.gstatic.com/docs/doclist/images/drive_icon_16.png",
    },
    gclass: {
      title: "Classes",
      favicon: "https://ssl.gstatic.com/classroom/favicon.png",
    },
    gdrive: {
      title: "My Drive - Google Drive",
      favicon: "https://ssl.gstatic.com/docs/doclist/images/drive_icon_16.png",
    },
    khan: {
      title: "Dashboard | Khan Academy",
      favicon: "https://cdn.kastatic.org/images/favicon.ico",
    },
  };

  function getFaviconLinks() {
    const links = Array.from(
      document.querySelectorAll(
        'link[rel="icon"], link[rel="shortcut icon"]'
      )
    );
    if (links.length > 0) return links;

    const link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
    return [link];
  }

  function applySavedTabCloak() {
    const mode = localStorage.getItem("sjTabMode") || "preset";
    const presetKey = localStorage.getItem("sjTabPreset") || "default";
    const savedTitle = localStorage.getItem("sjTabTitle") || "";
    const savedFav = localStorage.getItem("sjTabFavicon") || "";

    let finalTitle = document.title || "S0LACE";
    let finalFav = null;

    if (mode === "custom") {
      if (savedTitle) finalTitle = savedTitle;
      if (savedFav) finalFav = savedFav;
    } else {
      const p = TAB_PRESETS[presetKey] || TAB_PRESETS.default;
      finalTitle = p.title;
      finalFav = p.favicon;
    }

    document.title = finalTitle;

    if (finalFav) {
      const links = getFaviconLinks();
      links.forEach((l) => (l.href = finalFav));
    }
  }

  // NEW: Helper to inject the specific colors you requested
  function injectThemeStyles() {
    const styleId = "sj-dynamic-theme";
    if (document.getElementById(styleId)) return; // Prevent duplicates

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      /* DEFAULT (DARK MODE) - PURE BLACK */
      body {
        background-color: #000000 !important;
        color: #ffffff !important; /* White text for contrast */
        transition: background-color 0.3s ease, color 0.3s ease;
      }
      
      /* Make sure headings/titles inherit the white color in dark mode */
      h1, h2, h3, h4, h5, h6, .title, span, p {
        color: inherit; 
      }

      /* LIGHT THEME - GRAY */
      body.theme-light {
        background-color: #808080 !important; /* Standard Gray */
        color: #000000 !important; /* Black text for contrast */
      }
    `;
    document.head.appendChild(style);
  }

  function applySavedTheme() {
    const mode = localStorage.getItem("sjTheme") || "dark";
    if (mode === "light") {
      document.body.classList.add("theme-light");
    } else {
      document.body.classList.remove("theme-light");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    injectThemeStyles(); // Inject the CSS colors first
    applySavedTheme();   // Apply the class
    applySavedTabCloak();
  });
})();
