// 1. Despot some money
// 2. Determine number of lines to bet on
// 3. Collect a bet amount
// 4. Spin the slot machine
// 5. check if the user won
// 6. give the user their winnings
// 7. play again


const ROWS = 3;
const COLS = 3;

const SYMBOLS_COUNT = {
  A: 2,
  B: 4,
  C: 6,
  D: 8,
};

const SYMBOL_VALUES = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
};

let balance = 0;

function startGame() {
  const depositInput = document.getElementById("deposit").value;
  const depositAmount = parseFloat(depositInput);

  if (isNaN(depositAmount) || depositAmount <= 0) {
    alert("Invalid deposit amount!");
    return;
  }

  balance = depositAmount;
  document.getElementById("balance-display").textContent = `Balance: $${balance}`;
  document.getElementById("game-area").style.display = "block";
}

function spin() {
  const symbols = [];

  for (const [symbol, count] of Object.entries(SYMBOLS_COUNT)) {
    for (let i = 0; i < count; i++) {
      symbols.push(symbol);
    }
  }

  const reels = [];
  for (let i = 0; i < COLS; i++) {
    reels.push([]);
    const reelSymbols = [...symbols];

    for (let j = 0; j < ROWS; j++) {
      const randomIndex = Math.floor(Math.random() * reelSymbols.length);
      const selectedSymbol = reelSymbols[randomIndex];
      reels[i].push(selectedSymbol);
      reelSymbols.splice(randomIndex, 1);
    }
  }

  return reels;
}

function transpose(reels) {
  const rows = [];

  for (let i = 0; i < ROWS; i++) {
    rows.push([]);
    for (let j = 0; j < COLS; j++) {
      rows[i].push(reels[j][i]);
    }
  }

  return rows;
}

function printRows(rows) {
  const slotsDiv = document.getElementById("slots");
  slotsDiv.innerHTML = "";
  for (const row of rows) {
    const rowDiv = document.createElement("div");
    rowDiv.textContent = row.join(" | ");
    slotsDiv.appendChild(rowDiv);
  }
}

function getWinnings(rows, bet, lines) {
  let winnings = 0;

  for (let row = 0; row < lines; row++) {
    const symbols = rows[row];
    const allSame = symbols.every(sym => sym === symbols[0]);
    if (allSame) {
      winnings += bet * SYMBOL_VALUES[symbols[0]];
    }
  }

  return winnings;
}

function play() {
  const lines = parseInt(document.getElementById("lines").value);
  const bet = parseFloat(document.getElementById("bet").value);

  if (isNaN(lines) || lines < 1 || lines > 3) {
    alert("Invalid number of lines!");
    return;
  }

  if (isNaN(bet) || bet <= 0 || bet * lines > balance) {
    alert("Invalid bet!");
    return;
  }

  balance -= bet * lines;

  const reels = spin();
  const rows = transpose(reels);
  printRows(rows);

  const winnings = getWinnings(rows, bet, lines);
  balance += winnings;

  document.getElementById("balance-display").textContent = `Balance: $${balance}`;
  document.getElementById("result").textContent = `You won $${winnings}`;

  if (balance <= 0) {
    alert("You're out of money!");
    document.getElementById("game-area").style.display = "none";
  }
}

function resetGame() {
  balance = 0;
  document.getElementById("game-area").style.display = "none";
  document.getElementById("deposit").value = "";
  document.getElementById("slots").innerHTML = "";
  document.getElementById("result").textContent = "";
}
