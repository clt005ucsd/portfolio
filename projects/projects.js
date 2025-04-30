import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

// 5.2: selectedIndex tracks which slice is “active”; -1 means none
let selectedIndex = -1;

;(async () => {
  // 1 & 2 & 3 & 4: load projects, render list, prepare pie data
  const projects = await fetchJSON('../lib/projects.json');
  document.querySelector('.projects-title').textContent = `${projects.length} Projects`;
  renderProjects(projects, document.querySelector('.projects'), 'h2');

  const rolled = d3.rollups(
    projects,
    v => v.length,
    d => d.year
  );
  const data = rolled.map(([year, count]) => ({ label: year, value: count }));

  const arcGen = d3.arc().innerRadius(0).outerRadius(50);
  const pieGen = d3.pie().value(d => d.value);
  const arcs = pieGen(data).map(arcGen);

  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

  // Step 5.2: draw slices with inline click handler
  svg.selectAll('path').remove();
  arcs.forEach((arc, i) => {
    const slice = svg.append('path')
      .attr('d', arc)
      .attr('fill', colorScale(i))
      .attr('cursor', 'pointer')
      .classed('selected', false);

    slice.on('click', () => {
      // toggle selection index
      selectedIndex = (selectedIndex === i ? -1 : i);

      // re-apply .selected to slices
      svg.selectAll('path')
         .classed('selected', (_, idx) => idx === selectedIndex);

      // re-apply .selected to legend items
      legend.selectAll('li')
            .classed('selected', (_, idx) => idx === selectedIndex);
    });
  });

  // Step 5.2: build legend items with same click logic
  legend.selectAll('li').remove();
  data.forEach((d, i) => {
    const item = legend.append('li')
      .attr('cursor', 'pointer')
      .attr('style', `--color:${colorScale(i)}`)
      .classed('selected', false)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);

    item.on('click', () => {
      selectedIndex = (selectedIndex === i ? -1 : i);

      svg.selectAll('path')
         .classed('selected', (_, idx) => idx === selectedIndex);

      legend.selectAll('li')
            .classed('selected', (_, idx) => idx === selectedIndex);
    });
  });
})();
