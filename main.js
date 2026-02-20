const numbersWrap = document.getElementById("numbers");
const generateBtn = document.getElementById("generateBtn");
const resetBtn = document.getElementById("resetBtn");
const themeToggle = document.getElementById("themeToggle");
const tmStart = document.getElementById("tmStart");
const tmStatus = document.getElementById("tmStatus");
const tmResult = document.getElementById("tmResult");
const tmLabelContainer = document.getElementById("label-container");

const COLOR_PALETTE = [
  "linear-gradient(145deg, #f8b26a, #e3743b)",
  "linear-gradient(145deg, #6ec6ff, #3a8bd4)",
  "linear-gradient(145deg, #7bd389, #2f8f5b)",
  "linear-gradient(145deg, #f86d6d, #d23f4b)",
  "linear-gradient(145deg, #b58df1, #7b50d6)",
  "linear-gradient(145deg, #f7d36a, #d4a43a)",
];

const THEME_KEY = "lotto-theme";
const TM_URL = "https://teachablemachine.withgoogle.com/models/rQ1sOL0yJ/";

let tmModel;
let tmWebcam;
let tmMaxPredictions = 0;
let tmRunning = false;

function applyTheme(mode) {
  document.body.classList.toggle("dark", mode === "dark");
  themeToggle.setAttribute("aria-pressed", mode === "dark");
  themeToggle.textContent = mode === "dark" ? "라이트 모드" : "다크 모드";
}

function getInitialTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function toggleTheme() {
  const next = document.body.classList.contains("dark") ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

async function initTeachableMachine() {
  if (tmRunning) {
    return;
  }

  tmRunning = true;
  tmStart.disabled = true;
  tmStart.textContent = "카메라 준비중...";
  tmStatus.textContent = "모델을 불러오는 중입니다.";

  const modelURL = `${TM_URL}model.json`;
  const metadataURL = `${TM_URL}metadata.json`;

  try {
    tmModel = await tmImage.load(modelURL, metadataURL);
    tmMaxPredictions = tmModel.getTotalClasses();

    const flip = true;
    tmWebcam = new tmImage.Webcam(260, 260, flip);
    await tmWebcam.setup();
    await tmWebcam.play();
    window.requestAnimationFrame(tmLoop);

    const webcamContainer = document.getElementById("webcam-container");
    webcamContainer.innerHTML = "";
    webcamContainer.appendChild(tmWebcam.canvas);

    tmLabelContainer.innerHTML = "";
    for (let i = 0; i < tmMaxPredictions; i += 1) {
      const row = document.createElement("div");
      row.className = "label-item";
      row.innerHTML = `
        <strong>클래스</strong>
        <div class="label-bar"><span></span></div>
        <div class="label-score">0%</div>
      `;
      tmLabelContainer.appendChild(row);
    }

    tmStatus.textContent = "카메라가 실행되었습니다.";
    tmStart.textContent = "실행중";
  } catch (error) {
    tmStatus.textContent = "카메라 접근 또는 모델 로딩에 실패했습니다.";
    tmStart.disabled = false;
    tmStart.textContent = "다시 시도";
    tmRunning = false;
  }
}

async function tmLoop() {
  if (!tmWebcam) {
    return;
  }
  tmWebcam.update();
  await tmPredict();
  window.requestAnimationFrame(tmLoop);
}

async function tmPredict() {
  if (!tmModel || !tmWebcam) {
    return;
  }
  const prediction = await tmModel.predict(tmWebcam.canvas);

  const sorted = [...prediction].sort((a, b) => b.probability - a.probability);
  if (sorted[0]) {
    tmResult.textContent = `${sorted[0].className}상 (${(sorted[0].probability * 100).toFixed(1)}%)`;
  }

  prediction.forEach((item, index) => {
    const row = tmLabelContainer.children[index];
    if (!row) {
      return;
    }
    const label = row.querySelector("strong");
    const bar = row.querySelector(".label-bar span");
    const score = row.querySelector(".label-score");
    const pct = Math.round(item.probability * 100);
    label.textContent = item.className;
    bar.style.width = `${pct}%`;
    score.textContent = `${pct}%`;
  });
}

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

themeToggle.addEventListener("click", toggleTheme);
tmStart.addEventListener("click", initTeachableMachine);

resetNumbers();

applyTheme(getInitialTheme());
