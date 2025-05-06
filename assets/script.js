const board = document.getElementById('board');
const message = document.getElementById('message');
const resetButton = document.getElementById('reset');

let isTimeUp = false;
let timerStarted = false; // Flag to track if timer is started
let queenCount = 0; // Track the number of queens placed on the board

// Create the board
function createBoard() {
    board.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            if ((row + col) % 2 === 0) {
                square.classList.add('light');
            } else {
                square.classList.add('dark');
            }
            square.dataset.row = row;
            square.dataset.col = col;
            square.addEventListener('click', toggleQueen);
            board.appendChild(square);
        }
    }
}

// Toggle queen
function toggleQueen(e) {
    if (isTimeUp) return; // Prevent actions after time is up
    const square = e.currentTarget;

    // Only allow placing a queen if there are fewer than 8 queens on the board
    if (queenCount >= 8 && square.textContent !== '♕') {
        message.textContent = 'You can place only 8 queens!';
        message.style.color = '#e74c3c';
        return;
    }

    // Toggle the queen on the square
    if (square.textContent === '♕') {
        square.textContent = '';
        queenCount--;  // Decrease count if the queen is removed
    } else {
        square.textContent = '♕';
        queenCount++;  // Increase count if a queen is added
    }

    checkBoard();

    // Start the timer when the first queen is placed
    if (!timerStarted && square.textContent === '♕') {
        timerStarted = true;
        startTimer();
    }
}

// Board status
function checkBoard() {
    const squares = document.querySelectorAll('.square');
    const queens = [];

    squares.forEach(square => {
        if (square.textContent === '♕') {
            queens.push({
                row: parseInt(square.dataset.row),
                col: parseInt(square.dataset.col)
            });
        }
    });

    let conflict = false;

    for (let i = 0; i < queens.length; i++) {
        for (let j = i + 1; j < queens.length; j++) {
            if (
                queens[i].row === queens[j].row ||
                queens[i].col === queens[j].col ||
                Math.abs(queens[i].row - queens[j].row) === Math.abs(queens[i].col - queens[j].col)
            ) {
                conflict = true;
                break;
            }
        }
        if (conflict) break;
    }

    // Update message
    if (conflict) {
        message.textContent = 'Conflict detected!';
        message.style.color = '#e74c3c';
    } else {
        if (queenCount === 8) {
            message.textContent = 'Puzzle solved!';
            message.style.color = '#27ae60';
            puzzleSolved();
        } else {
            message.textContent = 'Place 8 queens';
            message.style.color = '#333';
        }
    }
}

function puzzleSolved() {
    clearInterval(timerInterval);
    isTimeUp = true;
    message.textContent = "🎉 Congratulations! You have solved the puzzle! 🎉";
    message.style.color = '#27ae60';

    let duration = 2000;
    let end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
}


// Reset the board
function resetBoard() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => square.textContent = '');
    message.textContent = 'Place 8 queens';
    message.style.color = '#333';
    isTimeUp = false;
    timerStarted = false; // Reset the timer flag
    queenCount = 0; // Reset queen count
    renderTimerUI();
    startTimer();
}

// Initialize the board
createBoard();

// Reset button
resetButton.addEventListener('click', resetBoard);

// =========================
// TIMER LOGIC
// =========================

const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;

const COLOR_CODES = {
    info: {
        color: "green"
    },
    warning: {
        color: "orange",
        threshold: WARNING_THRESHOLD
    },
    alert: {
        color: "red",
        threshold: ALERT_THRESHOLD
    }
};

const TIME_LIMIT = 90;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
let remainingPathColor = COLOR_CODES.info.color;

function renderTimerUI() {
    document.getElementById("timer").innerHTML = `
    <div class="base-timer">
      <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g class="base-timer__circle">
          <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
          <path
            id="base-timer-path-remaining"
            stroke-dasharray="283"
            class="base-timer__path-remaining ${remainingPathColor}"
            d="
              M 50, 50
              m -45, 0
              a 45,45 0 1,0 90,0
              a 45,45 0 1,0 -90,0
            "
          ></path>
        </g>
      </svg>
      <span id="base-timer-label" class="base-timer__label">${formatTime(timeLeft)}</span>
    </div>
    `;
}

function onTimesUp() {
    clearInterval(timerInterval);
    isTimeUp = true;
    message.textContent = "Time's up!";
    message.style.color = '#e74c3c';
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval); // Clear previous interval
    timePassed = 0;
    timeLeft = TIME_LIMIT;
    isTimeUp = false;
    setRemainingPathColor(timeLeft);
    setCircleDasharray();
    document.getElementById("base-timer-label").textContent = formatTime(timeLeft);
    timerInterval = setInterval(() => {
        timePassed += 1;
        timeLeft = TIME_LIMIT - timePassed;
        document.getElementById("base-timer-label").textContent = formatTime(timeLeft);
        setCircleDasharray();
        setRemainingPathColor(timeLeft);

        if (timeLeft <= 0) {
            onTimesUp();
        }
    }, 1000);
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;

    if (seconds < 10) {
        seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
}

function setRemainingPathColor(timeLeft) {
    const { alert, warning, info } = COLOR_CODES;
    const path = document.getElementById("base-timer-path-remaining");
    path.classList.remove(info.color, warning.color, alert.color);

    if (timeLeft <= alert.threshold) {
        path.classList.add(alert.color);
    } else if (timeLeft <= warning.threshold) {
        path.classList.add(warning.color);
    } else {
        path.classList.add(info.color);
    }
}

function calculateTimeFraction() {
    const rawTimeFraction = timeLeft / TIME_LIMIT;
    return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
    const circleDasharray = `${(
        calculateTimeFraction() * FULL_DASH_ARRAY
    ).toFixed(0)} 283`;
    document
        .getElementById("base-timer-path-remaining")
        .setAttribute("stroke-dasharray", circleDasharray);
}

// Start on load
renderTimerUI();
