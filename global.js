// global.js

// Step 1: Logging and helper function
console.log("IT’S ALIVE!");
function $$(selector, context = document) {
  return Array.from((context || document).querySelectorAll(selector));
}

// =========================================================
// Step 3: Automatic Navigation Menu

// Determine base path for internal links
const BASE_PATH =
  (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "/"
    : "/portfolio/";

// Define site pages (relative for internals, absolute for externals)
const pages = [
  { url: "",             title: "Home"     },
  { url: "projects/",     title: "Projects" },
  { url: "contact/",      title: "Contact"  },
  { url: "resume/",       title: "Resume"   },
  { url: "https://github.com/clt005", title: "GitHub" }
];

// Create and insert the <nav>
const nav = document.createElement("nav");
document.body.prepend(nav);

// Populate it with links
for (const { url, title } of pages) {
  const href = url.startsWith("http") ? url : BASE_PATH + url;
  const a = document.createElement("a");
  a.href = href;
  a.textContent = title;

  // Highlight the current page
  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add("current");
  }

  // External links open in a new tab
  if (a.host !== location.host) {
    a.target = "_blank";
  }

  nav.append(a);
}

// =========================================================
// Step 4: Dark Mode Switch

// Helper to apply a scheme
function setColorScheme(scheme) {
  if (scheme === "auto") {
    document.documentElement.style.removeProperty("color-scheme");
    document.documentElement.style.setProperty("color-scheme", "light dark");
  } else {
    document.documentElement.style.setProperty("color-scheme", scheme);
  }
}

// Inject the switch UI at the top-right
document.body.insertAdjacentHTML(
  "afterbegin",
  `
  <label class="color-scheme" style="
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 0.8rem;
  ">
    Theme:
    <select id="theme-select">
      <option value="auto">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);

// Initialize and wire up the dropdown
const themeSelect = document.querySelector("#theme-select");
if (themeSelect) {
  // Apply saved preference or default to auto
  const stored = localStorage.getItem("colorScheme");
  themeSelect.value = stored || "auto";
  setColorScheme(themeSelect.value);

  themeSelect.addEventListener("input", (e) => {
    const choice = e.target.value;
    setColorScheme(choice);
    localStorage.setItem("colorScheme", choice);
  });
}

// =========================================================
// Step 5: Better Contact Form Handling

const form = document.querySelector("form");
if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    let mailto = form.action; // e.g. "mailto:you@example.com"
    const params = [];

    for (const [name, value] of data.entries()) {
      params.push(
        `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
      );
    }
    if (params.length) {
      mailto += "?" + params.join("&");
    }

    // Open the mail client with properly encoded subject/body
    location.href = mailto;
  });
}
