import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

let selectedIndex = -1;   // which slice “sticks” selected
let query = '';           // current search filter

;(async () => {
  // 1) Load & render initial list
  const projects          = await fetchJSON('../lib/projects.json');
  const projectsContainer = document.querySelector('.projects');
  document.querySelector('.projects-title').textContent = `${projects.length} Projects`;

  // 2) Watch the search box (case‐insensitive, real-time)
  const searchInput = document.querySelector('.searchBar');
  searchInput.addEventListener('input', e => {
    query = e.target.value.toLowerCase();
    // just re‐apply your same click logic to filter by BOTH query & selectedIndex
    applySliceAndFilter();
  });

  // 3) Prepare the pie data once
  const rolled = d3.rollups(
    projects,
    v => v.length,
    d => d.year
  );
  const data  = rolled.map(([year, count]) => ({ label: year, value: count }));
  const arcGen  = d3.arc().innerRadius(0).outerRadius(50);
  const pieGen  = d3.pie().value(d => d.value);
  const arcs    = pieGen(data).map(arcGen);
  const svg     = d3.select('#projects-pie-plot');
  const legend  = d3.select('.legend');
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

  // 4) Your existing Step 5.2 slice drawing
  svg.selectAll('path').remove();
  arcs.forEach((arc, i) => {
    const slice = svg.append('path')
      .attr('d', arc)
      .attr('fill', colorScale(i))
      .attr('cursor', 'pointer')
      .classed('selected', false);

    slice.on('click', () => {
      selectedIndex = (selectedIndex === i ? -1 : i);

      svg.selectAll('path')
         .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : null);

      legend.selectAll('li')
            .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : null);

      applySliceAndFilter();
    });
  });

  // 5) Your existing Step 5.2 legend drawing
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
         .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : null);

      legend.selectAll('li')
            .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : null);

      applySliceAndFilter();
    });
  });

  // 6) initial render of list (no query, no slice)
  renderProjects(projects, projectsContainer, 'h2');


  // ------------------------------------------------------
  // Step 5.3: filtering routine that combines search + slice
  // ------------------------------------------------------
  function applySliceAndFilter() {
    // first: text‐filter
    let filtered = projects.filter(p =>
      Object.values(p).join('\n')
        .toLowerCase()
        .includes(query)
    );

    // then: if a slice is selected, filter by that year
    if (selectedIndex !== -1) {
      const year = data[selectedIndex].label;
      filtered = filtered.filter(p => p.year === year);
    }

    renderProjects(filtered, projectsContainer, 'h2');
  }
})();
