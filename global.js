// Step 1: Basic Setup
console.log("IT'S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Step 4.2 & 4.3: Dark Mode Switch
document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme" style="position: absolute; top: 1rem; right: 1rem; font-size: 0.8rem;">
        Theme:
        <select>
            <option value="auto">Automatic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
    </label>`,
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
if ('colorScheme' in localStorage) {
    const savedScheme = localStorage.colorScheme;
    setColorScheme(savedScheme);
    if (themeSelect) {
      themeSelect.value = savedScheme;
    }
}

themeSelect.addEventListener('input', function (event) {
    const newScheme = event.target.value;
    console.log('Color scheme changed to:', newScheme);
    setColorScheme(newScheme);
    localStorage.colorScheme = newScheme;
});

// // Step 2.1: Navigation Menu (Manual)
// const navLinks = $$("nav a");
// // Step 2.2
// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
//   );
// // Step 2.3
// currentLink?.classList.add('current');

// Step 3.1: Navigation Menu
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                
  : "/portfolio/";

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume/', title: 'Resume' },
    { url: 'https://github.com/clt005', title: 'GitHub' }
  ];

let nav = document.createElement('nav');
document.body.prepend(nav);
// Step 3.2: Navigation Menu
for (let p of pages) {
    let url = p.url;
    let title = p.title;
    url = !url.startsWith('http') ? BASE_PATH + url : url;
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname,
      );
    if (a.host !== location.host) {
        a.target = "_blank";
    }
    nav.append(a);
}

// Step 5: Better Contact Form
const form = document.querySelector('form');

form?.addEventListener('submit', function (event) {
    event.preventDefault();
    const data = new FormData(form);
    let baseUrl = form.action;
    let queryParameters = [];
    for (let [name, value] of data.entries()) {
        queryParameters.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
    }
    let finalUrl = baseUrl;
    if (queryParameters.length > 0) {
        finalUrl += '?' + queryParameters.join('&');
    }
    console.log('Final mailto URL:', finalUrl);
    location.href = finalUrl;
});