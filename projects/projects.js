import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

(async () => {
  // 1. Load and render project list
  const projects = await fetchJSON('../lib/projects.json');
  document.querySelector('.projects-title').textContent = `${projects.length} Projects`;
  renderProjects(projects, document.querySelector('.projects'), 'h2');

  // 2. Draw static pie chart
  //    Group by year
  const rolled = d3.rollups(
    projects,
    v => v.length,
    d => d.year
  );
  const data = rolled.map(([year, count]) => ({ label: year, value: count }));

  //    Arc + pie generators
  const arcGen = d3.arc().innerRadius(0).outerRadius(50);
  const pieGen = d3.pie().value(d => d.value);
  const arcs = pieGen(data).map(d => arcGen(d));

  //    Select SVG and legend
  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

  //    Clear old
  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  //    Draw slices
  svg.selectAll('path')
    .data(arcs)
    .enter()
    .append('path')
      .attr('d', d => d)
      .attr('fill', (_, i) => colorScale(i));

  //    Build legend
  data.forEach((d, i) => {
    legend.append('li')
      .attr('style', `--color:${colorScale(i)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
})();
