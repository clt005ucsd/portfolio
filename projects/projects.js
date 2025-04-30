import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

(async () => {
  // Fetch and render project list
  const projects = await fetchJSON('../lib/projects.json');

  // Update the title with the count
  const titleEl = document.querySelector('.projects-title');
  if (titleEl) {
    titleEl.textContent = `${projects.length} Projects`;
  }

  const container = document.querySelector('.projects');
  renderProjects(projects, container, 'h2');

  // === Step 1: Arc generator for radius 50 ===
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

  // === Step 2.1: Prepare data with labels ===
  const data = projects.map(p => ({ value: 1, label: p.title }));

  // === Step 2.1: Slice generator using value accessor ===
  const sliceGenerator = d3.pie().value(d => d.value);
  const pieData = sliceGenerator(data);
  const arcs = pieData.map(d => arcGenerator(d));

  // Select SVG and set up color scale
  const svg = d3.select('#projects-pie-plot');
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

  // Draw pie slices
  svg.selectAll('path')
    .data(arcs)
    .enter()
    .append('path')
    .attr('d', d => d)
    .attr('fill', (_, i) => colorScale(i));

  // === Step 2.2: Build legend ===
  const legend = d3.select('.legend');
  data.forEach((d, i) => {
    legend.append('li')
      .attr('style', `--color:${colorScale(i)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
})();
