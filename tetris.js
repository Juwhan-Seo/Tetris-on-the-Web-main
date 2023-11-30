const board = document.getElementById('board');
const cells = [];

for (let i = 0; i < 200; i++) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  board.appendChild(cell);
  cells.push(cell);
}

const tetrominoes = [
  { shape: [[1, 1, 1], [0, 1, 0]], color: "cyan" },
  { shape: [[1, 1], [1, 1]], color: "yellow" },
  { shape: [[1, 1, 0], [0, 1, 1]], color: "red" },
  { shape: [[0, 1, 1], [1, 1, 0]], color: "green" },
  { shape: [[1, 1, 1, 1]], color: "blue" },
  { shape: [[1, 1, 1], [1, 0, 0]], color: "purple" },
  { shape: [[1, 1, 1], [0, 0, 1]], color: "orange" },
];

class Tetromino {
  constructor(matrix, x, y, color) {
    this.matrix = matrix;
    this.x = x;
    this.y = y;
    this.color = color;
  }

  hardDrop() {
    this.erase();
    while (!this.collides()) {
      this.y += 1;
    }
    this.y -= 1;
    this.draw();
  }
  
  move(dx, dy) {
    this.erase();
    this.x += dx;
    this.y += dy;
    if (this.collides()) {
      this.x -= dx;
      this.y -= dy;
    }
    this.draw();
  }

  moveDown() {
    this.erase();
    this.y += 1;
    if (this.collides()) {
      this.y -= 1;
      return false;
    }
    this.draw();
    return true;
  }

  collides() {
    let collision = false;
    this._iterate((x, y) => {
      const boardX = this.x + x;
      const boardY = this.y + y;
      if (
        boardX < 0 ||
        boardX >= 10 ||
        boardY < 0 ||
        boardY >= 20 ||
        cells[boardY * 10 + boardX].style.backgroundColor
      ) {
        collision = true;
      }
    });
    return collision;
  }

  draw() {
    this._iterate((x, y) => {
      cells[(this.y + y) * 10 + this.x + x].style.backgroundColor = this.color;
    });
  }

  erase() {
    this._iterate((x, y) => {
      cells[(this.y + y) * 10 + this.x + x].style.backgroundColor = '';
    });
  }
  
  rotate() {
    const newMatrix = [];
    for (let x = 0; x < this.matrix[0].length; x++) {
      newMatrix[x] = [];
      for (let y = this.matrix.length - 1; y >= 0; y--) {
        newMatrix[x].push(this.matrix[y][x]);
      }
    }
    return newMatrix;
  }

  rotateRight() {
    this.erase();
    const tempMatrix = this.matrix;
    this.matrix = this.rotate();
    if (this.collides()) {
      this.matrix = tempMatrix;
    }
    this.draw();
  }
  rotateLeft() {
    this.erase();
    const tempMatrix = this.matrix;
    for (let i = 0; i < 3; i++) {
      this.matrix = this.rotate();
    }
    if (this.collides()) {
      this.matrix = tempMatrix;
    }
    this.draw();
  }

  _iterate(callback) {
    for (let y = 0; y < this.matrix.length; y++) {
      for (let x = 0; x < this.matrix[y].length; x++) {
        if (this.matrix[y][x]) {
          callback(x, y);
        }
      }
    }
  }
}

let currentTetromino;

function spawnTetromino() {
  const t = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
  currentTetromino = new Tetromino(t.shape, 3, 0, t.color);
  if (currentTetromino.collides()) {
    clearInterval(gameInterval);
    alert("Game Over!");
  }
  currentTetromino.draw();
}

function gameLoop() {
  if (!currentTetromino.moveDown()) {
    spawnTetromino();
  }
}

function handleKeyDown(e) {
  switch (e.key) {
    case "ArrowLeft":
      currentTetromino.move(-1, 0);
      break;
    case "ArrowRight":
      currentTetromino.move(1, 0);
      break;
    case "ArrowDown":
      currentTetromino.move(0, 1);
      break;
    case "ArrowUp":
      currentTetromino.rotateRight();
      break;
    case "Shift":
      currentTetromino.rotateLeft();
      break;
    case " ":
    case "Spacebar":
      currentTetromino.hardDrop();
      break;
  }
}



function lockTetromino() {
  currentTetromino._iterate((x, y) => {
    cells[(currentTetromino.y + y) * 10 + currentTetromino.x + x].style.backgroundColor = currentTetromino.color;
  });
}

function checkForFullRows() {
  for (let y = 0; y < 20; y++) {
    let rowFull = true;
    for (let x = 0; x < 10; x++) {
      if (!cells[y * 10 + x].style.backgroundColor) {
        rowFull = false;
        break;
      }
    }
    if (rowFull) {
      for (let y2 = y; y2 > 0; y2--) {
        for (let x = 0; x < 10; x++) {
          cells[y2 * 10 + x].style.backgroundColor = cells[(y2 - 1) * 10 + x].style.backgroundColor;
        }
      }
      for (let x = 0; x < 10; x++) {
        cells[x].style.backgroundColor = '';
      }
    }
  }
}

function gameLoop() {
  if (!currentTetromino.moveDown()) {
    lockTetromino();
    checkForFullRows();
    spawnTetromino();
  }
}

document.addEventListener("keydown", handleKeyDown);

spawnTetromino();
const gameInterval = setInterval(gameLoop, 500);

