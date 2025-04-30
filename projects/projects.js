import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

let query = '';
let selectedYear = null;
let allProjects = [];

;(async () => {
  // 1. Load project data
  allProjects = await fetchJSON('../lib/projects.json');

  // 2. Update the title with the total count
  const titleEl = document.querySelector('.projects-title');
  if (titleEl) {
    titleEl.textContent = `${allProjects.length} Projects`;
  }

  // 3. Render the full list once
  const projectContainer = document.querySelector('.projects');
  renderProjects(allProjects, projectContainer, 'h2');

  // 4. Wire up the search bar
  const searchInput = document.querySelector('.searchBar');
  searchInput?.addEventListener('input', (e) => {
    query = e.target.value.toLowerCase();
    applyFilters();
  });

  // 5. Draw the initial pie
  renderPieChart(allProjects);
})();

// Re-filter by search + selected year, then re-draw
function applyFilters() {
  let filtered = allProjects.filter((p) =>
    Object.values(p).join('\n').toLowerCase().includes(query)
  );

  if (selectedYear) {
    filtered = filtered.filter((p) => p.year === selectedYear);
  }

  const projectContainer = document.querySelector('.projects');
  renderProjects(filtered, projectContainer, 'h2');
  renderPieChart(filtered);
}

// Draw (or re-draw) pie + legend
function renderPieChart(dataProjects) {
  // A. roll up counts per year
  const rolled = d3.rollups(
    dataProjects,
    (v) => v.length,
    (d) => d.year
  );
  const data = rolled.map(([year, count]) => ({ label: year, value: count }));

  // B. arc + pie generators
  const arcGen = d3.arc().innerRadius(0).outerRadius(50);
  const pieGen = d3.pie().value((d) => d.value);
  const pieData = pieGen(data);
  const arcs = pieData.map((d) => arcGen(d));

  // C. select SVG + legend UL + colors
  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

  // D. clear old
  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  // E. draw slices
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
      const yr = data[i].label;
      selectedYear = selectedYear === yr ? null : yr;
      applyFilters();
    });

  // F. draw legend
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
