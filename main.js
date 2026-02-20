const numbersWrap = document.getElementById("numbers");
const generateBtn = document.getElementById("generateBtn");
const resetBtn = document.getElementById("resetBtn");

const COLOR_PALETTE = [
  "linear-gradient(145deg, #f8b26a, #e3743b)",
  "linear-gradient(145deg, #6ec6ff, #3a8bd4)",
  "linear-gradient(145deg, #7bd389, #2f8f5b)",
  "linear-gradient(145deg, #f86d6d, #d23f4b)",
  "linear-gradient(145deg, #b58df1, #7b50d6)",
  "linear-gradient(145deg, #f7d36a, #d4a43a)",
];

function pickNumbers() {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  const picked = [];

  while (picked.length < 6) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }

  return picked.sort((a, b) => a - b);
}

function renderNumbers(numbers) {
  numbersWrap.innerHTML = "";

  numbers.forEach((num, index) => {
    const ball = document.createElement("div");
    ball.className = "ball reveal";
    ball.textContent = num;
    ball.style.background = COLOR_PALETTE[index % COLOR_PALETTE.length];
    ball.style.animationDelay = `${index * 0.08}s`;
    numbersWrap.appendChild(ball);
  });
}

function resetNumbers() {
  numbersWrap.innerHTML = "";
  for (let i = 0; i < 6; i += 1) {
    const ball = document.createElement("div");
    ball.className = "ball placeholder";
    ball.textContent = "?";
    numbersWrap.appendChild(ball);
  }
}

generateBtn.addEventListener("click", () => {
  const numbers = pickNumbers();
  renderNumbers(numbers);
});

resetBtn.addEventListener("click", () => {
  resetNumbers();
});

resetNumbers();
