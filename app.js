(function () {
  "use strict";

  const TOTAL_DAYS = 60;
  const QUESTIONS_PER_DAY = 10;
  const STORAGE_KEY = "feffmath-progress-v1";
  const ANSWERS_KEY = "feffmath-answers-v1";
  const EPSILON = 0.000001;
  const stickerRewards = ["⭐", "🐾", "🐟", "🧶", "🧁", "🌈", "🎀", "💎", "🌻", "✨"];
  const catFacts = [
    "Cats can jump up to 6 times their height.",
    "A slow blink is a cat way of saying everything is okay.",
    "Cats use their whiskers to measure tiny spaces.",
    "A cat nap can still be serious research.",
    "Most cats have 18 toes, but some have bonus beans.",
    "Cats can rotate their ears like tiny satellite dishes.",
    "A cat purr can mean happy, sleepy, or please keep patting.",
    "Cats walk on their toes like quiet little dancers.",
    "Blue-eyed cats often look extra dramatic in sunlight.",
    "A fluffy tail can be a mood report."
  ];
  const correctMessages = [
    "Correct. The cat is impressed.",
    "Perfect. Tiny paw clap.",
    "Yes. That was a sneaky one.",
    "Correct. Math snack unlocked.",
    "You got it. The cat approves."
  ];
  const retryMessages = [
    "Nearly. The cat tilted her head.",
    "Try again. She thinks a hint may help.",
    "Almost. One more careful look.",
    "Not yet. The cat is staying curious.",
    "Close. Check the sign and try again."
  ];

  const categories = [
    makeEquationQuestion,
    makeFractionQuestion,
    makePercentageQuestion,
    makeNegativeQuestion,
    makeAlgebraQuestion,
    makePowerQuestion,
    makeDecimalQuestion,
    makeRatioQuestion,
    makeMeasurementQuestion,
    makePatternQuestion
  ];

  const edgeQuestions = [
    {
      topic: "Negative exponents",
      prompt: "What is 2^-1?",
      answer: numberAnswer(0.5, "1/2 or 0.5"),
      hint: "A negative exponent means reciprocal.",
      explanation: "2^-1 means 1/2, which is the same as 0.5."
    },
    {
      topic: "Zero powers",
      prompt: "What is 3^0?",
      answer: numberAnswer(1, "1"),
      hint: "Any non-zero number to the power of 0 equals 1.",
      explanation: "3 is not zero, so 3^0 = 1."
    },
    {
      topic: "Negative exponents",
      prompt: "What is 10^-2?",
      answer: numberAnswer(0.01, "1/100 or 0.01"),
      hint: "Move 10^2 to the denominator.",
      explanation: "10^-2 = 1 / 10^2 = 1/100 = 0.01."
    },
    {
      topic: "Trap question",
      prompt: "What is -4^2?",
      answer: numberAnswer(-16, "-16"),
      hint: "The power happens before the minus sign.",
      explanation: "-4^2 means -(4^2), so the answer is -16."
    },
    {
      topic: "Trap question",
      prompt: "What is (-4)^2?",
      answer: numberAnswer(16, "16"),
      hint: "The brackets make the negative number the base.",
      explanation: "(-4)^2 = (-4) x (-4) = 16."
    },
    {
      topic: "Factorials",
      prompt: "What is 0!?",
      answer: numberAnswer(1, "1"),
      hint: "This is a special rule.",
      explanation: "0! is defined as 1. It helps factorial patterns work neatly."
    },
    {
      topic: "Fractions",
      prompt: "Simplify 0/9.",
      answer: numberAnswer(0, "0"),
      hint: "Zero shared between 9 parts is still zero.",
      explanation: "0 divided by any non-zero number is 0."
    },
    {
      topic: "Undefined",
      prompt: "What is 5/0?",
      answer: specialAnswer(["undefined", "not defined", "impossible", "cannot divide by zero"], "undefined"),
      hint: "Division by zero is not allowed.",
      explanation: "5/0 is undefined because you cannot divide a number into zero equal groups."
    },
    {
      topic: "Negative fractions",
      prompt: "Simplify -3/6.",
      answer: numberAnswer(-0.5, "-1/2 or -0.5"),
      hint: "Simplify 3/6 first, then keep the negative sign.",
      explanation: "-3/6 simplifies to -1/2."
    },
    {
      topic: "Negative fractions",
      prompt: "Simplify 3/-6.",
      answer: numberAnswer(-0.5, "-1/2 or -0.5"),
      hint: "One negative sign makes the whole fraction negative.",
      explanation: "3/-6 simplifies to -1/2."
    },
    {
      topic: "Negative fractions",
      prompt: "Simplify -3/-6.",
      answer: numberAnswer(0.5, "1/2 or 0.5"),
      hint: "Two negatives make a positive.",
      explanation: "-3/-6 simplifies to positive 1/2."
    },
    {
      topic: "Ratios",
      prompt: "Simplify the ratio 0:5.",
      answer: ratioAnswer(0, 1, "0:1"),
      hint: "Divide both parts by 5.",
      explanation: "0:5 simplifies to 0:1. A zero part is allowed in a ratio."
    },
    {
      topic: "Ratios",
      prompt: "Simplify the ratio 12:0.",
      answer: ratioAnswer(1, 0, "1:0"),
      hint: "Divide both parts by 12. Do not treat this as 12 divided by 0.",
      explanation: "12:0 simplifies to 1:0. This is a ratio, not the calculation 12 / 0."
    },
    {
      topic: "Double negatives",
      prompt: "What is 5 - -3?",
      answer: numberAnswer(8, "8"),
      hint: "Subtracting a negative is the same as adding.",
      explanation: "5 - -3 = 5 + 3 = 8."
    },
    {
      topic: "Negative numbers",
      prompt: "What is -6 x -4?",
      answer: numberAnswer(24, "24"),
      hint: "A negative times a negative is positive.",
      explanation: "-6 x -4 = 24."
    },
    {
      topic: "Negative numbers",
      prompt: "What is -24 / 6?",
      answer: numberAnswer(-4, "-4"),
      hint: "A negative divided by a positive is negative.",
      explanation: "-24 / 6 = -4."
    },
    {
      topic: "Careful powers",
      prompt: "What is 0^0 usually treated as in Year 7?",
      answer: specialAnswer(["undefined", "indeterminate", "usually undefined", "avoid", "not defined"], "undefined or indeterminate"),
      hint: "This is a special case that is usually avoided at this level.",
      explanation: "0^0 is usually avoided or called undefined/indeterminate in Year 7 maths. It needs more advanced context."
    },
    {
      topic: "Reciprocals",
      prompt: "What is the reciprocal of 5?",
      answer: numberAnswer(0.2, "1/5 or 0.2"),
      hint: "The reciprocal of a number is 1 divided by that number.",
      explanation: "The reciprocal of 5 is 1/5, which equals 0.2."
    },
    {
      topic: "Decimals",
      prompt: "Write 0.125 as a fraction in simplest form.",
      answer: numberAnswer(0.125, "1/8"),
      hint: "0.125 is 125/1000 before simplifying.",
      explanation: "0.125 = 125/1000 = 1/8."
    },
    {
      topic: "Percentages",
      prompt: "A $40 cat cushion is reduced by 25%. What is the new price?",
      answer: numberAnswer(30, "$30"),
      hint: "25% of 40 is 10, then subtract it.",
      explanation: "25% of 40 is 10, so the new price is 40 - 10 = 30."
    }
  ];

  const days = buildDays();
  let progress = {};
  let savedAnswers = {};
  let currentDay = 1;
  let daySelect;
  let dayGrid;
  let dayTitle;
  let questionList;
  let scoreText;
  let progressText;
  let progressBar;
  let encouragement;
  let totalCorrectText;
  let headerStickerTrail;
  let albumCount;
  let stickerGrid;
  let nextStickerText;
  let buddyBubble;
  let buddyCat;
  let missionBar;
  let missionText;
  let missionRewardText;
  let mysteryBox;
  let mysteryText;
  let catFactText;

  globalThis.FEFF_MATH_DAYS = days;
  globalThis.FEFF_MATH_TEST = { isCorrect };

  if (typeof document !== "undefined") {
    progress = loadJson(STORAGE_KEY, {});
    savedAnswers = loadJson(ANSWERS_KEY, {});
    daySelect = document.getElementById("daySelect");
    dayGrid = document.getElementById("dayGrid");
    dayTitle = document.getElementById("dayTitle");
    questionList = document.getElementById("questionList");
    scoreText = document.getElementById("scoreText");
    progressText = document.getElementById("progressText");
    progressBar = document.getElementById("progressBar");
    encouragement = document.getElementById("encouragement");
    totalCorrectText = document.getElementById("totalCorrectText");
    headerStickerTrail = document.getElementById("headerStickerTrail");
    albumCount = document.getElementById("albumCount");
    stickerGrid = document.getElementById("stickerGrid");
    nextStickerText = document.getElementById("nextStickerText");
    buddyBubble = document.getElementById("buddyBubble");
    buddyCat = document.getElementById("buddyCat");
    missionBar = document.getElementById("missionBar");
    missionText = document.getElementById("missionText");
    missionRewardText = document.getElementById("missionRewardText");
    mysteryBox = document.getElementById("mysteryBox");
    mysteryText = document.getElementById("mysteryText");
    catFactText = document.getElementById("catFactText");
    initialise();
  }

  function initialise() {
    renderDayControls();
    renderDay(1);
  }

  function buildDays() {
    return Array.from({ length: TOTAL_DAYS }, (_, dayIndex) => {
      const day = dayIndex + 1;
      const edgeIndex = (day - 1) % edgeQuestions.length;
      const edgeSlot = (day * 3 + 1) % QUESTIONS_PER_DAY;
      const questions = Array.from({ length: QUESTIONS_PER_DAY }, (_, slot) => {
        if (slot === edgeSlot) {
          return { ...edgeQuestions[edgeIndex], id: `d${day}-q${slot + 1}` };
        }
        const category = categories[(slot + dayIndex) % categories.length];
        return { ...category(day, slot), id: `d${day}-q${slot + 1}` };
      });
      return { day, questions };
    });
  }

  function renderDayControls() {
    daySelect.innerHTML = "";
    dayGrid.innerHTML = "";

    days.forEach((day) => {
      const option = document.createElement("option");
      option.value = String(day.day);
      option.textContent = `Day ${day.day}`;
      daySelect.append(option);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "day-button";
      button.textContent = day.day;
      button.setAttribute("aria-label", `Day ${day.day}`);
      button.addEventListener("click", () => renderDay(day.day));
      dayGrid.append(button);
    });

    daySelect.addEventListener("change", () => renderDay(Number(daySelect.value)));
    updateProgress();
  }

  function renderDay(dayNumber) {
    currentDay = dayNumber;
    const day = days[dayNumber - 1];
    const answersForDay = savedAnswers[dayNumber] || {};

    daySelect.value = String(dayNumber);
    dayTitle.textContent = `Day ${dayNumber}`;
    catFactText.textContent = catFacts[(dayNumber - 1) % catFacts.length];
    buddyBubble.textContent = "Let’s do this.";
    buddyCat.innerHTML = catMascotSvg("ready");
    questionList.innerHTML = "";

    day.questions.forEach((question, index) => {
      const card = document.createElement("section");
      card.className = "question-card";
      card.dataset.questionId = question.id;

      const main = document.createElement("div");
      main.className = "question-main";
      main.innerHTML = `
        <div class="question-meta">
          <span class="question-number">${index + 1}</span>
          <span class="topic">${escapeHtml(question.topic)}</span>
        </div>
        <p class="prompt">${formatMath(question.prompt)}</p>
      `;

      const answerArea = document.createElement("div");
      answerArea.className = "answer-area";
      answerArea.innerHTML = `
        <div class="answer-row">
          <input class="answer-input" inputmode="decimal" aria-label="Answer for question ${index + 1}" placeholder="Your answer">
          <span class="status" aria-live="polite">?</span>
        </div>
        <button class="hint-button" type="button">Show hint</button>
        <p class="feedback"></p>
      `;

      const input = answerArea.querySelector(".answer-input");
      const hintButton = answerArea.querySelector(".hint-button");
      const feedback = answerArea.querySelector(".feedback");
      const status = answerArea.querySelector(".status");

      input.value = answersForDay[question.id] || "";
      input.addEventListener("input", () => {
        saveAnswer(dayNumber, question.id, input.value);
        checkQuestion(question, input, status, feedback, false);
        updateScore(dayNumber);
      });

      hintButton.addEventListener("click", () => {
        feedback.className = "feedback is-hint";
        feedback.innerHTML = formatMath(question.hint);
        buddyBubble.textContent = "Hint mode: whiskers focused.";
        buddyCat.innerHTML = catMascotSvg("thinking");
      });

      const catReaction = document.createElement("div");
      catReaction.className = "question-cat-reaction";
      catReaction.dataset.idleMood = ["happy", "heart", "job", "crown"][index % 4];
      catReaction.innerHTML = catMascotSvg(catReaction.dataset.idleMood);

      card.append(main, answerArea, catReaction);
      questionList.append(card);
      checkQuestion(question, input, status, feedback, false);
    });

    updateScore(dayNumber);
    updateSelectedDayButton();
  }

  function checkQuestion(question, input, status, feedback, forceExplanation) {
    const raw = input.value.trim();
    const card = input.closest(".question-card");
    const catReaction = card ? card.querySelector(".question-cat-reaction") : null;
    status.className = "status";
    if (card) card.classList.remove("is-correct", "is-wrong");

    if (!raw) {
      status.textContent = "?";
      if (catReaction) catReaction.innerHTML = catMascotSvg(catReaction.dataset.idleMood || "mini");
      if (forceExplanation) {
        feedback.className = "feedback";
        feedback.textContent = "";
      }
      return false;
    }

    const correct = isCorrect(raw, question.answer);
    status.classList.add(correct ? "is-correct" : "is-wrong");
    status.textContent = correct ? "✓" : "×";
    if (card) card.classList.add(correct ? "is-correct" : "is-wrong");
    if (catReaction) catReaction.innerHTML = catMascotSvg(correct ? "happy" : "thinking");
    feedback.className = `feedback ${correct ? "is-correct" : "is-wrong"}`;
    feedback.innerHTML = correct
      ? `<strong>${escapeHtml(pickLine(correctMessages, question.id))}</strong> ${formatMath(question.explanation)}`
      : `<strong>${escapeHtml(pickLine(retryMessages, question.id))}</strong> ${formatMath(question.hint)}`;
    return correct;
  }

  function updateScore(dayNumber) {
    const day = days[dayNumber - 1];
    const cards = Array.from(questionList.querySelectorAll(".question-card"));
    const correctCount = cards.reduce((count, card, index) => {
      const input = card.querySelector(".answer-input");
      return count + (isCorrect(input.value.trim(), day.questions[index].answer) ? 1 : 0);
    }, 0);

    scoreText.textContent = `${correctCount} / ${QUESTIONS_PER_DAY}`;
    totalCorrectText.textContent = `${correctCount} / ${QUESTIONS_PER_DAY}`;
    updateRewardPanel(dayNumber, correctCount);

    if (correctCount === QUESTIONS_PER_DAY) {
      progress[dayNumber] = true;
      encouragement.textContent = "Day complete. Mystery box opened and a sticker joined the album.";
    } else if (correctCount >= 7) {
      encouragement.textContent = "Good progress. The study cat is watching the last few carefully.";
      delete progress[dayNumber];
    } else if (correctCount >= 3) {
      encouragement.textContent = "Tiny win unlocked. Keep collecting paw points.";
      delete progress[dayNumber];
    } else {
      encouragement.textContent = "Take your time. Mistakes help your brain grow.";
      delete progress[dayNumber];
    }

    saveJson(STORAGE_KEY, progress);
    updateProgress();
    updateSelectedDayButton();
  }

  function updateProgress() {
    const completed = Object.values(progress).filter(Boolean).length;
    const percent = (completed / TOTAL_DAYS) * 100;
    progressText.textContent = `${completed} of ${TOTAL_DAYS} days`;
    progressBar.style.width = `${percent}%`;

    Array.from(dayGrid.children).forEach((button, index) => {
      button.classList.toggle("is-complete", Boolean(progress[index + 1]));
    });
    renderStickerAlbum(completed);
  }

  function updateSelectedDayButton() {
    Array.from(dayGrid.children).forEach((button, index) => {
      button.classList.toggle("is-selected", index + 1 === currentDay);
    });
  }

  function updateRewardPanel(dayNumber, correctCount) {
    const remaining = QUESTIONS_PER_DAY - correctCount;
    const percent = (correctCount / QUESTIONS_PER_DAY) * 100;
    missionBar.style.width = `${percent}%`;
    missionText.textContent = `${correctCount} / ${QUESTIONS_PER_DAY}`;

    if (correctCount === QUESTIONS_PER_DAY) {
      const sticker = stickerForDay(dayNumber);
      buddyBubble.textContent = "Purr-fect day. Mystery box time.";
      buddyCat.innerHTML = catMascotSvg("celebrate");
      missionRewardText.textContent = `Surprise opened: ${sticker} sticker collected.`;
      mysteryBox.classList.add("is-open");
      mysteryText.innerHTML = `You found a ${sticker} sticker and a tiny victory sparkle.`;
      return;
    }

    mysteryBox.classList.remove("is-open");
    mysteryText.textContent = "Finish the day to open it.";
    missionRewardText.textContent = `${remaining} ${remaining === 1 ? "question" : "questions"} to open your surprise.`;

    if (correctCount >= 7) {
      buddyBubble.textContent = "So close. Tail wiggle activated.";
      buddyCat.innerHTML = catMascotSvg("happy");
    } else if (correctCount >= 3) {
      buddyBubble.textContent = "Nice streak. The cat is alert.";
      buddyCat.innerHTML = catMascotSvg("ready");
    } else {
      buddyBubble.textContent = "Let’s do this.";
      buddyCat.innerHTML = catMascotSvg("ready");
    }
  }

  function renderStickerAlbum(completed) {
    const completedDays = Array.from({ length: TOTAL_DAYS }, (_, index) => index + 1).filter((day) => progress[day]);
    albumCount.textContent = `${completedDays.length} / ${TOTAL_DAYS}`;
    headerStickerTrail.innerHTML = "";
    stickerGrid.innerHTML = "";

    const headerSlots = Array.from({ length: 8 }, (_, index) => completedDays[index]);
    headerSlots.forEach((day) => {
      const sticker = document.createElement("span");
      sticker.className = `sticker-chip${day ? " is-earned" : ""}`;
      sticker.textContent = day ? stickerForDay(day) : "";
      headerStickerTrail.append(sticker);
    });

    Array.from({ length: 12 }, (_, index) => completedDays[index]).forEach((day, index) => {
      const sticker = document.createElement("span");
      sticker.className = `album-sticker${day ? " is-earned" : ""}`;
      sticker.textContent = day ? stickerForDay(day) : index === 11 ? "?" : "";
      sticker.setAttribute("aria-label", day ? `Sticker for day ${day}` : "Locked sticker");
      stickerGrid.append(sticker);
    });

    if (completed >= TOTAL_DAYS) {
      nextStickerText.textContent = "Album complete. Legendary cat scholar.";
    } else if (completed === 0) {
      nextStickerText.textContent = "Finish a day to collect the first sticker.";
    } else {
      nextStickerText.textContent = `Next surprise in ${Math.min(3, TOTAL_DAYS - completed)} day${TOTAL_DAYS - completed === 1 ? "" : "s"}.`;
    }
  }

  function stickerForDay(dayNumber) {
    return stickerRewards[(dayNumber - 1) % stickerRewards.length];
  }

  function pickLine(lines, seed) {
    const total = Array.from(seed).reduce((sum, character) => sum + character.charCodeAt(0), 0);
    return lines[total % lines.length];
  }

  function catMascotSvg(mood) {
    const imageByMood = {
      crown: "cat-mini-crown.png",
      celebrate: "cat-mini-crown.png",
      heart: "cat-mini-heart.png",
      happy: "cat-mini-happy.png",
      job: "cat-mini-job.png",
      mini: "cat-mini-happy.png",
      ready: "buddy-cat.png",
      thinking: "cat-mini-heart.png"
    };
    const file = imageByMood[mood] || imageByMood.ready;
    const sizeClass = file === "buddy-cat.png" ? "is-buddy" : "is-mini";
    return `<img class="cat-art ${sizeClass}" src="assets/${file}" alt="Cartoon cream cat with grey face and blue eyes">`;
  }

  function saveAnswer(dayNumber, questionId, value) {
    savedAnswers[dayNumber] = savedAnswers[dayNumber] || {};
    savedAnswers[dayNumber][questionId] = value;
    saveJson(ANSWERS_KEY, savedAnswers);
  }

  function isCorrect(raw, answer) {
    if (!raw) return false;

    if (answer.type === "special") {
      const normal = normaliseText(raw);
      return answer.values.some((value) => normal.includes(normaliseText(value)));
    }

    if (answer.type === "expression") {
      const normal = normaliseExpression(raw);
      return answer.values.some((value) => normal === normaliseExpression(value));
    }

    if (answer.type === "ratio") {
      const ratio = parseRatio(raw);
      if (!ratio) return false;
      return ratio.a === answer.a && ratio.b === answer.b;
    }

    const numeric = parseNumeric(raw);
    if (numeric.type === "special") return false;
    if (numeric.type !== "number") return false;
    return Math.abs(numeric.value - answer.value) < EPSILON;
  }

  function parseNumeric(raw) {
    const input = raw.trim().replace(/[−–—]/g, "-").replace(/\$/g, "");
    const specialWords = ["undefined", "not defined", "indeterminate", "impossible", "cannot divide by zero"];
    if (specialWords.some((word) => input.toLowerCase().includes(word))) {
      return { type: "special" };
    }

    const fraction = input.match(/^([+-]?\d+(?:\.\d+)?)\s*\/\s*([+-]?\d+(?:\.\d+)?)$/);
    if (fraction) {
      const numerator = Number(fraction[1]);
      const denominator = Number(fraction[2]);
      if (denominator === 0) return { type: "special" };
      return { type: "number", value: numerator / denominator };
    }

    const percent = input.match(/^([+-]?\d+(?:\.\d+)?)\s*%$/);
    if (percent) {
      return { type: "number", value: Number(percent[1]) / 100 };
    }

    const number = Number(input);
    if (Number.isFinite(number)) return { type: "number", value: number };
    return { type: "unknown" };
  }

  function parseRatio(raw) {
    const match = raw.trim().replace(/\s/g, "").match(/^([+-]?\d+):([+-]?\d+)$/);
    if (!match) return null;
    return simplifyRatio(Number(match[1]), Number(match[2]));
  }

  function normaliseText(text) {
    return text.toLowerCase().replace(/[−–—]/g, "-").replace(/\s+/g, " ").trim();
  }

  function normaliseExpression(text) {
    return text.toLowerCase().replace(/[−–—]/g, "-").replace(/\s+/g, "").replace(/\*/g, "");
  }

  function numberAnswer(value, display) {
    return { type: "number", value, display };
  }

  function specialAnswer(values, display) {
    return { type: "special", values, display };
  }

  function expressionAnswer(values, display) {
    return { type: "expression", values, display };
  }

  function ratioAnswer(a, b, display) {
    return { type: "ratio", a, b, display };
  }

  function makeEquationQuestion(day, slot) {
    const a = 3 + ((day + slot) % 9);
    const x = 2 + ((day * 2 + slot) % 10);
    const style = (day + slot) % 4;

    if (style === 0) {
      return {
        topic: "Equations",
        prompt: `Solve x + ${a} = ${x + a}.`,
        answer: numberAnswer(x, String(x)),
        hint: `Subtract ${a} from both sides.`,
        explanation: `x = ${x + a} - ${a} = ${x}.`
      };
    }

    if (style === 1) {
      return {
        topic: "Equations",
        prompt: `Solve ${a}x = ${a * x}.`,
        answer: numberAnswer(x, String(x)),
        hint: `Divide both sides by ${a}.`,
        explanation: `x = ${a * x} / ${a} = ${x}.`
      };
    }

    if (style === 2) {
      return {
        topic: "Equations",
        prompt: `Solve x - ${a} = ${x - a}.`,
        answer: numberAnswer(x, String(x)),
        hint: `Add ${a} to both sides.`,
        explanation: `x = ${x - a} + ${a} = ${x}.`
      };
    }

    return {
      topic: "Equations",
      prompt: `Solve 2x + ${a} = ${2 * x + a}.`,
      answer: numberAnswer(x, String(x)),
      hint: `Subtract ${a}, then divide by 2.`,
      explanation: `2x = ${2 * x}, so x = ${x}.`
    };
  }

  function makeFractionQuestion(day, slot) {
    const denominator = 6 + ((day + slot) % 9);
    const factor = 2 + ((day + 2 * slot) % 4);
    const numerator = (1 + ((day + slot) % (denominator - 1))) * factor;
    const fullDenominator = denominator * factor;
    const simplified = simplifyFraction(numerator, fullDenominator);
    return {
      topic: "Fractions",
      prompt: `Simplify ${numerator}/${fullDenominator}.`,
      answer: numberAnswer(simplified.n / simplified.d, formatFraction(simplified.n, simplified.d)),
      hint: `Look for a number that divides both ${numerator} and ${fullDenominator}.`,
      explanation: `${numerator}/${fullDenominator} simplifies to ${formatFraction(simplified.n, simplified.d)}.`
    };
  }

  function makePercentageQuestion(day, slot) {
    const percentOptions = [10, 12.5, 20, 25, 40, 50, 75];
    const percent = percentOptions[(day + slot) % percentOptions.length];
    const base = 40 + (((day * 7 + slot * 5) % 13) * 10);
    const style = (day + slot) % 3;

    if (style === 0) {
      const value = base * (percent / 100);
      return {
        topic: "Percentages",
        prompt: `What is ${percent}% of ${base}?`,
        answer: numberAnswer(value, formatNumber(value)),
        hint: `${percent}% means ${percent}/100.`,
        explanation: `${percent}% of ${base} is ${formatNumber(value)}.`
      };
    }

    if (style === 1) {
      const value = base * (1 + percent / 100);
      return {
        topic: "Percentages",
        prompt: `Increase ${base} by ${percent}%.`,
        answer: numberAnswer(value, formatNumber(value)),
        hint: `Find ${percent}% of ${base}, then add it.`,
        explanation: `${base} increased by ${percent}% is ${formatNumber(value)}.`
      };
    }

    const value = base * (1 - percent / 100);
    return {
      topic: "Percentages",
      prompt: `Decrease ${base} by ${percent}%.`,
      answer: numberAnswer(value, formatNumber(value)),
      hint: `Find ${percent}% of ${base}, then subtract it.`,
      explanation: `${base} decreased by ${percent}% is ${formatNumber(value)}.`
    };
  }

  function makeNegativeQuestion(day, slot) {
    const a = 2 + ((day + slot) % 10);
    const b = 1 + ((day * 3 + slot) % 9);
    const style = (day + slot) % 4;

    if (style === 0) {
      return {
        topic: "Negative numbers",
        prompt: `What is ${a} - -${b}?`,
        answer: numberAnswer(a + b, String(a + b)),
        hint: "Subtracting a negative is adding.",
        explanation: `${a} - -${b} = ${a} + ${b} = ${a + b}.`
      };
    }

    if (style === 1) {
      return {
        topic: "Negative numbers",
        prompt: `What is -${a} x ${b}?`,
        answer: numberAnswer(-a * b, String(-a * b)),
        hint: "A negative times a positive is negative.",
        explanation: `-${a} x ${b} = ${-a * b}.`
      };
    }

    if (style === 2) {
      return {
        topic: "Negative numbers",
        prompt: `What is -${a} x -${b}?`,
        answer: numberAnswer(a * b, String(a * b)),
        hint: "A negative times a negative is positive.",
        explanation: `-${a} x -${b} = ${a * b}.`
      };
    }

    return {
      topic: "Negative numbers",
      prompt: `What is ${-a * b} / ${b}?`,
      answer: numberAnswer(-a, String(-a)),
      hint: "A negative divided by a positive is negative.",
      explanation: `${-a * b} / ${b} = ${-a}.`
    };
  }

  function makeAlgebraQuestion(day, slot) {
    const coefficient = 2 + ((day + slot) % 6);
    const term = 1 + ((day * 2 + slot) % 8);
    const style = (day + slot) % 2;

    if (style === 0) {
      const constant = coefficient * term;
      return {
        topic: "Expanding brackets",
        prompt: `Expand ${coefficient}(x + ${term}).`,
        answer: expressionAnswer([`${coefficient}x+${constant}`, `${constant}+${coefficient}x`], `${coefficient}x + ${constant}`),
        hint: `Multiply both x and ${term} by ${coefficient}.`,
        explanation: `${coefficient}(x + ${term}) = ${coefficient}x + ${constant}.`
      };
    }

    const constant = coefficient * term;
    return {
      topic: "Factorisation",
      prompt: `Factorise ${coefficient}x + ${constant}.`,
      answer: expressionAnswer([`${coefficient}(x+${term})`], `${coefficient}(x + ${term})`),
      hint: `Find the common factor of ${coefficient}x and ${constant}.`,
      explanation: `Both terms share ${coefficient}, so the factorised form is ${coefficient}(x + ${term}).`
    };
  }

  function makePowerQuestion(day, slot) {
    const base = 2 + ((day + slot) % 5);
    const exponent = 2 + ((day + slot) % 3);
    const style = (day + slot) % 4;

    if (style === 0) {
      const value = base ** exponent;
      return {
        topic: "Powers",
        prompt: `What is ${base}^${exponent}?`,
        answer: numberAnswer(value, String(value)),
        hint: `Multiply ${base} by itself ${exponent} times.`,
        explanation: `${base}^${exponent} = ${value}.`
      };
    }

    if (style === 1) {
      return {
        topic: "Zero powers",
        prompt: `What is ${base}^0?`,
        answer: numberAnswer(1, "1"),
        hint: "Any non-zero number to the power of 0 is 1.",
        explanation: `${base}^0 = 1 because ${base} is not zero.`
      };
    }

    if (style === 2) {
      const value = 1 / base;
      return {
        topic: "Negative exponents",
        prompt: `What is ${base}^-1?`,
        answer: numberAnswer(value, `1/${base}`),
        hint: "A power of -1 means reciprocal.",
        explanation: `${base}^-1 = 1/${base}.`
      };
    }

    const n = 3 + ((day + slot) % 4);
    return {
      topic: "Factorials",
      prompt: `What is ${n}! ?`,
      answer: numberAnswer(factorial(n), String(factorial(n))),
      hint: `Multiply ${n} x ${n - 1} x ${n - 2} and keep going to 1.`,
      explanation: `${n}! = ${factorialExpression(n)} = ${factorial(n)}.`
    };
  }

  function makeDecimalQuestion(day, slot) {
    const pairs = [
      [0.5, "1/2"],
      [0.25, "1/4"],
      [0.75, "3/4"],
      [0.2, "1/5"],
      [0.125, "1/8"],
      [0.375, "3/8"],
      [0.04, "1/25"]
    ];
    const pair = pairs[(day + slot) % pairs.length];
    const style = (day + slot) % 2;

    if (style === 0) {
      return {
        topic: "Decimals",
        prompt: `Write ${pair[0]} as a fraction in simplest form.`,
        answer: numberAnswer(pair[0], pair[1]),
        hint: "Write the decimal over 10, 100, or 1000, then simplify.",
        explanation: `${pair[0]} = ${pair[1]}.`
      };
    }

    return {
      topic: "Decimals",
      prompt: `Write ${pair[1]} as a decimal.`,
      answer: numberAnswer(pair[0], String(pair[0])),
      hint: "Divide the top number by the bottom number.",
      explanation: `${pair[1]} = ${pair[0]}.`
    };
  }

  function makeRatioQuestion(day, slot) {
    const a = 2 + ((day + slot) % 8);
    const b = 3 + ((day * 2 + slot) % 8);
    const factor = 2 + ((day + slot) % 5);
    const style = (day + slot) % 2;

    if (style === 0) {
      const ratio = simplifyRatio(a * factor, b * factor);
      return {
        topic: "Ratios",
        prompt: `Simplify the ratio ${a * factor}:${b * factor}.`,
        answer: ratioAnswer(ratio.a, ratio.b, `${ratio.a}:${ratio.b}`),
        hint: `Divide both parts by ${factor} if you can.`,
        explanation: `${a * factor}:${b * factor} simplifies to ${ratio.a}:${ratio.b}.`
      };
    }

    const people = 3 + ((day + slot) % 5);
    const costEach = 4 + ((day * 2 + slot) % 7);
    return {
      topic: "Proportion",
      prompt: `If ${people} cat stickers cost $${people * costEach}, how much do ${people + 2} cat stickers cost?`,
      answer: numberAnswer((people + 2) * costEach, `$${(people + 2) * costEach}`),
      hint: "Find the cost of one sticker first.",
      explanation: `One sticker costs $${costEach}, so ${people + 2} stickers cost $${(people + 2) * costEach}.`
    };
  }

  function makeMeasurementQuestion(day, slot) {
    const style = (day + slot) % 4;
    const length = 4 + ((day + slot) % 11);
    const width = 3 + ((day * 2 + slot) % 9);

    if (style === 0) {
      const cm = 120 + ((day + slot) % 16) * 25;
      return {
        topic: "Measurement",
        prompt: `Convert ${cm} cm to metres.`,
        answer: numberAnswer(cm / 100, `${formatNumber(cm / 100)} m`),
        hint: "There are 100 cm in 1 m.",
        explanation: `${cm} cm = ${formatNumber(cm / 100)} m.`
      };
    }

    if (style === 1) {
      return {
        topic: "Perimeter",
        prompt: `A rectangle is ${length} cm by ${width} cm. What is its perimeter?`,
        answer: numberAnswer(2 * (length + width), `${2 * (length + width)} cm`),
        hint: "Add all four sides, or use 2 x (length + width).",
        explanation: `Perimeter = 2 x (${length} + ${width}) = ${2 * (length + width)} cm.`
      };
    }

    if (style === 2) {
      return {
        topic: "Area",
        prompt: `A rectangle is ${length} cm by ${width} cm. What is its area?`,
        answer: numberAnswer(length * width, `${length * width} cm²`),
        hint: "Area of a rectangle is length x width.",
        explanation: `Area = ${length} x ${width} = ${length * width} cm².`
      };
    }

    const height = 4 + ((day * 3 + slot) % 8);
    return {
      topic: "Area",
      prompt: `A triangle has base ${length} cm and height ${height} cm. What is its area?`,
      answer: numberAnswer((length * height) / 2, `${formatNumber((length * height) / 2)} cm²`),
      hint: "Area of a triangle is base x height ÷ 2.",
      explanation: `Area = ${length} x ${height} ÷ 2 = ${formatNumber((length * height) / 2)} cm².`
    };
  }

  function makePatternQuestion(day, slot) {
    const style = (day + slot) % 3;

    if (style === 0) {
      const start = 2 + ((day + slot) % 7);
      const step = 2 + ((day * 2 + slot) % 6);
      const sequence = [start, start + step, start + 2 * step, start + 3 * step];
      return {
        topic: "Number patterns",
        prompt: `What comes next? ${sequence.join(", ")}, ...`,
        answer: numberAnswer(start + 4 * step, String(start + 4 * step)),
        hint: `The sequence adds ${step} each time.`,
        explanation: `Add ${step} again to get ${start + 4 * step}.`
      };
    }

    if (style === 1) {
      const red = 2 + ((day + slot) % 5);
      const blue = 3 + ((day * 2 + slot) % 6);
      const total = red + blue;
      return {
        topic: "Probability",
        prompt: `A treat pouch has ${red} salmon treats and ${blue} tuna treats. What is the probability of picking salmon?`,
        answer: numberAnswer(red / total, formatFraction(simplifyFraction(red, total).n, simplifyFraction(red, total).d)),
        hint: "Probability is wanted outcomes over total outcomes.",
        explanation: `There are ${red} salmon treats out of ${total} treats, so the probability is ${formatFraction(simplifyFraction(red, total).n, simplifyFraction(red, total).d)}.`
      };
    }

    const n = 4 + ((day + slot) % 6);
    return {
      topic: "Reciprocals",
      prompt: `What is the reciprocal of ${n}?`,
      answer: numberAnswer(1 / n, `1/${n}`),
      hint: "Put 1 over the number.",
      explanation: `The reciprocal of ${n} is 1/${n}.`
    };
  }

  function simplifyFraction(n, d) {
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const divisor = gcd(Math.abs(n), Math.abs(d));
    return { n: n / divisor, d: d / divisor };
  }

  function simplifyRatio(a, b) {
    if (a === 0 && b === 0) return { a: 0, b: 0 };
    const divisor = gcd(Math.abs(a), Math.abs(b));
    return { a: a / divisor, b: b / divisor };
  }

  function gcd(a, b) {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a || 1;
  }

  function factorial(n) {
    return Array.from({ length: n }, (_, index) => index + 1).reduce((product, value) => product * value, 1);
  }

  function factorialExpression(n) {
    return Array.from({ length: n }, (_, index) => n - index).join(" x ");
  }

  function formatFraction(n, d) {
    return d === 1 ? String(n) : `${n}/${d}`;
  }

  function formatNumber(value) {
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)));
  }

  function loadJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatMath(value) {
    return escapeHtml(value).replace(/(\(?-?\d+\)?|\d*[a-z])\^(-?\d+)/gi, "$1<sup>$2</sup>");
  }
})();
