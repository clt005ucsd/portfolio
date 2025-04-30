import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

(async () => {
  // — render the project list as before —
  const projects = await fetchJSON('../lib/projects.json');
  const container = document.querySelector('.projects');
  renderProjects(projects, container, 'h2');

  // — Step 1.3: Draw a static pie chart of two slices —

  // 1. Create an arc generator for radius 50
  const arcGen = d3.arc().innerRadius(0).outerRadius(50);

  // 2. Example data [1,2]; use d3.pie() to compute angles
  const sliceGen = d3.pie();
  let data = [1, 2];
  let arcs = sliceGen(data).map(d => arcGen(d));

  // 3. Append two <path> elements to the SVG
  const svg = d3.select('#projects-pie-plot');
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

  svg
    .selectAll('path')
    .data(arcs)
    .enter()
    .append('path')
    .attr('d', d => d)
    .attr('fill', (_, i) => colorScale(i));

  // — Step 1.5: switch to more data dynamically & color scale —
    data = [1,2,3,4,5,5];
    arcs = sliceGen(data).map(d => arcGen(d));
    svg.selectAll('path').remove();
    svg
        .selectAll('path')
        .data(arcs)
        .enter()
        .append('path')
        .attr('d', d => d)
        .attr('fill', (_, i) => colorScale(i));
})();