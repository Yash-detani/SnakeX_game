const menu = document.querySelector("#menu");
const gameScreen = document.querySelector("#game-screen");
const gameOverScreen = document.querySelector("#game-over");
const setupForm = document.querySelector("#setup-form");
const playerNameInput = document.querySelector("#player-name");
const widthInput = document.querySelector("#grid-width");
const heightInput = document.querySelector("#grid-height");
const difficultyInput = document.querySelector("#difficulty");
const boardElement = document.querySelector("#board");
const statusElement = document.querySelector("#status");
const instructionElement = document.querySelector("#instruction");
const nameError = document.querySelector("#name-error");

const MAX_TAIL = 100;
let playerName = "";
let width = 20;
let height = 20;
let speedMs = 100;
let snake;
let food;
let score = 0;
let gameOver = false;
let timer = null;
let lastDirection = "STOP";

function randomFood() {
  // Match the C++ game's food range: inside the border.
  return {
    x: Math.floor(Math.random() * (width - 2)) + 1,
    y: Math.floor(Math.random() * (height - 2)) + 1
  };
}

function resetGame() {
  clearInterval(timer);
  score = 0;
  gameOver = false;
  lastDirection = "STOP";
  snake = { x: Math.floor(width / 2), y: Math.floor(height / 2), tail: [], direction: "STOP" };
  food = randomFood();
  menu.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  instructionElement.textContent = "Press W, A, S, or D to start moving!";
  draw();
}

function draw() {
  statusElement.textContent = `Player: ${playerName} | Score: ${score} | Grid: ${width}x${height}`;
  const lines = [];
  lines.push("-".repeat(width + 2));
  for (let y = 0; y < height; y++) {
    let row = "|";
    for (let x = 0; x < width; x++) {
      if (x === snake.x && y === snake.y) row += "O";
      else if (x === food.x && y === food.y) row += "#";
      else if (snake.tail.some(part => part.x === x && part.y === y)) row += "o";
      else row += " ";
    }
    row += "|";
    lines.push(row);
  }
  lines.push("-".repeat(width + 2));
  boardElement.textContent = lines.join("\n");
}

function setDirection(next) {
  const current = snake.direction;
  if (next === "LEFT" && current !== "RIGHT") snake.direction = next;
  else if (next === "RIGHT" && current !== "LEFT") snake.direction = next;
  else if (next === "UP" && current !== "DOWN") snake.direction = next;
  else if (next === "DOWN" && current !== "UP") snake.direction = next;
  if (snake.direction !== "STOP") instructionElement.textContent = "Eat # to score points. Avoid the walls and your tail.";
}

function moveSnake() {
  if (snake.direction === "STOP") return;

  // Preserve the original C++ tail-following behavior.
  const oldHead = { x: snake.x, y: snake.y };
  if (currentTailLength > 0) {
    snake.tail.unshift(oldHead);
    if (snake.tail.length > currentTailLength) snake.tail.length = currentTailLength;
    if (snake.tail.length > MAX_TAIL) snake.tail.length = MAX_TAIL;
  }

  if (snake.direction === "LEFT") snake.x--;
  if (snake.direction === "RIGHT") snake.x++;
  if (snake.direction === "UP") snake.y--;
  if (snake.direction === "DOWN") snake.y++;

  if (snake.x < 0 || snake.x >= width || snake.y < 0 || snake.y >= height) {
    endGame();
    return;
  }
  if (snake.tail.some(part => part.x === snake.x && part.y === snake.y)) {
    endGame();
    return;
  }
  if (snake.x === food.x && snake.y === food.y) {
    score += 10;
    currentTailLength = Math.min(MAX_TAIL, currentTailLength + 1);
    food = randomFood();
  }
  draw();
}

let currentTailLength = 0;

function startLoop() {
  clearInterval(timer);
  timer = setInterval(() => {
    if (!gameOver) moveSnake();
  }, speedMs);
}

function endGame() {
  gameOver = true;
  clearInterval(timer);
  draw();
  gameScreen.classList.add("hidden");
  gameOverScreen.classList.remove("hidden");
  document.querySelector("#final-player").textContent = `Player: ${playerName}`;
  document.querySelector("#final-score").textContent = `Final Score: ${score}`;
}

function quitGame() {
  clearInterval(timer);
  gameOver = true;
  gameScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  menu.classList.remove("hidden");
  setupForm.reset();
  widthInput.value = 20;
  heightInput.value = 20;
}

setupForm.addEventListener("submit", event => {
  event.preventDefault();
  const name = playerNameInput.value.trim();
  const gridWidth = Number(widthInput.value);
  const gridHeight = Number(heightInput.value);

  if (!/^[A-Za-z]+$/.test(name)) {
    nameError.textContent = "Name cannot contain numbers, spaces, or special characters.";
    return;
  }
  if (!Number.isInteger(gridWidth) || gridWidth < 10 || gridWidth > 80) {
    alert("Width must be a number between 10 and 80.");
    return;
  }
  if (!Number.isInteger(gridHeight) || gridHeight < 10 || gridHeight > 36) {
    alert("Height must be a number between 10 and 36.");
    return;
  }

  nameError.textContent = "";
  playerName = name;
  width = gridWidth;
  height = gridHeight;
  speedMs = Number(difficultyInput.value);
  currentTailLength = 0;
  resetGame();
  startLoop();
});

document.addEventListener("keydown", event => {
  if (gameScreen.classList.contains("hidden")) {
    if (gameOverScreen.classList.contains("hidden")) return;
    if (event.key.toLowerCase() === "r") {
      currentTailLength = 0;
      resetGame();
      startLoop();
    } else if (event.key.toLowerCase() === "q") {
      quitGame();
    }
    return;
  }

  const key = event.key.toLowerCase();
  const keyMap = { a: "LEFT", d: "RIGHT", w: "UP", s: "DOWN" };
  if (keyMap[key]) {
    event.preventDefault();
    setDirection(keyMap[key]);
  } else if (key === "x") {
    endGame();
  }
});

document.querySelector("#restart-button").addEventListener("click", () => {
  currentTailLength = 0;
  resetGame();
  startLoop();
});
document.querySelector("#quit-button").addEventListener("click", quitGame);
