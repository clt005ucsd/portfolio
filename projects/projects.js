import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

// track which slice is selected; -1 means “none”
let selectedIndex = -1;

;(async () => {
  // 1. Load and render full project list
  const projects = await fetchJSON('../lib/projects.json');
  document.querySelector('.projects-title').textContent = `${projects.length} Projects`;
  renderProjects(projects, document.querySelector('.projects'), 'h2');

  // 2. Prepare the pie data: roll up by year
  const rolled = d3.rollups(
    projects,
    v => v.length,
    d => d.year
  );
  const data = rolled.map(([year, count]) => ({ label: year, value: count }));

  // 3. Create arc + pie generators
  const arcGen = d3.arc().innerRadius(0).outerRadius(50);
  const pieGen = d3.pie().value(d => d.value);
  const arcs = pieGen(data).map(arcGen);

  // 4. Grab our SVG & legend containers
  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

  // 5. A single draw() that re-renders slices & legend based on selectedIndex
  function draw() {
    // clear previous
    svg.selectAll('path').remove();
    legend.selectAll('li').remove();

    // draw slices
    svg.selectAll('path')
      .data(arcs)
      .enter()
      .append('path')
        .attr('d', d => d)
        .attr('fill', (_, i) => colorScale(i))
        .attr('cursor', 'pointer')
        .classed('selected', (_, i) => i === selectedIndex)
        .on('click', (_, i) => {
          // toggle selection
          selectedIndex = (selectedIndex === i ? -1 : i);
          draw(); // re-render everything
        });

    // draw legend
    data.forEach((d, i) => {
      legend.append('li')
        .classed('selected', i === selectedIndex)
        .attr('cursor', 'pointer')
        .attr('style', `--color:${colorScale(i)}`)
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
        .on('click', () => {
          selectedIndex = (selectedIndex === i ? -1 : i);
          draw();
        });
    });
  }

  // initial paint
  draw();
})();
