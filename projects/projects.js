import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

let query = '';
let selectedIndex = -1;
let allProjects = [];

;(async () => {
  // 1. Load project data
  allProjects = await fetchJSON('../lib/projects.json');

  // 2. Update title count
  const titleEl = document.querySelector('.projects-title');
  if (titleEl) {
    titleEl.textContent = `${allProjects.length} Projects`;
  }

  // 3. Initial render of the full project list
  const projectContainer = document.querySelector('.projects');
  renderProjects(allProjects, projectContainer, 'h2');

  // 4. Hook up the search bar
  const searchInput = document.querySelector('.searchBar');
  searchInput?.addEventListener('input', (e) => {
    query = e.target.value.toLowerCase();
    applyFilters();
  });

  // 5. Initial pie chart
  renderPieChart(allProjects);
})();

// Re-filter by search + selected slice, then re-draw both list and chart
function applyFilters() {
  let filtered = allProjects.filter((p) =>
    Object.values(p).join('\n').toLowerCase().includes(query)
  );

  // If a slice is selected, further filter by its year label
  if (selectedIndex !== -1 && window._pieLabels) {
    const selYear = window._pieLabels[selectedIndex];
    filtered = filtered.filter((p) => p.year === selYear);
  }

  renderProjects(filtered, document.querySelector('.projects'), 'h2');
  renderPieChart(filtered);
}

// Draw (or re-draw) pie + legend with slice‐click and legend‐click interactivity
function renderPieChart(dataProjects) {
  // A) roll up counts per year
  const rolled = d3.rollups(
    dataProjects,
    (v) => v.length,
    (d) => d.year
  );
  // keep labels for lookup when filtering
  window._pieLabels = rolled.map(([year]) => year);

  const data = rolled.map(([year, count]) => ({ label: year, value: count }));

  // B) arc + pie generators
  const arcGen = d3.arc().innerRadius(0).outerRadius(50);
  const pieGen = d3.pie().value((d) => d.value);
  const pieData = pieGen(data);
  const arcs = pieData.map((d) => arcGen(d));

  // C) select elements & color scale
  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

  // D) clear old
  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  // E) draw slices with click handlers
  svg
    .selectAll('path')
    .data(arcs)
    .enter()
    .append('path')
    .attr('d', (d) => d)
    .attr('fill', (_, i) => colorScale(i))
    .attr('cursor', 'pointer')
    .classed('selected', (_, i) => i === selectedIndex)
    .on('click', (_, i) => {
      selectedIndex = selectedIndex === i ? -1 : i;
      // update highlighting
      svg.selectAll('path').classed('selected', (_, idx) => idx === selectedIndex);
      legend.selectAll('li').classed('selected', (_, idx) => idx === selectedIndex);
      applyFilters();
    });

  // F) build legend with matching click handlers
  data.forEach((d, i) => {
    legend
      .append('li')
      .attr('style', `--color:${colorScale(i)}`)
      .classed('selected', i === selectedIndex)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;
        svg.selectAll('path').classed('selected', (_, idx) => idx === selectedIndex);
        legend.selectAll('li').classed('selected', (_, idx) => idx === selectedIndex);
        applyFilters();
      });
  });
}
