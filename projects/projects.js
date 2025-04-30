import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

// track which slice is active; -1 means “none”
let selectedIndex = -1;

;(async () => {
  // 1. Load projects and render list
  const projects = await fetchJSON('../lib/projects.json');
  document.querySelector('.projects-title').textContent = `${projects.length} Projects`;
  const projectsContainer = document.querySelector('.projects');
  renderProjects(projects, projectsContainer, 'h2');

  // 2. Roll up projects by year
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

  // 5.2: Draw slices with inline click handler
  svg.selectAll('path').remove();
  arcs.forEach((arc, i) => {
    const slice = svg.append('path')
      .attr('d', arc)
      .attr('fill', colorScale(i))
      .attr('cursor', 'pointer')
      .classed('selected', false);

    slice.on('click', () => {
        selectedIndex = (selectedIndex === i ? -1 : i);

        svg
            .selectAll('path')
            .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : null);

        legend
            .selectAll('li')
            .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : null);
        
        if (selectedIndex === -1) {
            renderProjects(projects, projectsContainer, 'h2');
        } else {
            const year = data[selectedIndex].label;
            renderProjects(
                projects.filter(p => p.year === year),
                projectsContainer,
                'h2'
            );
        }
    });
  });

  // 5.2: Build legend items with same click logic
  legend.selectAll('li').remove();
  data.forEach((d, i) => {
    const item = legend.append('li')
        .attr('cursor', 'pointer')
        .attr('style', `--color:${colorScale(i)}`)
        .classed('selected', false)
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);

    item.on('click', () => {
        selectedIndex = (selectedIndex === i ? -1 : i);

        svg
            .selectAll('path')
            .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : null);

        legend
            .selectAll('li')
            .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : null);
        
        if (selectedIndex === -1) {
            renderProjects(projects, projectsContainer, 'h2');
        } else {
            const year = data[selectedIndex].label;
            renderProjects(
                projects.filter(p => p.year === year),
                projectsContainer,
                'h2'
            );
        }
    });
  });
})();
