import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

// Step 5.2: track which slice (if any) is selected
let selectedIndex = -1;

;(async () => {
  // 1. Load and render project list
  const projects = await fetchJSON('../lib/projects.json');
  document.querySelector('.projects-title').textContent = `${projects.length} Projects`;
  renderProjects(projects, document.querySelector('.projects'), 'h2');

  // 2. Compute the pie data
  const rolled = d3.rollups(
    projects,
    v => v.length,
    d => d.year
  );
  const data = rolled.map(([year, count]) => ({ label: year, value: count }));

  // 3. Arc + pie generators
  const arcGen = d3.arc().innerRadius(0).outerRadius(50);
  const pieGen = d3.pie().value(d => d.value);
  const arcs = pieGen(data).map(d => arcGen(d));

  // 4. Select SVG & legend
  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

  // 5. Clear old
  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  // 6. Draw slices with click‐to‐select behavior
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
        // update slice highlight
        svg.selectAll('path').classed('selected', (_, idx) => idx === selectedIndex);
        // update legend highlight
        legend.selectAll('li').classed('selected', (_, idx) => idx === selectedIndex);
      });

  // 7. Build legend entries with the same click behavior
  data.forEach((d, i) => {
    legend.append('li')
      .attr('style', `--color:${colorScale(i)}`)
      .classed('selected', i === selectedIndex)
      .attr('cursor', 'pointer')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedIndex = (selectedIndex === i ? -1 : i);
        svg.selectAll('path').classed('selected', (_, idx) => idx === selectedIndex);
        legend.selectAll('li').classed('selected', (_, idx) => idx === selectedIndex);
      });
  });
})();
