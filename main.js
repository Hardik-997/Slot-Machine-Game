// Slot Machine Logic

const ROWS = 3;
const COLS = 3;

const SYMBOLS_COUNT = {
  "💎": 2,
  "⭐": 4,
  "🍒": 6,
  "🍋": 8,
};

const SYMBOL_VALUES = {
  "💎": 5,
  "⭐": 4,
  "🍒": 3,
  "🍋": 2,
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
  updateBalanceDisplay();

  document.getElementById("deposit-section").classList.add("hidden");
  document.getElementById("game-area").classList.remove("hidden");
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

  // We want to display columns (reels), so we need to transpose back for display
  // or just render the rows. The original code rendered rows.
  // Let's render 3 reels (columns) for better animation potential.

  // Transpose rows back to columns to render vertical reels
  const reels = [];
  for (let i = 0; i < COLS; i++) {
    reels[i] = [];
    for (let j = 0; j < ROWS; j++) {
      reels[i].push(rows[j][i]);
    }
  }

  for (const reel of reels) {
    const reelDiv = document.createElement("div");
    reelDiv.classList.add("reel");
    // For simplicity in this version, we just show the middle symbol or all 3?
    // The original game logic checks lines across rows.
    // Let's display all 3 symbols in the reel but vertically.
    // Actually, to keep it simple and match the CSS "reel" square, let's just show the middle row for now?
    // No, the user can bet on 3 lines. We should probably show a grid.

    // Let's change the display strategy.
    // The CSS defines .reel as a single square. 
    // We should probably clear that and make .reels-container hold 3 columns.

    // Actually, let's stick to the original "rows" display but style it better.
    // But wait, the CSS I wrote expects .reel to be a single item? 
    // ".reels-container { display: flex; justify-content: space-around; }"
    // ".reel { width: 60px; height: 60px; ... }"

    // If we want to show a 3x3 grid, we need a different structure.
    // Let's render 3 columns, each with 3 items.

    const reelColumn = document.createElement("div");
    reelColumn.style.display = "flex";
    reelColumn.style.flexDirection = "column";
    reelColumn.style.gap = "10px";

    for (const symbol of reel) {
      const symbolDiv = document.createElement("div");
      symbolDiv.classList.add("reel");
      symbolDiv.textContent = symbol;
      reelColumn.appendChild(symbolDiv);
    }
    slotsDiv.appendChild(reelColumn);
  }
}

function getWinnings(rows, bet, lines) {
  let winnings = 0;
  console.log('Checking winnings for rows:', rows);
  console.log('Bet:', bet, 'Lines:', lines);

  for (let row = 0; row < lines; row++) {
    const symbols = rows[row];
    console.log(`Row ${row}:`, symbols);
    const allSame = symbols.every(sym => sym === symbols[0]);
    console.log(`All same on row ${row}?`, allSame);

    if (allSame) {
      const symbolValue = SYMBOL_VALUES[symbols[0]];
      console.log(`Symbol "${symbols[0]}" value:`, symbolValue);
      winnings += bet * symbolValue;
    }
  }
  console.log('Total winnings:', winnings);
  return winnings;
}

function updateBalanceDisplay() {
  document.getElementById("balance-display").textContent = `$${balance}`;
}

async function play() {
  const linesInput = document.getElementById("lines");
  const betInput = document.getElementById("bet");
  const lines = parseInt(linesInput.value);
  const bet = parseFloat(betInput.value);

  if (isNaN(lines) || lines < 1 || lines > 3) {
    alert("Invalid number of lines!");
    return;
  }

  if (isNaN(bet) || bet <= 0 || bet * lines > balance) {
    alert("Invalid bet or insufficient funds!");
    return;
  }

  balance -= bet * lines;
  updateBalanceDisplay();

  const resultDisplay = document.getElementById("result");
  resultDisplay.textContent = "Spinning...";
  resultDisplay.classList.remove("highlight");

  // Disable button
  const spinBtn = document.getElementById("spin-btn");
  spinBtn.disabled = true;
  spinBtn.style.opacity = "0.5";

  // Generate the final result
  const reels = spin();
  const rows = transpose(reels);

  // Animate the spinning with actual symbol cycling
  // Play spin sound
  if (typeof audioManager !== 'undefined') {
    audioManager.play('spin');
  }

  await animateSpinning(reels);

  // Display final result
  printRows(rows);

  spinBtn.disabled = false;
  spinBtn.style.opacity = "1";

  const winnings = getWinnings(rows, bet, lines);
  balance += winnings;
  updateBalanceDisplay();

  if (winnings > 0) {
    resultDisplay.textContent = `YOU WON $${winnings}!`;
    resultDisplay.classList.add("highlight");

    // Trigger win animation system
    if (typeof winAnimationManager !== 'undefined') {
      await winAnimationManager.triggerWinAnimation(winnings, bet * lines, rows);
    }

    // Trigger Three.js celebration effect (fallback if winAnimationManager doesn't call it)
    if (typeof triggerWinCelebration === 'function') {
      triggerWinCelebration();
    }
  } else {
    resultDisplay.textContent = "Try Again";

    // Play lose sound
    if (typeof audioManager !== 'undefined') {
      audioManager.play('lose');
    }
  }

  if (balance <= 0) {
    alert("You're out of money!");
    resetGame();
  }
}

// Animate spinning reels with symbol cycling
async function animateSpinning(finalReels) {
  const slotsDiv = document.getElementById("slots");
  const allSymbols = ['💎', '⭐', '🍒', '🍋', '7️⃣', '🎰', '💰', '🔔'];

  // Create reel columns
  slotsDiv.innerHTML = "";
  const reelColumns = [];

  for (let i = 0; i < COLS; i++) {
    const reelColumn = document.createElement("div");
    reelColumn.classList.add("reel-column");
    reelColumn.style.display = "flex";
    reelColumn.style.flexDirection = "column";
    reelColumn.style.gap = "10px";
    reelColumn.style.overflow = "hidden";
    reelColumn.style.height = "210px"; // 3 symbols * 60px + 2 gaps * 10px

    // Create spinning container
    const spinContainer = document.createElement("div");
    spinContainer.classList.add("spin-container");
    spinContainer.style.transition = "none";

    // Add many symbols for spinning effect
    for (let j = 0; j < 20; j++) {
      const symbolDiv = document.createElement("div");
      symbolDiv.classList.add("reel");
      symbolDiv.textContent = allSymbols[Math.floor(Math.random() * allSymbols.length)];
      spinContainer.appendChild(symbolDiv);
    }

    reelColumn.appendChild(spinContainer);
    slotsDiv.appendChild(reelColumn);
    reelColumns.push({ column: reelColumn, container: spinContainer });
  }

  // Start spinning animation
  reelColumns.forEach(({ container }) => {
    container.style.animation = "spinReel 0.1s linear infinite";
  });

  // Stop each reel with stagger effect
  for (let i = 0; i < COLS; i++) {
    await new Promise(resolve => setTimeout(resolve, 500 + i * 300));

    const { container } = reelColumns[i];
    container.style.animation = "none";

    // Replace with final symbols for this reel
    container.innerHTML = "";
    for (let j = 0; j < ROWS; j++) {
      const symbolDiv = document.createElement("div");
      symbolDiv.classList.add("reel");
      symbolDiv.textContent = finalReels[i][j];
      symbolDiv.style.animation = "reelStop 0.3s ease-out";
      container.appendChild(symbolDiv);
    }
  }

  // Wait for last reel to settle
  await new Promise(resolve => setTimeout(resolve, 300));
}

function resetGame() {
  balance = 0;
  document.getElementById("game-area").classList.add("hidden");
  document.getElementById("deposit-section").classList.remove("hidden");
  document.getElementById("deposit").value = "";
  document.getElementById("result").textContent = "-";

  // Reset slots to ???
  const slotsDiv = document.getElementById("slots");
  slotsDiv.innerHTML = `
    <div class="reel">?</div>
    <div class="reel">?</div>
    <div class="reel">?</div>
  `;
}
