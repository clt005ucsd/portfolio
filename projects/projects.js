import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

let query = '';
let selectedYear = null;
let allProjects = [];

;(async () => {
  // Load project data
  allProjects = await fetchJSON('../lib/projects.json');

  // Update the title with the total count
  const titleEl = document.querySelector('.projects-title');
  if (titleEl) {
    titleEl.textContent = `${allProjects.length} Projects`;
  }

  // Initial render of the full project list
  const projectContainer = document.querySelector('.projects');
  renderProjects(allProjects, projectContainer, 'h2');

  // Hook up the search bar
  const searchInput = document.querySelector('.searchBar');
  searchInput?.addEventListener('input', (e) => {
    query = e.target.value.toLowerCase();
    applyFilters();
  });

  // Draw the initial pie chart for all projects
  renderPieChart(allProjects);
})();

// Re-render list + chart after applying both filters
function applyFilters() {
  let filtered = allProjects.filter((proj) =>
    Object.values(proj)
      .join('\n')
      .toLowerCase()
      .includes(query)
  );

  if (selectedYear) {
    filtered = filtered.filter((proj) => proj.year === selectedYear);
  }

  const projectContainer = document.querySelector('.projects');
  renderProjects(filtered, projectContainer, 'h2');
  renderPieChart(filtered);
}

// Draw (or re-draw) the pie + legend, with interactivity
function renderPieChart(dataProjects) {
  // Roll up by year
  const rolled = d3.rollups(
    dataProjects,
    (v) => v.length,
    (d) => d.year
  );
  const data = rolled.map(([year, count]) => ({ value: count, label: year }));

  // Generators
  const arcGen = d3.arc().innerRadius(0).outerRadius(50);
  const pieGen = d3.pie().value((d) => d.value);
  const pieData = pieGen(data);
  const arcs = pieData.map((d) => arcGen(d));

  // Selectors & color scale
  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

  // Clear previous
  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  // Draw slices
  svg
    .selectAll('path')
    .data(arcs)
    .enter()
    .append('path')
    .attr('d', (d) => d)
    .attr('fill', (_, i) => colorScale(i))
    .attr('cursor', 'pointer')
    .classed('selected', (_, i) => data[i].label === selectedYear)
    .on('click', (_, i) => {
      const year = data[i].label;
      selectedYear = selectedYear === year ? null : year;
      applyFilters();
    });

  // Build legend items
  data.forEach((d, i) => {
    legend
      .append('li')
      .attr('style', `--color:${colorScale(i)}`)
      .classed('selected', d.label === selectedYear)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedYear = selectedYear === d.label ? null : d.label;
        applyFilters();
      });
  });
}