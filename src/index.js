import { select } from 'd3-selection'
import { scaleLinear } from 'd3-scale'

let svgBBox = window.getComputedStyle(document.getElementById('game'))
let windowWidth = parseFloat(svgBBox.getPropertyValue("width"))
let windowHeight = parseFloat(svgBBox.getPropertyValue("height"))

let msTimestep = 100

let columns = windowWidth / 35
let rows = windowHeight / 30

const xDomain = [0, columns]
const yDomain = [0, rows]

// Scales
const xScale = scaleLinear()
  .domain(xDomain)
  .range([0, windowWidth])

const yScale = scaleLinear()
  .domain(yDomain)
  .range([0, windowHeight])

const svg = select('svg')

let field = randomField()

function iterate() {
  field = createNewGeneration(field)
  render(field)
}

render(field)
let iteration = setInterval(iterate, msTimestep)

function render(data) {
  const hexPath = 'M37.321,10L20,0L2.679,10v20L20,40l17.321-10V10z'
  const row = svg.selectAll('#row')
    .data(data)

  row.enter()
    .append('g')
    .attr('id', 'row')

  row.attr('transform', (d, i) =>
    ((i % 2) === 1) ? 'translate(-17, 0)' : null
  )

  const hexUpdate = row.selectAll('#hex')
    .data(d => d)

  const hexEnter = hexUpdate.enter()

  hexEnter
    .append('path')
    .attr('id', 'hex')
    .attr('d', hexPath)
    .attr('transform', (d) =>
      'translate(' + (xScale(d.x) - 10) + ', ' + (yScale(d.y) - 10) + ')'
    )

  hexUpdate
    .classed('on', (d) => d.state === 1)
    .classed('three-neighbours', (d) => d.liveNeighbours === 3)
    .classed('four-neighbours', (d) => d.liveNeighbours === 4)
    .classed('five-neighbours', (d) => d.liveNeighbours === 5)
    .classed('six-neighbours', (d) => d.liveNeighbours === 6)
}

function randomField() {
  return Array(Math.ceil(rows)).fill().map((r, i) =>
    Array(Math.ceil(columns)).fill().map((c, j) => (
      {
        x     : j,
        y     : i,
        state : Math.random() < 0.3 ? 1 : 0,
      }
    ))
  )
}

function reset() {
  windowWidth = parseFloat(svgBBox.getPropertyValue("width"))
  windowHeight = parseFloat(svgBBox.getPropertyValue("height"))
  columns = windowWidth / 35
  rows = windowHeight / 30
  field = randomField()
}

function createNewGeneration(states) {
  const nextGen = []
  const ccx = states.length
  states.forEach((row, x) => {
    const ccy = row.length
    nextGen[x] = []
    row.forEach((column, y) => {
      const t = y - 1 < 0 ? ccy - 1 : y - 1 // top index
      const r = x + 1 === ccx ? 0 : x + 1   // right index
      const b = y + 1 === ccy ? 0 : y + 1   // bottom index
      const l = x - 1 < 0 ? ccx - 1 : x - 1 // left index

      const thisState = states[x][y].state
      let liveNeighbours = 0
      liveNeighbours += states[x][t].state ? 1 : 0
      liveNeighbours += states[l][y].state ? 1 : 0
      liveNeighbours += states[r][y].state ? 1 : 0
      liveNeighbours += states[x][b].state ? 1 : 0

      if (y % 2 === 1) {
        liveNeighbours += states[l][t].state ? 1 : 0
        liveNeighbours += states[l][b].state ? 1 : 0
      } else {
        liveNeighbours += states[r][t].state ? 1 : 0
        liveNeighbours += states[r][b].state ? 1 : 0
      }

      const newGen = { ...states[x][y] }

      // Apply rules B25/S34
      if (thisState) {
        newGen.state = liveNeighbours === 3 || liveNeighbours === 4 ? 1 : 0
      } else {
        newGen.state = liveNeighbours === 2 || liveNeighbours === 5 ? 1 : 0
      }

      newGen.liveNeighbours = liveNeighbours
      nextGen[x][y] = newGen
    })
  })
  return nextGen
}

// Listeners
window.addEventListener('resize', reset)

window.toggleTheme = function (t) {
  svg.selectAll('#row').attr('class', `theme-${t}`)
}

window.restart = function (t) {
  reset()
}

select('svg')
  .on('click', function () {
    reset()
  })

window.updateSpeed = function (speed) {
  clearInterval(iteration)
  iteration = setInterval(iterate, speed)
}
