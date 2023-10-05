import "./style.css";

// canvas setup
const BLOCK_SIZE = 20,
  BOARD_WIDTH = 14,
  BOARD_HEIGHT = 30;

const $app = document.querySelector("#app"),
  $logo = document.createElement("img"),
  $container = document.createElement("div"),
  $playButton = document.createElement("section"),
  $score = document.createElement("h3"),
  $level = document.createElement("h3"),
  $canvas = document.createElement("canvas");

let score = 0,
  level = 1;

$playButton.id = "play";
$playButton.innerHTML = "<h3>Play</h3>";
$logo.src = "./javascript.svg";
$container.classList.add("container");
$app.insertAdjacentElement("beforebegin", $logo);
$container.appendChild($score);
$container.appendChild($level);
$app.insertAdjacentElement("beforebegin", $container);
$app.insertAdjacentElement("afterend", $playButton);
$app.appendChild($canvas);

$canvas.style.border = "2px solid #f7df1e";

const ctx = $canvas.getContext("2d");

$canvas.width = BLOCK_SIZE * BOARD_WIDTH;
$canvas.height = BLOCK_SIZE * BOARD_HEIGHT;

ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

// board setup
const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT);

function createBoard(width, height) {
  return Array(height)
    .fill()
    .map(() => Array(width).fill(0));
}

// piece setup
const piece = {
  x: BOARD_WIDTH / 2 - 1,
  y: 0,
  shape: [
    [1, 1],
    [1, 1],
  ],
};

const pieces = [
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
  [[1, 1, 1, 1]],
];

// game loop
let lastTime = 0,
  dropCounter = 0,
  dropInterval = 1000;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    piece.y++;
    if (checkCollision()) {
      piece.y--;
      solidify();
      rowsFilled();
    }

    dropCounter = 0;
  }

  draw();
  requestAnimationFrame(update);
}

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, $canvas.width, $canvas.height);

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        ctx.fillStyle = "#f7df1e";
        ctx.fillRect(x, y, 1, 1);
      }
    });
  });

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        ctx.fillStyle = "red";
        ctx.fillRect(piece.x + x, piece.y + y, 1, 1);
      }
    });
  });

  $score.textContent = `Score: ${score}`;
  $level.textContent = `Level: ${level}`;
}

// move piece
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    piece.x++;
    if (checkCollision()) piece.x--;
  }
  if (e.key === "ArrowLeft") {
    piece.x--;
    if (checkCollision()) piece.x++;
  }
  if (e.key === "ArrowDown") {
    piece.y++;
    if (checkCollision()) {
      piece.y--;
      solidify();
      rowsFilled();
    }
  }
  if (e.key === "ArrowUp") {
    const shape = piece.shape;
    piece.shape = piece.shape[0].map((_, index) =>
      piece.shape.map((row) => row[index]).reverse()
    );
    if (checkCollision()) piece.shape = shape;
  }
});

function checkCollision() {
  return piece.shape.find((row, y) => {
    return row.find((value, x) => {
      return value !== 0 && board[piece.y + y]?.[piece.x + x] !== 0;
    });
  });
}

function solidify() {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        board[piece.y + y][piece.x + x] = 1;
      }
    });
  });

  piece.y = 0;
  piece.x = BOARD_WIDTH / 2 - 1;

  piece.shape = pieces[Math.floor(Math.random() * pieces.length)];

  if (checkCollision()) {
    const gameOverSong = new Audio("./mario-bros-die.mp3");
    gameOverSong.volume = 0.5;
    gameOverSong.play();
    alert("Game Over!");
    score = 0;
    board.forEach((row) => row.fill(0));
  }
}

function rowsFilled() {
  let rows = 0;

  board.forEach((row, y) => {
    if (row.every((value) => value !== 0)) {
      rows++;
      board.splice(y, 1);
      board.unshift(new Array(BOARD_WIDTH).fill(0));
      score += rows * 10;
      level = Math.floor(score / 100) + 1;
      dropInterval = 1000 / level;
    }
  });

  return rows;
}

$playButton.addEventListener("click", () => {
  update();

  document.querySelector("body").style.background = "none";
  $playButton.remove();
  const song = new Audio("./Tetris.mp3");
  song.volume = 0.3;
  song.loop = true;
  song.play();
});
