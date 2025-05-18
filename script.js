// DOM elements
const startBtn = document.getElementById("start-btn");
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const flashcardScreen = document.getElementById("flashcard-screen");
const questionText = document.getElementById("question-text");
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");
const scoreText = document.getElementById("score-text");
const knowBtn = document.getElementById("know-btn");
const dontknowBtn = document.getElementById("dontknow-btn");
const retryBtn = document.getElementById("retry-btn");
const reviewBtn = document.getElementById("review-btn");
const exitReviewBtn = document.getElementById("exit-review-btn");
const answerBox = document.getElementById("answer-box");
const nextBtn = document.getElementById("next-btn");
const timerDisplay = document.getElementById("timer");

// Sounds
// Note: Make sure you have these audio elements in your HTML or comment these out if not used
const soundStart = document.getElementById("sound-start");
const soundCorrect = document.getElementById("sound-correct");
const soundWrong = document.getElementById("sound-wrong");
const soundNext = document.getElementById("sound-next");

function playSound(sound) {
  if (sound) {
    sound.currentTime = 0;
    sound.play();
  }
}

function increaseDifficulty() {
  if (currentDifficulty === "easy" && mediumQuestions.length > 0) {
    currentDifficulty = "medium";
  } else if (currentDifficulty === "medium" && hardQuestions.length > 0) {
    currentDifficulty = "hard";
  }
}

function decreaseDifficulty() {
  if (currentDifficulty === "hard" && mediumQuestions.length > 0) {
    currentDifficulty = "medium";
  } else if (currentDifficulty === "medium" && easyQuestions.length > 0) {
    currentDifficulty = "easy";
  }
}

// Question Bank
let questions = [
  { question: "What is HTML?", answer: "HyperText Markup Language", difficulty: "easy" },
  { question: "What is a div in HTML?", answer: "A container element", difficulty: "easy" },
  { question: "What does CSS stand for?", answer: "Cascading Style Sheets", difficulty: "medium" },
  { question: "What is a CSS Flexbox?", answer: "A layout model for distributing space", difficulty: "medium" },
  { question: "Explain closures in JavaScript", answer: "A function that remembers its scope", difficulty: "hard" },
  { question: "What is the Event Loop?", answer: "A mechanism to handle asynchronous code", difficulty: "hard" }
];

let easyQuestions = questions.filter(q => q.difficulty === 'easy');
let mediumQuestions = questions.filter(q => q.difficulty === 'medium');
let hardQuestions = questions.filter(q => q.difficulty === 'hard');

// State Variables
let currentQuestionObj = null;
let askedQuestions = [];
let currentDifficulty = "medium";
let score = 0;
let wrongAnswers = [];

startBtn.onclick = () => {
  playSound(soundStart);
  startScreen.classList.remove("active");
  quizScreen.classList.add("active");
  loadQuestion();
};

const retryFullBtn = document.getElementById("retry-full-btn");
const retryWrongBtn = document.getElementById("retry-wrong-btn");

retryFullBtn.onclick = () => {
  resetQuiz({ retryWrongOnly: false });
};

retryWrongBtn.onclick = () => {
  resetQuiz({ retryWrongOnly: true });
};

function resetQuiz({ retryWrongOnly }) {
  clearInterval(timer);
  timeLeft = 15;
  score = 0;
  askedQuestions = [];
  currentDifficulty = "medium";

  if (retryWrongOnly && wrongAnswers.length > 0) {
    questions = [...wrongAnswers];
  } else {
    questions = [
      { question: "What is HTML?", answer: "HyperText Markup Language", difficulty: "easy" },
      { question: "What is a div in HTML?", answer: "A container element", difficulty: "easy" },
      { question: "What does CSS stand for?", answer: "Cascading Style Sheets", difficulty: "medium" },
      { question: "What is a CSS Flexbox?", answer: "A layout model for distributing space", difficulty: "medium" },
      { question: "Explain closures in JavaScript", answer: "A function that remembers its scope", difficulty: "hard" },
      { question: "What is the Event Loop?", answer: "A mechanism to handle asynchronous code", difficulty: "hard" }
    ];
  }

  easyQuestions = questions.filter(q => q.difficulty === 'easy');
  mediumQuestions = questions.filter(q => q.difficulty === 'medium');
  hardQuestions = questions.filter(q => q.difficulty === 'hard');
  wrongAnswers = [];

  resultScreen.classList.remove("active");
  startScreen.classList.add("active");
}

reviewBtn.onclick = () => {
  loadFlashcards();
};

exitReviewBtn.onclick = () => {
  flashcardScreen.classList.remove("active");
  startScreen.classList.add("active");
};

function getQuestionByDifficulty(level) {
  const pools = {
    easy: easyQuestions,
    medium: mediumQuestions,
    hard: hardQuestions
  };
  const available = pools[level].filter(q => !askedQuestions.includes(q));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function selectNextQuestion() {
  let question = getQuestionByDifficulty(currentDifficulty);

  if (!question) {
    // Try other pools
    const levels = ["easy", "medium", "hard"];
    for (let level of levels) {
      if (level !== currentDifficulty) {
        question = getQuestionByDifficulty(level);
        if (question) {
          currentDifficulty = level; // Switch difficulty to available one
          break;
        }
      }
    }
  }

  return question || null;
}

function loadQuestion() {
  currentQuestionObj = selectNextQuestion();

  if (!currentQuestionObj) {
    quizScreen.classList.remove("active");
    resultScreen.classList.add("active");
    scoreText.textContent = `You scored ${score} out of ${askedQuestions.length}`;
    showConfetti();
    showCongratsBanner();
    resetTimer();

    const congratsSound = document.getElementById("sound-congrats");
    if (congratsSound) {
      congratsSound.currentTime = 0;
      congratsSound.play();
    }
    return;
  }

  askedQuestions.push(currentQuestionObj);

  questionText.style.opacity = "0";
  questionText.style.animationName = "none";
  void questionText.offsetWidth;
  questionText.textContent = currentQuestionObj.question;
  questionText.style.animationName = "fadeSlideUp";
  questionText.style.opacity = "1";

  progressText.textContent = `Question ${askedQuestions.length} of ${questions.length}`;
  progressFill.style.width = `${(askedQuestions.length / questions.length) * 100}%`;
  answerBox.style.display = "none";
  answerBox.innerHTML = "";
  knowBtn.style.display = "inline-block";
  dontknowBtn.style.display = "inline-block";
  nextBtn.style.display = "none";
  clearInterval(timer);
  startTimer();
}

knowBtn.onclick = () => {
  playSound(soundCorrect);
  score++;
  clearInterval(timer);
  increaseDifficulty();   // <-- call here
  loadQuestion();
};

dontknowBtn.onclick = handleDontKnow;

function handleDontKnow() {
  clearInterval(timer);
  playSound(soundWrong);
  wrongAnswers.push(currentQuestionObj);

  decreaseDifficulty();

  answerBox.innerHTML = `
    <p style="margin: 0;">
      <strong style="color: #2980b9;">Correct Answer:</strong><br>
      ${currentQuestionObj.answer}
    </p>
  `;
  answerBox.style.display = "block";
  answerBox.classList.remove("bounceFadeSlide");
  void answerBox.offsetWidth;
  answerBox.classList.add("bounceFadeSlide");

  knowBtn.style.display = "none";
  dontknowBtn.style.display = "none";
  nextBtn.style.display = "inline-block";
}

nextBtn.onclick = () => {
  playSound(soundNext);
  clearInterval(timer);
  loadQuestion();
};

function loadFlashcards() {
  const container = document.getElementById("flashcard-container");
  container.innerHTML = "";

  wrongAnswers.forEach((q, index) => {
    const card = document.createElement("div");
    card.className = "flashcard";
    card.innerHTML = `
      <div class="flashcard-content">
        <p><strong>Q${index + 1}:</strong> ${q.question}</p>
        <p><strong>Answer:</strong> ${q.answer}</p>
      </div>
    `;
    container.appendChild(card);
  });

  resultScreen.classList.remove("active");
  flashcardScreen.classList.add("active");
}

function showConfetti() {
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  confetti({ particleCount: 80, angle: 70, spread: 70, origin: { x: 0, y: 0.6 } });
  confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.6 } });
}

function showCongratsBanner() {
  const banner = document.getElementById("congrats-banner");
  banner.classList.remove("hidden");
  banner.style.opacity = "1";
  banner.style.animation = "fadePopUp 0.6s ease-out";

  setTimeout(() => {
    banner.style.opacity = "0";
    setTimeout(() => banner.classList.add("hidden"), 500);
  }, 3500);
}

let totalTime = 15;
let timer;
let timeLeft;

function startTimer() {
  totalTime = 15;
  timeLeft = totalTime;
  updateTimerDisplay();

  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timer);
      handleDontKnow();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const circle = document.querySelector(".timer-fg");
  const offset = 283 - (timeLeft / totalTime) * 283;
  circle.style.strokeDashoffset = offset;

  // Change color based on time
  if (timeLeft <= 5) {
    circle.style.stroke = "#e74c3c"; // red
  } else if (timeLeft <= 10) {
    circle.style.stroke = "#f39c12"; // yellow
  } else {
    circle.style.stroke = "#27ae60"; // green
  }

  // Update the visible numeric timer inside <span id="timer">
  timerDisplay.textContent = timeLeft;
}

function resetTimer() {
  clearInterval(timer);
  timerDisplay.textContent = "";
}
const icons = ["🎓", "📚", "✏️", "💡", "🔬", "📐", "🧮", "📖"];
const liveBg = document.getElementById("live-bg");

function createFloatingIcon() {
  const icon = document.createElement("div");
  icon.classList.add("floating-icon");
  icon.textContent = icons[Math.floor(Math.random() * icons.length)];

  // Random horizontal start
  icon.style.left = `${Math.random() * 100}vw`;

  // Random vertical start below the viewport (so they float up into view)
  icon.style.top = `110vh`;

  // Random size
  const size = 16 + Math.random() * 24;
  icon.style.fontSize = `${size}px`;

  // Random animation duration
  const duration = 15 + Math.random() * 15;

  icon.style.animation = `floatUp ${duration}s linear forwards`;

  liveBg.appendChild(icon);

  // Remove icon when animation ends
  icon.addEventListener("animationend", () => {
    liveBg.removeChild(icon);
  });
}

// Create multiple floating icons continuously
setInterval(createFloatingIcon, 800);
function animateButtonClick(button) {
  button.style.transform = "scale(0.9)";
  setTimeout(() => {
    button.style.transform = "";
  }, 150);
}

// Usage example:
knowBtn.addEventListener('click', () => {
  animateButtonClick(knowBtn);
  // your existing code...
});

dontknowBtn.addEventListener('click', () => {
  animateButtonClick(dontknowBtn);
  // your existing code...
});

