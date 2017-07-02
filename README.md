# b25s34

b25s34 is a revisited implementation of the zero-player "Game of Life" cellular automaton algorithm devised by the British mathematician John Horton Conway.

Life takes place on a two dimensions hexagonal grid, the rules of the universe are B25/S34 (I found those to be the most stable/interesting for this kind of representation):

- Any live cell with three or four live neighbours lives on. (S34)
- Any other live cell dies.
- Any dead cell with two or five live neighbours becomes a live cell. (B25)

The project is based on d3.js(v4), ES6 and Babel(stage-0) with webpack as JS bundler.

## Install dependencies:

```sh
npm i
```

## Start development server:

```sh
npm start
```
head to http://localhost:8080/ to see the app running


## Build for production:

```sh
npm run build
```
Bundled files can be found in `dist/`


## Resources
- [D3.js](https://d3js.org/)
- [webpack](https://webpack.github.io/)
- [Babel](https://babeljs.io/)
- [Game of Life on Wikipedia](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)
