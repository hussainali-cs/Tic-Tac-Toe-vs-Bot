/* ==========================================
   TIC TAC TOE — PLAYER VS BOT
   Hussain Ali
========================================== */

const cells = document.querySelectorAll(".cell");

const newGameBtn = document.getElementById("newGameBtn");
const resetScoreBtn = document.getElementById("resetScoreBtn");
const playAgainBtn = document.getElementById("playAgainBtn");

const difficultyButtons =
  document.querySelectorAll(".difficulty");

const symbolButtons =
  document.querySelectorAll(".symbol");

const turnText =
  document.getElementById("turnText");

const statusTitle =
  document.getElementById("statusTitle");

const statusDescription =
  document.getElementById("statusDescription");

const gameMessage =
  document.getElementById("gameMessage");

const playerScoreElement =
  document.getElementById("playerScore");

const botScoreElement =
  document.getElementById("botScore");

const drawScoreElement =
  document.getElementById("drawScore");

const bestPlayerElement =
  document.getElementById("bestPlayer");

const bestBotElement =
  document.getElementById("bestBot");

const bestTitle =
  document.getElementById("bestTitle");

const resultOverlay =
  document.getElementById("resultOverlay");

const resultIcon =
  document.getElementById("resultIcon");

const resultTitle =
  document.getElementById("resultTitle");

const resultDescription =
  document.getElementById("resultDescription");

const themeBtn =
  document.getElementById("themeBtn");

const soundBtn =
  document.getElementById("soundBtn");

const year =
  document.getElementById("year");


/* ==========================================
   GAME VARIABLES
========================================== */

let board = [
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
];

let playerSymbol = "X";
let botSymbol = "O";

let difficulty = "medium";

let currentPlayer = "player";

let gameOver = false;
let botThinking = false;

let soundEnabled = true;

let scores = {
  player: 0,
  bot: 0,
  draws: 0
};

let bestScores = {
  player: 0,
  bot: 0
};

const winningCombinations = [

  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],

  [0, 4, 8],
  [2, 4, 6]

];


/* ==========================================
   LOCAL STORAGE
========================================== */

function loadData() {

  const savedScores =
    localStorage.getItem("ticTacToeScores");

  const savedBest =
    localStorage.getItem("ticTacToeBest");

  const savedSound =
    localStorage.getItem("ticTacToeSound");

  if (savedScores) {
    scores = JSON.parse(savedScores);
  }

  if (savedBest) {
    bestScores = JSON.parse(savedBest);
  }

  if (savedSound !== null) {
    soundEnabled = savedSound === "true";
  }

  updateScoreUI();
  updateSoundIcon();
}


/* ==========================================
   SAVE DATA
========================================== */

function saveData() {

  localStorage.setItem(
    "ticTacToeScores",
    JSON.stringify(scores)
  );

  localStorage.setItem(
    "ticTacToeBest",
    JSON.stringify(bestScores)
  );

  localStorage.setItem(
    "ticTacToeSound",
    soundEnabled
  );
}


/* ==========================================
   INITIALIZATION
========================================== */

function init() {

  year.textContent =
    new Date().getFullYear();

  loadData();

  startNewGame();

}


/* ==========================================
   NEW GAME
========================================== */

function startNewGame() {

  board = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ];

  gameOver = false;
  botThinking = false;

  currentPlayer = "player";

  clearBoard();

  updateTurnUI();

}


/* ==========================================
   CLEAR BOARD
========================================== */

function clearBoard() {

  cells.forEach(cell => {

    cell.className = "cell";

    cell.innerHTML = "";

  });

}


/* ==========================================
   PLAYER MOVE
========================================== */

function playerMove(index) {

  if (
    gameOver ||
    botThinking ||
    currentPlayer !== "player" ||
    board[index] !== ""
  ) {
    return;
  }

  makeMove(index, playerSymbol);

  playMoveSound();

  const result =
    checkGameResult(board);

  if (result) {

    finishGame(result);

    return;

  }

  currentPlayer = "bot";

  updateTurnUI();

  botThinking = true;

  setTimeout(() => {

    botMove();

  }, 500);

}


/* ==========================================
   MAKE MOVE
========================================== */

function makeMove(index, symbol) {

  board[index] = symbol;

  const cell = cells[index];

  cell.classList.add(
    symbol === "X" ? "x" : "o"
  );

  cell.classList.add("taken");

}


/* ==========================================
   BOT MOVE
========================================== */

function botMove() {

  if (gameOver) return;

  let move;

  if (difficulty === "easy") {

    move = easyMove();

  }

  else if (difficulty === "medium") {

    move = mediumMove();

  }

  else {

    move = minimaxMove();

  }

  if (move !== null) {

    makeMove(move, botSymbol);

    playMoveSound();

  }

  botThinking = false;

  const result =
    checkGameResult(board);

  if (result) {

    finishGame(result);

    return;

  }

  currentPlayer = "player";

  updateTurnUI();

}


/* ==========================================
   EASY AI
========================================== */

function easyMove() {

  const available =
    getAvailableMoves();

  if (!available.length) {
    return null;
  }

  return available[
    Math.floor(
      Math.random() * available.length
    )
  ];
}


/* ==========================================
   MEDIUM AI
========================================== */

function mediumMove() {

  const available =
    getAvailableMoves();

  if (!available.length) {
    return null;
  }

  /* First: Try to win */

  for (const move of available) {

    board[move] = botSymbol;

    if (
      checkWinner(board, botSymbol)
    ) {

      board[move] = "";

      return move;

    }

    board[move] = "";

  }


  /* Second: Block player */

  for (const move of available) {

    board[move] = playerSymbol;

    if (
      checkWinner(board, playerSymbol)
    ) {

      board[move] = "";

      return move;

    }

    board[move] = "";

  }


  /* Third: Take center */

  if (board[4] === "") {
    return 4;
  }


  /* Fourth: Take corner */

  const corners =
    [0, 2, 6, 8]
      .filter(index => board[index] === "");

  if (corners.length) {

    return corners[
      Math.floor(
        Math.random() * corners.length
      )
    ];

  }


  return easyMove();

}


/* ==========================================
   HARD AI — MINIMAX
========================================== */

function minimaxMove() {

  let bestScore = -Infinity;
  let bestMove = null;

  const available =
    getAvailableMoves();

  for (const move of available) {

    board[move] = botSymbol;

    const score =
      minimax(
        board,
        0,
        false
      );

    board[move] = "";

    if (score > bestScore) {

      bestScore = score;

      bestMove = move;

    }

  }

  return bestMove;
}


/* ==========================================
   MINIMAX ALGORITHM
========================================== */

function minimax(
  position,
  depth,
  maximizing
) {

  if (
    checkWinner(position, botSymbol)
  ) {
    return 10 - depth;
  }

  if (
    checkWinner(position, playerSymbol)
  ) {
    return depth - 10;
  }

  if (
    !position.includes("")
  ) {
    return 0;
  }


  if (maximizing) {

    let bestScore = -Infinity;

    for (
      const move of getAvailableMoves(position)
    ) {

      position[move] = botSymbol;

      const score =
        minimax(
          position,
          depth + 1,
          false
        );

      position[move] = "";

      bestScore =
        Math.max(
          bestScore,
          score
        );

    }

    return bestScore;

  }


  else {

    let bestScore = Infinity;

    for (
      const move of getAvailableMoves(position)
    ) {

      position[move] = playerSymbol;

      const score =
        minimax(
          position,
          depth + 1,
          true
        );

      position[move] = "";

      bestScore =
        Math.min(
          bestScore,
          score
        );

    }

    return bestScore;

  }

}


/* ==========================================
   AVAILABLE MOVES
========================================== */

function getAvailableMoves(
  currentBoard = board
) {

  const moves = [];

  currentBoard.forEach(
    (value, index) => {

      if (value === "") {
        moves.push(index);
      }

    }
  );

  return moves;

}


/* ==========================================
   CHECK WINNER
========================================== */

function checkWinner(
  currentBoard,
  symbol
) {

  return winningCombinations.some(
    combination =>
      combination.every(
        index =>
          currentBoard[index] === symbol
      )
  );

}


/* ==========================================
   GAME RESULT
========================================== */

function checkGameResult(
  currentBoard
) {

  for (
    const combination
    of winningCombinations
  ) {

    const [a, b, c] =
      combination;

    if (
      currentBoard[a] &&
      currentBoard[a] === currentBoard[b] &&
      currentBoard[a] === currentBoard[c]
    ) {

      return {
        type: "win",
        symbol: currentBoard[a],
        combination
      };

    }

  }


  if (!currentBoard.includes("")) {

    return {
      type: "draw"
    };

  }


  return null;

}


/* ==========================================
   FINISH GAME
========================================== */

function finishGame(result) {

  gameOver = true;

  if (result.type === "draw") {

    scores.draws++;

    updateScoreUI();

    statusTitle.textContent =
      "DRAW";

    statusDescription.textContent =
      "Nobody wins this round.";

    turnText.textContent =
      "DRAW GAME";

    gameMessage.innerHTML =
      `<span>It's a </span>
       <strong style="color:#ffc928">DRAW!</strong>
       <span> Try again.</span>
       <span class="trophy">🤝</span>`;

    showResult(
      "🤝",
      "DRAW!",
      "That was a close one."
    );

  }

  else if (
    result.symbol === playerSymbol
  ) {

    scores.player++;

    bestScores.player =
      Math.max(
        bestScores.player,
        scores.player
      );

    updateScoreUI();

    highlightWinner(
      result.combination
    );

    statusTitle.textContent =
      "YOU WIN";

    statusDescription.textContent =
      "Excellent move!";

    turnText.textContent =
      "YOU WIN!";

    gameMessage.innerHTML =
      `<span>You defeated the </span>
       <strong>${difficulty.toUpperCase()}</strong>
       <span> bot!</span>
       <span class="trophy">🏆</span>`;

    showResult(
      "🏆",
      "YOU WIN!",
      "Great job! You beat the bot."
    );

    playWinSound();

  }

  else {

    scores.bot++;

    bestScores.bot =
      Math.max(
        bestScores.bot,
        scores.bot
      );

    updateScoreUI();

    highlightWinner(
      result.combination
    );

    statusTitle.textContent =
      "BOT WINS";

    statusDescription.textContent =
      "The bot got you this time.";

    turnText.textContent =
      "BOT WINS";

    gameMessage.innerHTML =
      `<span>The bot wins on </span>
       <strong>${difficulty.toUpperCase()}</strong>
       <span> mode.</span>
       <span class="trophy">🤖</span>`;

    showResult(
      "🤖",
      "BOT WINS!",
      "Don't give up. Try again."
    );

    playLoseSound();

  }

  saveData();

}


/* ==========================================
   HIGHLIGHT WIN
========================================== */

function highlightWinner(
  combination
) {

  combination.forEach(index => {

    cells[index].classList.add(
      "winner"
    );

  });

}


/* ==========================================
   SCORE UI
========================================== */

function updateScoreUI() {

  playerScoreElement.textContent =
    scores.player;

  botScoreElement.textContent =
    scores.bot;

  drawScoreElement.textContent =
    scores.draws;

  bestPlayerElement.textContent =
    bestScores.player;

  bestBotElement.textContent =
    bestScores.bot;

  bestTitle.textContent =
    `BEST SCORE (${difficulty.toUpperCase()})`;

}


/* ==========================================
   TURN UI
========================================== */

function updateTurnUI() {

  if (currentPlayer === "player") {

    turnText.textContent =
      "YOUR TURN";

    statusTitle.textContent =
      "YOUR TURN";

    statusDescription.textContent =
      "Make your move!";

  }

  else {

    turnText.textContent =
      "BOT THINKING...";

    statusTitle.textContent =
      "BOT THINKING";

    statusDescription.textContent =
      "The bot is choosing a move...";

  }

}


/* ==========================================
   RESULT MODAL
========================================== */

function showResult(
  icon,
  title,
  description
) {

  resultIcon.textContent = icon;

  resultTitle.textContent = title;

  resultDescription.textContent =
    description;

  setTimeout(() => {

    resultOverlay.classList.add("show");

  }, 500);

}


/* ==========================================
   DIFFICULTY
========================================== */

difficultyButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      difficulty =
        button.dataset.level;

      difficultyButtons.forEach(
        b =>
          b.classList.remove("active")
      );

      button.classList.add("active");

      updateScoreUI();

      updateGameMessage();

      startNewGame();

    }
  );

});


/* ==========================================
   SYMBOL SELECTION
========================================== */

symbolButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      playerSymbol =
        button.dataset.symbol;

      botSymbol =
        playerSymbol === "X"
          ? "O"
          : "X";

      symbolButtons.forEach(
        b =>
          b.classList.remove("active")
      );

      button.classList.add("active");

      startNewGame();

    }
  );

});


/* ==========================================
   UPDATE GAME MESSAGE
========================================== */

function updateGameMessage() {

  gameMessage.innerHTML =
    `<span>Beat the bot on </span>
     <strong>${difficulty.toUpperCase()}</strong>
     <span> mode to win!</span>
     <span class="trophy">🏆</span>`;

}


/* ==========================================
   CELL CLICK
========================================== */

cells.forEach(cell => {

  cell.addEventListener(
    "click",
    () => {

      const index =
        Number(
          cell.dataset.index
        );

      playerMove(index);

    }
  );

});


/* ==========================================
   NEW GAME BUTTON
========================================== */

newGameBtn.addEventListener(
  "click",
  () => {

    startNewGame();

  }
);


/* ==========================================
   PLAY AGAIN
========================================== */

playAgainBtn.addEventListener(
  "click",
  () => {

    resultOverlay.classList.remove(
      "show"
    );

    startNewGame();

  }
);


/* ==========================================
   RESET SCORE
========================================== */

resetScoreBtn.addEventListener(
  "click",
  () => {

    scores = {
      player: 0,
      bot: 0,
      draws: 0
    };

    bestScores = {
      player: 0,
      bot: 0
    };

    updateScoreUI();

    saveData();

    startNewGame();

  }
);


/* ==========================================
   THEME
========================================== */

themeBtn.addEventListener(
  "click",
  () => {

    document.body.classList.toggle(
      "light"
    );

    themeBtn.textContent =
      document.body.classList.contains(
        "light"
      )
        ? "🌙"
        : "☀️";

  }
);


/* ==========================================
   SOUND
========================================== */

function updateSoundIcon() {

  soundBtn.textContent =
    soundEnabled
      ? "🔊"
      : "🔇";

}

soundBtn.addEventListener(
  "click",
  () => {

    soundEnabled =
      !soundEnabled;

    updateSoundIcon();

    saveData();

  }
);


/* ==========================================
   SIMPLE SOUND ENGINE
========================================== */

let audioContext;

function getAudioContext() {

  if (!audioContext) {

    audioContext =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

  }

  return audioContext;

}


function beep(
  frequency,
  duration,
  type = "sine"
) {

  if (!soundEnabled) return;

  const context =
    getAudioContext();

  const oscillator =
    context.createOscillator();

  const gain =
    context.createGain();

  oscillator.type = type;

  oscillator.frequency.value =
    frequency;

  gain.gain.setValueAtTime(
    .08,
    context.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    .001,
    context.currentTime + duration
  );

  oscillator.connect(gain);

  gain.connect(context.destination);

  oscillator.start();

  oscillator.stop(
    context.currentTime + duration
  );

}


function playMoveSound() {

  beep(520, .08);

}


function playWinSound() {

  setTimeout(
    () => beep(650, .12),
    0
  );

  setTimeout(
    () => beep(800, .15),
    120
  );

  setTimeout(
    () => beep(1000, .2),
    240
  );

}


function playLoseSound() {

  setTimeout(
    () => beep(300, .15),
    0
  );

  setTimeout(
    () => beep(220, .2),
    150
  );

}


/* ==========================================
   CLOSE RESULT ON BACKDROP
========================================== */

resultOverlay.addEventListener(
  "click",
  event => {

    if (
      event.target === resultOverlay
    ) {

      resultOverlay.classList.remove(
        "show"
      );

    }

  }
);


/* ==========================================
   START
========================================== */

init();