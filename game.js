const words = [
  { letters: 'ELUCDSHE', answer: 'SCHEDULE' },
  { letters: 'MAET', answer: 'TEAM' },
  { letters: 'DAGANE', answer: 'AGENDA' },
  { letters: 'ELOR', answer: 'ROLE' },
  { letters: 'KATS', answer: 'TASK' }
];
const ROUND_SECONDS = 45;
const screens = [...document.querySelectorAll('.screen')];
const card = document.querySelector('#puzzle-card');
const input = document.querySelector('#answer-input');
const form = document.querySelector('#answer-form');
const feedback = document.querySelector('#card-feedback');
const checkButton = form.querySelector('button');
const timerWrap = document.querySelector('#timer-wrap');
const timerValue = document.querySelector('#timer-value');
const timerProgress = document.querySelector('#timer-progress');
const toast = document.querySelector('#toast');
const CIRCUMFERENCE = 2 * Math.PI * 25;

let currentIndex = 0;
let remaining = ROUND_SECONDS;
let timerId = null;
let deadline = 0;
let transitionId = null;
let transitioning = false;
let toastTimer = null;

timerProgress.style.strokeDasharray = String(CIRCUMFERENCE);
timerProgress.style.strokeDashoffset = '0';

function clearRoundTimers() {
  if (timerId !== null) window.clearInterval(timerId);
  if (transitionId !== null) window.clearTimeout(transitionId);
  timerId = null;
  transitionId = null;
}

function showScreen(id) {
  screens.forEach((screen) => {
    const active = screen.id === id;
    screen.classList.toggle('active', active);
    screen.setAttribute('aria-hidden', String(!active));
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress(completed = currentIndex) {
  const count = Math.min(words.length, completed);
  document.querySelector('#word-count').textContent = `WORD ${Math.min(currentIndex + 1, words.length)} OF ${words.length}`;
  document.querySelector('#progress-label').textContent = `${count} OF ${words.length} COMPLETE`;
  document.querySelector('#progress-fill').style.width = `${(count / words.length) * 100}%`;
  document.querySelector('.progress-track').setAttribute('aria-valuenow', String(count));
}

function updateTimerDisplay() {
  const ratio = remaining / ROUND_SECONDS;
  timerValue.textContent = String(remaining).padStart(2, '0');
  timerProgress.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - ratio));
  timerWrap.classList.toggle('is-low', remaining <= 15 && remaining > 5);
  timerWrap.classList.toggle('is-critical', remaining <= 5);
}

function startTimer() {
  clearInterval(timerId);
  remaining = ROUND_SECONDS;
  deadline = Date.now() + ROUND_SECONDS * 1000;
  timerWrap.classList.remove('is-low', 'is-critical');
  updateTimerDisplay();
  timerId = window.setInterval(() => {
    remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    updateTimerDisplay();
    if (remaining === 0) handleTimeout();
  }, 200);
}

function renderWord() {
  clearRoundTimers();
  transitioning = false;
  const word = words[currentIndex];
  if (!word) {
    finishGame();
    return;
  }
  card.classList.remove('is-correct', 'is-wrong', 'is-time-up');
  document.querySelector('#card-number').textContent = `WORD ${String(currentIndex + 1).padStart(2, '0')}`;
  document.querySelector('#scrambled').innerHTML = [...word.letters].map((letter, index) => `<span class="scramble-letter" style="--i:${index}">${letter}</span>`).join('');
  document.querySelector('#scrambled').setAttribute('aria-label', `Scrambled letters ${[...word.letters].join(' ')}`);
  input.value = '';
  input.disabled = false;
  checkButton.disabled = false;
  feedback.textContent = 'Take a breath. You’ve got this. ✦';
  updateProgress(currentIndex);
  startTimer();
  window.setTimeout(() => input.focus({ preventScroll: true }), 80);
}

function advanceAfterFeedback(completed) {
  if (transitioning) return;
  transitioning = true;
  updateProgress(completed);
  transitionId = window.setTimeout(() => {
    transitionId = null;
    currentIndex += 1;
    if (currentIndex >= words.length) finishGame();
    else renderWord();
  }, 1350);
}

function handleTimeout() {
  clearInterval(timerId);
  timerId = null;
  remaining = 0;
  updateTimerDisplay();
  if (transitioning) return;
  card.classList.add('is-time-up');
  input.disabled = true;
  checkButton.disabled = true;
  feedback.textContent = 'TIME’S UP! Take a breath — the next word is waiting. ✦';
  advanceAfterFeedback(currentIndex + 1);
}

function checkAnswer(event) {
  event.preventDefault();
  if (transitioning || timerId === null) return;
  if (Date.now() >= deadline) {
    remaining = 0;
    updateTimerDisplay();
    handleTimeout();
    return;
  }
  const answer = input.value.trim().replace(/\s+/g, '').toUpperCase();
  if (answer === words[currentIndex].answer) {
    clearInterval(timerId);
    timerId = null;
    card.classList.add('is-correct');
    input.disabled = true;
    checkButton.disabled = true;
    feedback.textContent = ['Brilliant! SCHEDULE is solved! ✦', 'Yes! TEAM is solved! ✦', 'Nailed it! AGENDA is solved! ✦', 'Lovely work! ROLE is solved! ✦', 'Perfect! TASK is solved! ✦'][currentIndex];
    advanceAfterFeedback(currentIndex + 1);
  } else {
    card.classList.remove('is-wrong');
    void card.offsetWidth;
    card.classList.add('is-wrong');
    feedback.textContent = answer ? 'Not quite yet. Give those letters another look!' : 'Type your best guess first. You’ve got this!';
    if (navigator.vibrate) navigator.vibrate(70);
  }
}

function resetGame() {
  clearRoundTimers();
  currentIndex = 0;
  remaining = ROUND_SECONDS;
  transitioning = false;
  renderWord();
  showScreen('challenge');
}

function restartRevealAnimation() {
  document.querySelectorAll('.reveal-letters span').forEach((letter) => {
    letter.style.animation = 'none';
  });
  void document.querySelector('.reveal-letters').offsetWidth;
  document.querySelectorAll('.reveal-letters span').forEach((letter) => {
    letter.style.removeProperty('animation');
  });
}

function finishGame() {
  clearRoundTimers();
  transitioning = false;
  updateProgress(words.length);
  restartRevealAnimation();
  showScreen('reveal');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2600);
}

form.addEventListener('submit', checkAnswer);
document.querySelector('#play-button').addEventListener('click', resetGame);
document.querySelector('#reset-button').addEventListener('click', resetGame);
document.querySelector('#message-button').addEventListener('click', () => showScreen('final'));
document.querySelector('#play-again').addEventListener('click', () => {
  showToast('A fresh start. You’ve got this! ✦');
  resetGame();
});
document.querySelector('[data-home]').addEventListener('click', (event) => {
  event.preventDefault();
  clearRoundTimers();
  currentIndex = 0;
  transitioning = false;
  updateProgress(0);
  showScreen('welcome');
});
