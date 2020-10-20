async function drawLineChart() {
  const dataset = await d3
    .json(
      'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json'
    )
    .then((res) => res.data)

  // 'timeParse' takes string specifying a date format and parses that format
  const dateParser = d3.timeParse('%Y-%m-%d')

  // takes a data point and returns the GDP
  const yAccessor = (d) => d[1]
  // takes a data point and returns the date
  const xAccessor = (d) => dateParser(d[0])

  // draw chart
  let dimensions = {
    width: window.innerWidth * 0.9,
    height: 500,
    barPadding: 2,
    margin: {
      top: 15,
      right: 15,
      bottom: 60,
      left: 90,
    },
  }

  // compute bounds dimensions by subtracting margins
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom
  dimensions.barWidth = dimensions.boundedWidth / dataset.length

  d3.select('#wrapper')
    .append('h1')
    .attr('id', 'title')
    .text('Federal Reserve Economic Data')
  // select wrapper element and append svg, set wrapper width/height to svg
  const wrapper = d3
    .select('#wrapper')
    .append('svg')
    .attr('class', 'wrapper')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height)

  const bounds = wrapper
    .append('g')
    .attr('class', 'bounds')
    .style(
      'transform',
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    )

  // append container for bins
  bounds.append('g').attr('class', 'bins')

  // find max value for y axis
  const yMax = d3.max(dataset.map(yAccessor))

  // create scale for y axis - get min & max values and pixel range
  const yScale = d3
    .scaleLinear()
    .domain([0, yMax])
    .range([dimensions.boundedHeight, 0])

  // create scale for x axis - get min & max values and pixel range
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth])

  // create one <g> for each item in bins array
  let binGroups = bounds
    .select('.bins')
    .selectAll('.bin')
    .data(dataset)
    .enter()
    .append('g')
    .attr('class', 'bin')

  // append <rect> to each <g> and set position/size placement in bounded area
  const barRects = binGroups
    .append('rect')
    .attr('class', 'bar')
    .attr('data-date', (d) => d[0])
    .attr('data-gdp', (d) => d[1])
    .attr('x', (d, i) => i * dimensions.barWidth + dimensions.barPadding)
    .attr('y', (d) => yScale(yAccessor(d)))
    .attr('data-x', (d, i) => i * dimensions.barWidth + dimensions.barPadding)
    .attr('data-y', (d) => yScale(yAccessor(d)))
    .attr('width', dimensions.barWidth)
    .attr('height', (d) => dimensions.boundedHeight - yScale(yAccessor(d)))
    .attr('fill', '#ffffff')

  binGroups
    .select('rect')
    .on('mouseenter', (e, d) => onMouseEnter(e, d))
    .on('mouseleave', onMouseLeave)

  const tooltip = d3.select('#tooltip')
  function onMouseEnter(e, datum) {
    // set opacity
    tooltip.style('opacity', 1)
    // add date data
    tooltip
      .select('#date')
      .text(formatDate(xAccessor(datum)))
      .attr('data-date', datum[0])

    // add gdp data
    tooltip
      .select('#gdp')
      .text(`${Math.round(yAccessor(datum))} billion dollars`)

    const x =
      parseInt(e.target.dataset.x) +
      dimensions.barWidth / 2 +
      dimensions.margin.left
    const y = parseInt(e.target.dataset.y) + dimensions.margin.top

    console.log('bon bon', y)
    tooltip.style(
      'transform',
      `translate(calc(${x - dimensions.barWidth}px), calc(15px + ${y}px))`
    )
  }

  function onMouseLeave() {
    tooltip.style('opacity', 0)
  }
  // create y axis generator and pass it our y scale
  const yAxisGenerator = d3.axisLeft().scale(yScale)

  // create <g> element to hold left axis and call yAxisGenerator
  const yAxis = bounds
    .append('g')
    .attr('class', 'y-axis')
    .call(yAxisGenerator)
    .append('text')
    .attr('font-size', '1rem')
    .attr('fill', '#e0e2fc')
    .attr('letter-spacing', '2px')
    .text('GDP, IN BILLIONS')
    .style('transform', `rotate(270deg) translate(-9%, -12%)`)

  // create x axis generator and pass it our x scale
  const xAxisGenerator = d3.axisBottom().scale(xScale)

  // create <g> element to hold bottom axis and call xAxisGenerator
  const xAxis = bounds
    .append('g')
    .attr('class', 'x-axis')
    .call(xAxisGenerator)
    .style('transform', `translate(0, ${dimensions.boundedHeight}px)`)
    .append('text')
    .attr('font-size', '1rem')
    .attr('fill', '#e0e2fc')
    .attr('letter-spacing', '2px')
    .text('YEAR')
    .style('transform', `translate(47%, 45px)`)
}

drawLineChart()

function formatDate(inputDate) {
  var date = new Date(inputDate)
  if (!isNaN(date.getTime())) {
    // Months use 0 index.
    return date.getMonth() + 1 + '-' + date.getDate() + '-' + date.getFullYear()
  }
}
