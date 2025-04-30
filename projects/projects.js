import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

// State for search query
let query = '';

(async () => {
  // Fetch full project data
  const projects = await fetchJSON('../lib/projects.json');

  // Update the page title with project count
  const titleEl = document.querySelector('.projects-title');
  if (titleEl) titleEl.textContent = `${projects.length} Projects`;

  // Render the initial full project list
  const projectContainer = document.querySelector('.projects');
  renderProjects(projects, projectContainer, 'h2');

  // Render initial pie chart for all projects
  renderPieChart(projects);

  // Set up search input listener
  const searchInput = document.querySelector('.searchBar');
  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      query = event.target.value.trim();
      // Filter projects by any metadata, case-insensitive
      const filtered = projects.filter((proj) => {
        const text = Object.values(proj).join('\n').toLowerCase();
        return text.includes(query.toLowerCase());
      });
      // Re-render projects list and pie chart
      renderProjects(filtered, projectContainer, 'h2');
      renderPieChart(filtered);
    });
  }

  //----------------------------------
  // Function: renderPieChart
  //----------------------------------
  function renderPieChart(dataProjects) {
    // 1. Group by year and count
    const rolled = d3.rollups(
      dataProjects,
      (v) => v.length,
      (d) => d.year
    );
    const data = rolled.map(([year, count]) => ({ value: count, label: year }));

    // 2. Arc and pie generators
    const arcGen = d3.arc().innerRadius(0).outerRadius(50);
    const pieGen = d3.pie().value((d) => d.value);
    const pieData = pieGen(data);
    const arcs = pieData.map((d) => arcGen(d));

    // 3. Select SVG and legend elements
    const svg = d3.select('#projects-pie-plot');
    const legend = d3.select('.legend');
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    // 4. Clear previous chart and legend
    svg.selectAll('path').remove();
    legend.selectAll('li').remove();

    // 5. Draw pie slices
    svg.selectAll('path')
      .data(arcs)
      .enter()
      .append('path')
      .attr('d', (d) => d)
      .attr('fill', (_, i) => colorScale(i));

    // 6. Build legend items
    data.forEach((d, i) => {
      legend.append('li')
        .attr('style', `--color:${colorScale(i)}`)
        .html(`<span class=\"swatch\"></span> ${d.label} <em>(${d.value})</em>`);
    });
  }
})();
