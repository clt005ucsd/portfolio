import { fetchJSON, renderProjects } from '../global.js';

(async () => {
  // 1. Fetch the data
  const projects = await fetchJSON('../lib/projects.json');

  // 2. Render into the .projects container
  const container = document.querySelector('.projects');
  renderProjects(projects, container, 'h2');

  // 3. Update the count in .projects-title
  const titleEl = document.querySelector('.projects-title');
  if (titleEl) {
    titleEl.textContent = `Projects (${projects.length})`;
  }
})();