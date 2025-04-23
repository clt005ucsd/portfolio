import { fetchJSON, renderProjects } from './global.js';

(async () => {
  // 1. Fetch all projects
  const projects = await fetchJSON('./lib/projects.json');

  // 2. Take only the first three
  const latestProjects = projects.slice(0, 3);

  // 3. Find the container on the page
  const projectsContainer = document.querySelector('.projects');
  if (!projectsContainer) {
    console.error('No .projects container found on the homepage.');
    return;
  }

  // 4. Render them using your reusable function
  renderProjects(latestProjects, projectsContainer, 'h2');
})();