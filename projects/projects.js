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

  // Render the detailed project list
  const container = document.querySelector('.projects');
  renderProjects(projects, container, 'h2');

  // Prepare data for pie chart: projects per year
  // Use d3.rollups to group by year and count
  const rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year
  );
  // Map to objects with label & value
  const data = rolledData.map(([year, count]) => ({
    value: count,
    label: year,
  }));

  // Arc generator for radius 50
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

  // Create a pie layout with our data values
  const sliceGenerator = d3.pie().value(d => d.value);
  const pieData = sliceGenerator(data);
  const arcs = pieData.map(d => arcGenerator(d));

  // Draw the pie slices
  const svg = d3.select('#projects-pie-plot');
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10);
  svg.selectAll('path')
    .data(arcs)
    .enter()
    .append('path')
    .attr('d', (d) => d)
    .attr('fill', (_, i) => colorScale(i));

  // Build the legend
  const legend = d3.select('.legend');
  data.forEach((d, i) => {
    legend.append('li')
      .attr('style', `--color:${colorScale(i)}`)
      .html(`<span class=\"swatch\"></span> ${d.label} <em>(${d.value})</em>`);
  });
})();
