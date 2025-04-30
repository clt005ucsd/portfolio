import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

(async () => {
  // — render the project list as before —
  const projects = await fetchJSON('../lib/projects.json');
  // Update the title with the count
  const titleC = document.querySelector('.projects-title');
  if (titleC) {
    titleC.textContent = `${projects.length} Projects`;
  }
  
  const container = document.querySelector('.projects');
  renderProjects(projects, container, 'h2');

  // === Step 1.3: Create an arc generator ===
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

  // === Step 1.4: Manually compute two‐slice pie data ===
  let data = [1, 2];
  // compute total
  const total = data.reduce((sum, v) => sum + v, 0);

  // determine start/end angles
  let angle = 0;
  const arcData = data.map((v) => {
    const startAngle = angle;
    const endAngle = angle + (v / total) * 2 * Math.PI;
    angle = endAngle;
    return { startAngle, endAngle };
  });

  // generate path strings
  const arcs = arcData.map((d) => arcGenerator(d));

  // append them to the SVG
  const svg = d3.select('#projects-pie-plot');
  const colors = ['gold', 'purple'];
  arcs.forEach((pathD, i) => {
    svg.append('path')
       .attr('d', pathD)
       .attr('fill', colors[i]);
  });

  // === Step 1.5: Switch to d3.pie + ordinal color scale ===
  data = [1,2,3,4,5,5];
  const sliceGen = d3.pie();
  const pieData = sliceGen(data);               
  const arcs2 = pieData.map((d) => arcGenerator(d));
  svg.selectAll('path').remove();             

  const colorScale = d3.scaleOrdinal(d3.schemeTableau10);
  arcs2.forEach((pathD, i) => {
    svg.append('path')
       .attr('d', pathD)
       .attr('fill', colorScale(i));
  });
})();