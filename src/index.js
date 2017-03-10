import { scaleLinear } from 'd3-scale'

// width and height of cell polygon in px
const cellLength = 6

let width = window.innerWidth
let height = window.innerHeight

let columns = width / cellLength
let rows = height / cellLength

const xDomain = [0, columns]
const yDomain = [0, rows]

// positioning scales
const xScale = scaleLinear()
  .domain(xDomain)
  .range([0, width])

const yScale = scaleLinear()
  .domain(yDomain)
  .range([0, height])

// generate a random field to start from
let field = randomField()

const game = document.getElementById('game')
const ctx = game.getContext('2d')
game.width = width
game.height = height

function iterate() {
  field = createNewGeneration(field)
  render(field)
  window.requestAnimationFrame(iterate)
}

function getCellColor(liveNeighboursCount) {
  switch (liveNeighboursCount) {
    case 2:
      return '#878787'
    case 3:
      return '#AFAFAF'
    case 4:
      return '#D7D7D7'
    case 5:
      return '#FFFFFF'
    default:
      return '#5F5F5F'
  }
}

function render(data) {
  data.forEach((row, rowIndex) => {
    row.forEach(column => {
      const xPosition = Math.floor((rowIndex % 2 === 1) ? (xScale(column.x) - cellLength / 2) : xScale(column.x))
      const yPosition = Math.floor(yScale(column.y))
      const fill = getCellColor(column.liveNeighbours)
      if (column.state) {
        ctx.fillStyle = fill
        ctx.fillRect(xPosition, yPosition, cellLength / 2, cellLength / 2)
      } else {
        ctx.clearRect(xPosition, yPosition, cellLength / 2, cellLength / 2)
      }
    })
  })
}

function randomField() {
  return Array(Math.ceil(rows)).fill().map((r, i) =>
    Array(Math.ceil(columns + 1)).fill().map((c, j) => (
      {
        x     : j,
        y     : i,
        state : Math.random() < 0.5 ? 1 : 0,
      }
    ))
  )
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

function reset() {
  // recalculate width and height
  width = window.innerWidth
  height = window.innerHeight
  columns = width / cellLength
  rows = height / cellLength
  game.width = width
  game.height = height

  // generate a new field based on new dimensions
  field = randomField()
}

render(field)
window.requestAnimationFrame(iterate)

// reset fileld on resize
window.addEventListener('resize', reset)

window.restart = function () {
  reset()
}
