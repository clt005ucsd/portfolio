// meta/main.js
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  // Parse numbers and dates
  return await d3.csv('loc.csv', row => ({
    ...row,
    line:     +row.line,
    depth:    +row.depth,
    length:   +row.length,
    datetime: new Date(row.datetime),
  }));
}

function renderStats(data) {
  const dl = d3.select('#stats')
    .append('dl')
    .attr('class', 'stats');

  // 1. Total LOC
  dl.append('dt')
    .html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd')
    .text(data.length);

  // 2. Number of files (distinct file names)
  const numFiles = d3.group(data, d => d.file).size;
  dl.append('dt').text('Number of files');
  dl.append('dd').text(numFiles);

  // 3. Longest line length & average line length
  const maxLineLen = d3.max(data, d => d.length);
  const avgLineLen = d3.mean(data, d => d.length).toFixed(1);
  dl.append('dt').text('Longest line (chars)');
  dl.append('dd').text(maxLineLen);
  dl.append('dt').text('Average line (chars)');
  dl.append('dd').text(avgLineLen);

  // 4. Maximum nesting depth & average depth
  const maxDepth = d3.max(data, d => d.depth);
  const avgDepth = d3.mean(data, d => d.depth).toFixed(1);
  dl.append('dt').text('Maximum nesting depth');
  dl.append('dd').text(maxDepth);
  dl.append('dt').text('Average nesting depth');
  dl.append('dd').text(avgDepth);

  // 5. Average file length (in lines)
  //    -- first find each file’s max line number
  const fileLengths = d3.rollups(
    data,
    v => d3.max(v, d => d.line),
    d => d.file
  );
  const avgFileLength = d3.mean(fileLengths, ([, len]) => len).toFixed(1);
  dl.append('dt').text('Average file length (lines)');
  dl.append('dd').text(avgFileLength);

  // 6. Busiest period of day
  const periods = d3.rollups(
    data,
    v => v.length,
    d => {
      const h = d.datetime.getHours();
      if (h < 6)  return 'Night';
      if (h < 12) return 'Morning';
      if (h < 18) return 'Afternoon';
      return 'Evening';
    }
  );
  const busiestPeriod = d3.greatest(periods, d => d[1])?.[0];
  dl.append('dt').text('Busiest period');
  dl.append('dd').text(busiestPeriod);

  // 7. Busiest day of week
  const days = d3.rollups(
    data,
    v => v.length,
    d => ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.datetime.getDay()]
  );
  const busiestDay = d3.greatest(days, d => d[1])?.[0];
  dl.append('dt').text('Busiest weekday');
  dl.append('dd').text(busiestDay);
}

function processCommits(data) {
    // group by commit
    return d3.groups(data, d => d.commit).map(([id, lines]) => {
      const first = lines[0];
      return {
        id,
        author:    first.author,
        datetime:  first.datetime,
        hourFrac:  first.datetime.getHours() + first.datetime.getMinutes() / 60,
        totalLines: lines.length,
        // …you can hide lines via defineProperty if you like…
      };
    });
  }
  
  function renderScatterPlot(data, commits) {
    // 2.1 Dimensions + margins
    const width  = 1000;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 30, left: 40 };
  
    const usable = {
      left:   margin.left,
      right:  width  - margin.right,
      top:    margin.top,
      bottom: height - margin.bottom,
      width:  width  - margin.left - margin.right,
      height: height - margin.top  - margin.bottom,
    };
  
    // 2.1 Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(commits, d => d.datetime))
      .range([usable.left, usable.right])
      .nice();
  
    const yScale = d3.scaleLinear()
      .domain([0, 24])
      .range([usable.bottom, usable.top]);
  
    // 2.1 Create SVG
    const svg = d3.select('#chart')
      .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');
  
    // 2.3 Gridlines (horizontal)
    svg.append('g')
      .attr('class', 'gridlines')
      .attr('transform', `translate(${usable.left},0)`)
      .call(
        d3.axisLeft(yScale)
          .tickFormat('')
          .tickSize(-usable.width)
      );
    
    svg.selectAll('.gridlines .tick line')
      .attr('stroke', d => (d < 6 || d >= 18) ? 'steelblue' : 'orange');
  
    // 2.2 Axes
    svg.append('g')
      .attr('transform', `translate(0,${usable.bottom})`)
      .call(d3.axisBottom(xScale));
  
    svg.append('g')
      .attr('transform', `translate(${usable.left},0)`)
      .call(
        d3.axisLeft(yScale)
          .tickFormat(d => String(d % 24).padStart(2, '0') + ':00')
      );
  
    // 2.1 & 2.2 Dots
    svg.append('g')
      .attr('class', 'dots')
      .selectAll('circle')
      .data(commits)
      .join('circle')
        .attr('cx', d => xScale(d.datetime))
        .attr('cy', d => yScale(d.hourFrac))
        .attr('r', 4)
        .attr('fill', 'steelblue');
  }
  
  (async () => {
    const data    = await loadData();
    const commits = processCommits(data);
    renderStats(data, commits);
    renderScatterPlot(data, commits);
  })();
