import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// 1. Load + parse loc.csv
async function loadData() {
  return d3.csv('loc.csv', row => ({
    ...row,
    line:     +row.line,
    depth:    +row.depth,
    length:   +row.length,
    datetime: new Date(row.datetime),
  }));
}

// 2. Render summary stats
function renderStats(data) {
  const dl = d3.select('#stats')
    .append('dl')
    .attr('class', 'stats');

  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  const numFiles = d3.group(data, d => d.file).size;
  dl.append('dt').text('Number of files');
  dl.append('dd').text(numFiles);

  const maxLineLen = d3.max(data, d => d.length);
  const avgLineLen = d3.mean(data, d => d.length).toFixed(1);
  dl.append('dt').text('Longest line (chars)');
  dl.append('dd').text(maxLineLen);
  dl.append('dt').text('Average line (chars)');
  dl.append('dd').text(avgLineLen);

  const maxDepth = d3.max(data, d => d.depth);
  const avgDepth = d3.mean(data, d => d.depth).toFixed(1);
  dl.append('dt').text('Maximum nesting depth');
  dl.append('dd').text(maxDepth);
  dl.append('dt').text('Average nesting depth');
  dl.append('dd').text(avgDepth);

  const fileLengths = d3.rollups(
    data,
    v => d3.max(v, d => d.line),
    d => d.file
  );
  const avgFileLength = d3.mean(fileLengths, ([, len]) => len).toFixed(1);
  dl.append('dt').text('Average file length (lines)');
  dl.append('dd').text(avgFileLength);

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

  const days = d3.rollups(
    data,
    v => v.length,
    d => ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.datetime.getDay()]
  );
  const busiestDay = d3.greatest(days, d => d[1])?.[0];
  dl.append('dt').text('Busiest weekday');
  dl.append('dd').text(busiestDay);
}

// 3. Process commits, hiding the raw lines array
function processCommits(data) {
  return d3.groups(data, d => d.commit).map(([id, lines]) => {
    const first = lines[0];
    const commit = {
      id,
      url: `https://github.com/YOUR_REPO/commit/${id}`,
      author:     first.author,
      datetime:   first.datetime,
      hourFrac:   first.datetime.getHours() + first.datetime.getMinutes()/60,
      totalLines: lines.length
    };
    // Hide the lines array for later breakdown
    Object.defineProperty(commit, 'lines', {
      value: lines,
      enumerable: false,
      writable:   false
    });
    return commit;
  });
}

// 4. Tooltip helpers
function renderTooltipContent(c) {
  if (!c) return;
  document.getElementById('commit-link').href        = c.url;
  document.getElementById('commit-link').textContent  = c.id;
  document.getElementById('commit-date').textContent  = c.datetime.toLocaleDateString();
  document.getElementById('commit-time').textContent  = c.datetime.toLocaleTimeString();
  document.getElementById('commit-author').textContent= c.author;
  document.getElementById('commit-lines').textContent = c.totalLines;
}
function updateTooltipVisibility(vis) {
  document.getElementById('commit-tooltip').hidden = !vis;
}
function updateTooltipPosition(evt) {
  const tt = document.getElementById('commit-tooltip');
  tt.style.left = `${evt.clientX + 10}px`;
  tt.style.top  = `${evt.clientY + 10}px`;
}

// 5. Scatter + brushing
function renderScatterPlot(data, commits) {
  const width  = 1000, height = 600;
  const margin = { top:10, right:10, bottom:30, left:40 };
  const usable = {
    left:   margin.left,
    right:  width - margin.right,
    top:    margin.top,
    bottom: height - margin.bottom,
    width:  width - margin.left - margin.right,
    height: height - margin.top  - margin.bottom
  };

  // Scales
  const xScale = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([usable.left, usable.right]).nice();
  const yScale = d3.scaleLinear()
    .domain([0,24]).range([usable.bottom, usable.top]);

  // Radius scale (sqrt for area perceptual accuracy)
  const [minL, maxL] = d3.extent(commits, d => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minL, maxL]).range([2,30]);

  // SVG
  const svg = d3.select('#chart')
    .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('overflow','visible');

  // Gridlines
  svg.append('g')
    .attr('class','gridlines')
    .attr('transform',`translate(${usable.left},0)`)
    .call(d3.axisLeft(yScale).tickFormat('').tickSize(-usable.width));

  // Axes
  svg.append('g')
    .attr('transform',`translate(0,${usable.bottom})`)
    .call(d3.axisBottom(xScale));
  svg.append('g')
    .attr('transform',`translate(${usable.left},0)`)
    .call(d3.axisLeft(yScale).tickFormat(d => String(d%24).padStart(2,'0') + ':00'));

  // Brushing
  const brush = d3.brush()
    .extent([[usable.left, usable.top], [usable.right, usable.bottom]])
    .on('start brush end', brushed);
  svg.call(brush);
  // Bring dots & axes above overlay
  svg.selectAll('.dots, .overlay ~ *').raise();

  // Draw dots (sorted so small ones stay on top)
  const sorted = [...commits].sort((a,b) => d3.descending(a.totalLines,b.totalLines));
  const dots = svg.append('g').attr('class','dots')
    .selectAll('circle')
    .data(sorted)
    .join('circle')
      .attr('cx', d => xScale(d.datetime))
      .attr('cy', d => yScale(d.hourFrac))
      .attr('r',  d => rScale(d.totalLines))
      .attr('fill','steelblue')
      .style('fill-opacity',0.7)
      .on('mouseenter', (evt,d) => {
        d3.select(evt.currentTarget).style('fill-opacity',1);
        renderTooltipContent(d);
        updateTooltipPosition(evt);
        updateTooltipVisibility(true);
      })
      .on('mouseleave', (evt) => {
        d3.select(evt.currentTarget).style('fill-opacity',0.7);
        updateTooltipVisibility(false);
      });

  // Helper to test if a commit is inside the brush
  function isSelected(sel, d) {
    if (!sel) return false;
    const [[x0,y0],[x1,y1]] = sel;
    const cx = xScale(d.datetime), cy = yScale(d.hourFrac);
    return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
  }

  // Update selection count text
  function renderSelectionCount(sel) {
    const chosen = sel ? commits.filter(d => isSelected(sel,d)) : [];
    const cnt = chosen.length;
    document.getElementById('selection-count').textContent =
      cnt ? `${cnt} commits selected` : 'No commits selected';
  }

  // Render language breakdown in the bottom <dl>
  function renderLanguageBreakdown(sel) {
    const chosen = sel ? commits.filter(d => isSelected(sel,d)) : [];
    const lines = [...(chosen.length ? chosen : commits)]
      .flatMap(d => d.lines);
    const breakdown = d3.rollup(lines, v => v.length, d => d.type);
    const dl = document.getElementById('language-breakdown');
    dl.innerHTML = '';
    for (const [lang, count] of breakdown) {
      const prop = d3.format('.1~%')(count/lines.length);
      dl.innerHTML += `<dt>${lang}</dt><dd>${count} lines (${prop})</dd>`;
    }
  }

  // Brush event handler
  function brushed({selection}) {
    dots.classed('selected', d => isSelected(selection,d));
    renderSelectionCount(selection);
    renderLanguageBreakdown(selection);
  }
}

(async () => {
  const data    = await loadData();
  const commits = processCommits(data);
  renderStats(data);
  renderScatterPlot(data, commits);
})();
