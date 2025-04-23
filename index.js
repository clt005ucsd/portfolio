import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

(async () => {
  // 1. Fetch all projects
    const projects = await fetchJSON('./lib/projects.json');

  // 2. Show only the first three on the homepage
    const latestProjects = projects.slice(0, 3);

  // 3. Render them into the .projects container
    const projectsContainer = document.querySelector('.projects');
    if (!projectsContainer) {
        onsole.error('No .projects container found on the homepage.');
        return;
    }
    renderProjects(latestProjects, projectsContainer, 'h2');

  // 4. Fetch GitHub profile data for your username
    const githubData = await fetchGitHubData('clt005ucsd');  // replace with your username
    console.log('GitHub profile data:', githubData);

  // 5. Render GitHub stats into #profile-stats
    const profileStats = document.querySelector('#profile-stats');
    if (profileStats) {
        profileStats.innerHTML = `
            <dl style="
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 0.5rem 1rem;
            ">
                <dt style="grid-row:1; font-weight:bold;">Public Repos:</dt>
                <dd style="grid-row:2;">${githubData.public_repos}</dd>
                <dt style="grid-row:1; font-weight:bold;">Public Gists:</dt>
                <dd style="grid-row:2;">${githubData.public_gists}</dd>
                <dt style="grid-row:1; font-weight:bold;">Followers:</dt>
                <dd style="grid-row:2;">${githubData.followers}</dd>
                <dt style="grid-row:1; font-weight:bold;">Following:</dt>
                <dd style="grid-row:2;">${githubData.following}</dd>
            </dl>
        `;
    }
})();
