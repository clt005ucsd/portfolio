// Step 1: Basic Setup
console.log("IT'S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Step 4.2 & 4.3: Insert Dark Mode Switch at top-right
document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme" style="position: absolute; top: 1rem; right: 1rem; font-size: 0.8rem;">
    Theme:
    <select id="theme-select">
      <option value="auto">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);

// Step 4.4 & 4.5: Dark Mode Preference Handling
function setColorScheme(scheme) {
  if (scheme === 'auto') {
    document.documentElement.style.removeProperty('color-scheme');
    document.documentElement.style.setProperty('color-scheme', 'light dark');
  } else {
    document.documentElement.style.setProperty('color-scheme', scheme);
  }
}

const themeSelect = document.querySelector('#theme-select');
if (themeSelect) {
  // Apply saved preference (if any)
  const saved = localStorage.colorScheme;
  if (saved) {
    themeSelect.value = saved;
    setColorScheme(saved);
  } else {
    // Initialize to automatic
    setColorScheme('auto');
  }

  // When user changes the dropdown
  themeSelect.addEventListener('input', (event) => {
    const val = event.target.value;
    setColorScheme(val);
    localStorage.colorScheme = val;
  });
}

// Step 3.1 & 3.2: Automatic Navigation Menu
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"
  : "/portfolio/";  // adjust this to match your repo name

const pages = [
  { url: '',             title: 'Home'     },
  { url: 'projects/',     title: 'Projects' },
  { url: 'contact/',      title: 'Contact'  },
  { url: 'resume/',       title: 'Resume'   },
  { url: 'https://github.com/clt005', title: 'GitHub' }
];

const nav = document.createElement('nav');
document.body.prepend(nav);

for (const {url, title} of pages) {
  let href = url.startsWith('http') ? url : BASE_PATH + url;
  const a = document.createElement('a');
  a.href = href;
  a.textContent = title;

  // Highlight current page
  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }

  // Open external links in a new tab
  if (a.host !== location.host) {
    a.target = "_blank";
  }

  nav.append(a);
}

// Step 5: Better Contact Form (Optional)
const form = document.querySelector('form');
form?.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = new FormData(form);
  let mailto = form.action;  // e.g. "mailto:you@example.com"
  const params = [];

  for (const [name, value] of data.entries()) {
    params.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
  }

  if (params.length) {
    mailto += '?' + params.join('&');
  }

  console.log('Final mailto URL:', mailto);
  location.href = mailto;
});
