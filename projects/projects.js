import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

let query = '';
let selectedIndex = -1;
let allProjects = [];

;(async () => {
  // 1. Load data
  allProjects = await fetchJSON('../lib/projects.json');

  // 2. Update title
  const titleEl = document.querySelector('.projects-title');
  if (titleEl) {
    titleEl.textContent = `${allProjects.length} Projects`;
  }

  // 3. Initial render of full list
  renderProjects(allProjects, document.querySelector('.projects'), 'h2');

  // 4. Wire up search
  document
    .querySelector('.searchBar')
    ?.addEventListener('input', (e) => {
      query = e.target.value.toLowerCase();
      applyFilters();
    });

  // 5. Draw initial pie
  renderPieChart(allProjects);
})();

function applyFilters() {
  // A) search-filter
  let filtered = allProjects.filter((p) =>
    Object.values(p).join('\n').toLowerCase().includes(query)
  );

  // B) year-filter if a slice is selected
  if (selectedIndex !== -1 && window._pieLabels) {
    const selYear = window._pieLabels[selectedIndex];
    filtered = filtered.filter((p) => p.year === selYear);
  }

  // C) render list + pie
  renderProjects(filtered, document.querySelector('.projects'), 'h2');
  renderPieChart(filtered);
}

function renderPieChart(dataProjects) {
  // A) roll up counts per year
  const rolled = d3.rollups(
    dataProjects,
    (v) => v.length,
    (d) => d.year
  );
  window._pieLabels = rolled.map(([y]) => y);
  const data = rolled.map(([y, c]) => ({ label: y, value: c }));

  // B) arc + pie generators
  const arcGen = d3.arc().innerRadius(0).outerRadius(50);
  const pieGen = d3.pie().value((d) => d.value);
  const arcs = pieGen(data).map((d) => arcGen(d));

  // C) select DOM & colors
  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

  // D) clear old
  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  // E) draw slices
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
      svg.selectAll('path').classed('selected', (_, idx) => idx === selectedIndex);
      legend.selectAll('li').classed('selected', (_, idx) => idx === selectedIndex);
      applyFilters();
    });

  // F) build legend
  data.forEach((d, i) => {
    legend
      .append('li')
      .attr('style', `--color:${colorScale(i)}`)
      .classed('selected', i === selectedIndex)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .attr('cursor', 'pointer')
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;
        svg.selectAll('path').classed('selected', (_, idx) => idx === selectedIndex);
        legend.selectAll('li').classed('selected', (_, idx) => idx === selectedIndex);
        applyFilters();
      });
  });
}
