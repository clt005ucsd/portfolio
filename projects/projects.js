import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

let query = '';
let allProjects = [];

;(async () => {
  // 1) Load all projects
  allProjects = await fetchJSON('../lib/projects.json');

  // 2) Update the title with the total count
  const titleEl = document.querySelector('.projects-title');
  if (titleEl) {
    titleEl.textContent = `${allProjects.length} Projects`;
  }

  // 3) Render the full list initially
  renderProjects(allProjects, document.querySelector('.projects'), 'h2');

  // 4) Wire up the search bar
  document
    .querySelector('.searchBar')
    ?.addEventListener('input', (e) => {
      query = e.target.value.toLowerCase();
      const filtered = allProjects.filter((p) =>
        Object.values(p).join('\n').toLowerCase().includes(query)
      );
      renderProjects(filtered, document.querySelector('.projects'), 'h2');
      // update the pie chart to match search results
      renderPieChart(filtered);
    });

  // 5) Draw the initial pie chart
  renderPieChart(allProjects);
})();

export function renderPieChart(dataProjects) {
  // A) Group by year and count
  const rolled = d3.rollups(
    dataProjects,
    (v) => v.length,
    (d) => d.year
  );
  const data = rolled.map(([year, count]) => ({ label: year, value: count }));

  // B) Arc & pie generators
  const arcGen = d3.arc().innerRadius(0).outerRadius(50);
  const pieGen = d3.pie().value((d) => d.value);
  const pieData = pieGen(data);
  const arcs = pieData.map((d) => arcGen(d));

  // C) Select SVG, legend, and color scale
  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

  // D) Clear any previous drawings
  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  // E) Draw the slices
  svg
    .selectAll('path')
    .data(arcs)
    .enter()
    .append('path')
    .attr('d', (d) => d)
    .attr('fill', (_, i) => colorScale(i));

  // F) Build the legend
  data.forEach((d, i) => {
    legend
      .append('li')
      .attr('style', `--color:${colorScale(i)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}
