import { select } from 'd3-selection'
import { scaleLinear } from 'd3-scale'

// initial iteration interval
const iterationInterval = 100

// width and height of cellagon polygon in px
const cellLength = 20

const gameBBox = window.getComputedStyle(document.getElementById('game'))
let windowWidth = parseFloat(gameBBox.getPropertyValue('width'))
let windowHeight = parseFloat(gameBBox.getPropertyValue('height'))

let columns = windowWidth / cellLength
let rows = windowHeight / cellLength

const xDomain = [0, columns]
const yDomain = [0, rows]

// positioning scales
const xScale = scaleLinear()
  .domain(xDomain)
  .range([0, windowWidth])

const yScale = scaleLinear()
  .domain(yDomain)
  .range([0, windowHeight])

let field = randomField()

function iterate() {
  field = createNewGeneration(field)
  render(field)
}

const game = select('#game')
render(field)
setInterval(iterate, iterationInterval)

function render(data) {
  const row = game.selectAll('#row')
    .data(data)

  row.enter()
    .append('g')
    .attr('id', 'row')

  row.attr('transform', (d, i) =>
    ((i % 2) === 1) ? `translate(${-cellLength / 2}, 0)` : null
  )

  const cellUpdate = row.selectAll('#cell')
    .data(d => d)

  const cellEnter = cellUpdate.enter()

  cellEnter
    .append('text')
    .attr('id', 'cell')
    .attr('transform', (d) =>
      `translate(${xScale(d.x)}, ${yScale(d.y)})`
    )

  cellUpdate
    .text(d => d.state ? '1' : '0')
    .classed('on', d => d.state)
    .classed('three-neighbours', d => d.liveNeighbours === 3)
    .classed('four-neighbours', d => d.liveNeighbours === 4)
    .classed('five-neighbours', d => d.liveNeighbours === 5)
    .classed('six-neighbours', d => d.liveNeighbours === 6)
}

function randomField() {
  return Array(Math.ceil(rows)).fill().map((r, i) =>
    Array(Math.ceil(columns + 1)).fill().map((c, j) => (
      {
        x     : j,
        y     : i,
        state : Math.random() < 0.3 ? 1 : 0,
      }
    ))
  )
}

function reset() {
  windowWidth = parseFloat(gameBBox.getPropertyValue('width'))
  windowHeight = parseFloat(gameBBox.getPropertyValue('height'))
  columns = windowWidth / cellLength
  rows = windowHeight / cellLength
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

      if (y % 2) {
        liveNeighbours += states[l][t].state ? 1 : 0
        liveNeighbours += states[l][b].state ? 1 : 0
      } else {
        liveNeighbours += states[r][t].state ? 1 : 0
        liveNeighbours += states[r][b].state ? 1 : 0
      }

      const newGen = { ...states[x][y] }

      // apply rules B25/S34
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

// listeners
window.addEventListener('resize', reset)

window.restart = function (t) {
  reset()
}

select('#game')
  .on('click', function () {
    reset()
  })
