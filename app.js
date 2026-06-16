(function () {
  "use strict";

  const TOTAL_DAYS = 60;
  const QUESTIONS_PER_DAY = 10;
  const STORAGE_KEY = "feffmath-progress-v1";
  const ANSWERS_KEY = "feffmath-answers-v1";
  const CURRENT_SET_KEY = "feffmath-current-set-v1";
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

  const QUESTION_BANK_URL = "data/questions.json";
  let days = [];
  let questionBank = null;
  let progress = {};
  let savedAnswers = {};
  let currentDay = 1;
  let setLabel;
  let setTitle;
  let setSummary;
  let previousMixButton;
  let newMixButton;
  let completedSetsText;
  let topicCountText;
  let trapCountText;
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
  let notificationButton;
  let notificationPanel;
  let notificationClose;
  let notificationList;

  globalThis.FEFF_MATH_DAYS = days;
  globalThis.FEFF_MATH_TEST = { isCorrect };

  if (typeof document !== "undefined") {
    progress = loadJson(STORAGE_KEY, {});
    savedAnswers = loadJson(ANSWERS_KEY, {});
    setLabel = document.getElementById("setLabel");
    setTitle = document.getElementById("setTitle");
    setSummary = document.getElementById("setSummary");
    previousMixButton = document.getElementById("previousMixButton");
    newMixButton = document.getElementById("newMixButton");
    completedSetsText = document.getElementById("completedSetsText");
    topicCountText = document.getElementById("topicCountText");
    trapCountText = document.getElementById("trapCountText");
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
    notificationButton = document.getElementById("notificationButton");
    notificationPanel = document.getElementById("notificationPanel");
    notificationClose = document.getElementById("notificationClose");
    notificationList = document.getElementById("notificationList");
    initialise();
  }

  async function initialise() {
    renderLoadingState();
    try {
      startPractice(await loadQuestionBank());
    } catch (error) {
      console.info("Using fallback question bank.", error);
      try {
        startPractice(createFallbackQuestionBank());
      } catch (fallbackError) {
        renderQuestionLoadError(fallbackError);
      }
    }
  }

  async function loadQuestionBank() {
    const response = await fetch(QUESTION_BANK_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Could not load ${QUESTION_BANK_URL}: ${response.status}`);
    }
    return response.json();
  }

  function startPractice(bank) {
    questionBank = bank;
    days = buildDays(questionBank);
    currentDay = getInitialSetNumber();
    globalThis.FEFF_MATH_DAYS = days;
    globalThis.FEFF_MATH_TEST = { isCorrect, buildDays };
    setupNotifications();
    setupSetControls();
    renderDay(currentDay);
  }

  function createFallbackQuestionBank() {
    const number = (value, display = String(value)) => ({ type: "number", value, display });
    const ratio = (a, b, display = `${a}:${b}`) => ({ type: "ratio", a, b, display });
    const expression = (values, display) => ({ type: "expression", values, display });
    const special = (values, display) => ({ type: "special", values, display });

    return {
      version: "fallback-1",
      seed: "feff-math-fallback",
      dayCount: TOTAL_DAYS,
      questionsPerDay: QUESTIONS_PER_DAY,
      trapQuestionsPerDay: 2,
      groups: [
        makeFallbackGroup("equations", "Equations", 12, (index) => {
          const coefficient = 2 + (index % 5);
          const x = 2 + (index % 10);
          return {
            prompt: `Solve ${coefficient}x = ${coefficient * x}.`,
            answer: number(x),
            hint: `Divide both sides by ${coefficient}.`,
            explanation: `x = ${coefficient * x} / ${coefficient} = ${x}.`
          };
        }),
        makeFallbackGroup("fractions", "Fractions", 12, (index) => {
          const numerator = 2 + (index % 8);
          const denominator = numerator * (2 + (index % 4));
          const simplified = simplifyRatio(numerator, denominator);
          return {
            prompt: `Simplify ${numerator}/${denominator}.`,
            answer: number(simplified.a / simplified.b, `${simplified.a}/${simplified.b}`),
            hint: `Find a number that divides both ${numerator} and ${denominator}.`,
            explanation: `${numerator}/${denominator} simplifies to ${simplified.a}/${simplified.b}.`
          };
        }),
        makeFallbackGroup("percentages", "Percentages", 12, (index) => {
          const percent = [10, 20, 25, 40, 50, 75][index % 6];
          const base = 40 + (index % 8) * 20;
          const value = base * (percent / 100);
          return {
            prompt: `What is ${percent}% of ${base}?`,
            answer: number(value),
            hint: `${percent}% means ${percent}/100.`,
            explanation: `${percent}% of ${base} is ${value}.`
          };
        }),
        makeFallbackGroup("negative-numbers", "Negative numbers", 12, (index) => {
          const a = 4 + (index % 8);
          const b = 2 + (index % 7);
          const value = a + b;
          return {
            prompt: `What is ${a} - -${b}?`,
            answer: number(value),
            hint: "Subtracting a negative is the same as adding.",
            explanation: `${a} - -${b} = ${a} + ${b} = ${value}.`
          };
        }),
        makeFallbackGroup("algebra", "Algebra", 12, (index) => {
          const coefficient = 2 + (index % 6);
          const term = 1 + (index % 8);
          const constant = coefficient * term;
          return {
            prompt: `Expand ${coefficient}(x + ${term}).`,
            answer: expression([`${coefficient}x+${constant}`, `${constant}+${coefficient}x`], `${coefficient}x + ${constant}`),
            hint: `Multiply both x and ${term} by ${coefficient}.`,
            explanation: `${coefficient}(x + ${term}) = ${coefficient}x + ${constant}.`
          };
        }),
        makeFallbackGroup("powers", "Powers", 12, (index) => {
          const base = 2 + (index % 5);
          const exponent = 2 + (index % 3);
          const value = base ** exponent;
          return {
            prompt: `What is ${base}^${exponent}?`,
            answer: number(value),
            hint: `Multiply ${base} by itself ${exponent} times.`,
            explanation: `${base}^${exponent} = ${value}.`
          };
        }),
        makeFallbackGroup("decimals", "Decimals", 12, (index) => {
          const options = [
            [0.5, "1/2"],
            [0.25, "1/4"],
            [0.75, "3/4"],
            [0.2, "1/5"],
            [0.125, "1/8"],
            [0.375, "3/8"]
          ];
          const pair = options[index % options.length];
          return {
            prompt: `Write ${pair[1]} as a decimal.`,
            answer: number(pair[0], String(pair[0])),
            hint: "Divide the top number by the bottom number.",
            explanation: `${pair[1]} = ${pair[0]}.`
          };
        }),
        makeFallbackGroup("ratios", "Ratios", 12, (index) => {
          const a = 2 + (index % 7);
          const b = 3 + (index % 8);
          const factor = 2 + (index % 5);
          const simplified = simplifyRatio(a * factor, b * factor);
          return {
            prompt: `Simplify the ratio ${a * factor}:${b * factor}.`,
            answer: ratio(simplified.a, simplified.b),
            hint: `Divide both parts by ${factor} if you can.`,
            explanation: `${a * factor}:${b * factor} simplifies to ${simplified.a}:${simplified.b}.`
          };
        }),
        makeFallbackGroup("traps", "Careful traps", 12, (index) => {
          const traps = [
            {
              topic: "Undefined",
              prompt: "What is 5/0?",
              answer: special(["undefined", "not defined", "impossible", "cannot divide by zero"], "undefined"),
              hint: "Division by zero is not allowed.",
              explanation: "5/0 is undefined because you cannot divide by zero."
            },
            {
              topic: "Zero powers",
              prompt: "What is 3^0?",
              answer: number(1),
              hint: "Any non-zero number to the power of 0 equals 1.",
              explanation: "3^0 = 1."
            },
            {
              topic: "Trap question",
              prompt: "What is -4^2?",
              answer: number(-16),
              hint: "The power happens before the minus sign.",
              explanation: "-4^2 means -(4^2), so the answer is -16."
            },
            {
              topic: "Trap question",
              prompt: "What is (-4)^2?",
              answer: number(16),
              hint: "The brackets make the negative number the base.",
              explanation: "(-4)^2 = 16."
            }
          ];
          return { ...traps[index % traps.length], trap: true };
        })
      ]
    };
  }

  function makeFallbackGroup(id, title, count, buildQuestion) {
    return {
      id,
      title,
      questions: Array.from({ length: count }, (_, index) => ({
        id: `${id}-fallback-${index + 1}`,
        topic: title,
        trap: false,
        ...buildQuestion(index)
      }))
    };
  }

  function buildDays(bank) {
    const totalDays = bank.dayCount || TOTAL_DAYS;
    const questionsPerDay = bank.questionsPerDay || QUESTIONS_PER_DAY;
    const requestedTrapCount = bank.trapQuestionsPerDay ?? 2;
    const groups = normaliseQuestionGroups(bank.groups);
    const regularGroups = groups
      .map((group) => ({ ...group, questions: group.questions.filter((question) => !question.trap) }))
      .filter((group) => group.questions.length > 0);
    const trapPool = groups.flatMap((group) => group.questions.filter((question) => question.trap));
    const trapCount = Math.min(requestedTrapCount, trapPool.length, questionsPerDay);

    if (!regularGroups.length && !trapPool.length) {
      throw new Error("Question bank is empty.");
    }

    return Array.from({ length: totalDays }, (_, dayIndex) => {
      const day = dayIndex + 1;
      const rng = createSeededRandom(`${bank.seed || "feff-math"}:${bank.version || 1}:day-${day}`);
      const selected = [];
      const usedSourceIds = new Set();
      const regularTarget = Math.max(0, questionsPerDay - trapCount);
      const shuffledGroups = shuffle(regularGroups, rng);

      for (let index = 0; selected.length < regularTarget && index < regularTarget * 3; index += 1) {
        const group = shuffledGroups[index % shuffledGroups.length];
        const question = pickUnusedQuestion(group.questions, usedSourceIds, rng);
        if (!question) break;
        selected.push(question);
      }

      shuffle(trapPool, rng).some((question) => {
        if (selected.length >= questionsPerDay) return true;
        if (usedSourceIds.has(question.sourceId)) return false;
        usedSourceIds.add(question.sourceId);
        selected.push(question);
        return selected.filter((candidate) => candidate.trap).length >= trapCount;
      });

      for (let index = 0; selected.length < questionsPerDay && index < groups.length * questionsPerDay; index += 1) {
        const group = groups[index % groups.length];
        const question = pickUnusedQuestion(group.questions, usedSourceIds, rng);
        if (question) selected.push(question);
      }

      const questions = shuffle(selected, rng).slice(0, questionsPerDay).map((question, index) => ({
        ...question,
        id: `d${day}-q${index + 1}-${question.sourceId}`
      }));

      return { day, questions };
    });
  }

  function normaliseQuestionGroups(groups) {
    return (groups || []).map((group) => ({
      id: group.id,
      title: group.title,
      questions: (group.questions || []).map((question, index) => {
        const sourceId = question.id || `${group.id}-${index + 1}`;
        return {
          sourceId,
          topic: question.topic || group.title || "Mixed maths",
          prompt: question.prompt,
          answer: question.answer,
          hint: question.hint,
          explanation: question.explanation,
          trap: Boolean(question.trap)
        };
      }).filter((question) => question.prompt && question.answer && question.hint && question.explanation)
    })).filter((group) => group.questions.length > 0);
  }

  function pickUnusedQuestion(questions, usedSourceIds, rng) {
    const options = questions.filter((question) => !usedSourceIds.has(question.sourceId));
    if (!options.length) return null;
    const question = options[Math.floor(rng() * options.length)];
    usedSourceIds.add(question.sourceId);
    return question;
  }

  function shuffle(items, rng) {
    const result = items.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(rng() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function createSeededRandom(seed) {
    let state = hashSeed(seed);
    return function random() {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashSeed(seed) {
    let hash = 2166136261;
    for (let index = 0; index < seed.length; index += 1) {
      hash ^= seed.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function renderLoadingState() {
    if (!questionList) return;
    questionList.innerHTML = `
      <section class="question-card">
        <div class="question-main">
          <div class="question-meta">
            <span class="question-number">…</span>
            <span class="topic">Loading</span>
          </div>
          <p class="prompt">Preparing today’s mixed maths.</p>
        </div>
      </section>
    `;
  }

  function renderQuestionLoadError(error) {
    console.error(error);
    if (!questionList) return;
    questionList.innerHTML = `
      <section class="question-card">
        <div class="question-main">
          <div class="question-meta">
            <span class="question-number">!</span>
            <span class="topic">Question bank unavailable</span>
          </div>
          <p class="prompt">Refresh the page once the question bank is available.</p>
        </div>
      </section>
    `;
  }

  function setupSetControls() {
    previousMixButton.addEventListener("click", () => {
      renderDay(Math.max(1, currentDay - 1));
    });
    newMixButton.addEventListener("click", () => {
      renderDay(Math.min(getTotalDays(), currentDay + 1));
    });
    updateProgress();
  }

  function renderDay(dayNumber) {
    currentDay = dayNumber;
    const day = days[dayNumber - 1];
    const answersForDay = savedAnswers[dayNumber] || {};

    saveJson(CURRENT_SET_KEY, currentDay);
    dayTitle.textContent = `Set ${dayNumber}`;
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
    updateSetControls(day);
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
      encouragement.textContent = "Set complete. Mystery box opened and a sticker joined the album.";
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
    updateNotifications(correctCount);
    updateSetControls(day);
  }

  function updateProgress() {
    const completed = Object.values(progress).filter(Boolean).length;
    const totalDays = getTotalDays();
    const percent = (completed / totalDays) * 100;
    progressText.textContent = `${completed} of ${totalDays} sets`;
    progressBar.style.width = `${percent}%`;

    if (completedSetsText) completedSetsText.textContent = String(completed);
    renderStickerAlbum(completed);
  }

  function updateSetControls(day) {
    if (!day) return;
    const totalDays = getTotalDays();
    const topics = new Set(day.questions.map((question) => question.topic));
    const trapCount = day.questions.filter((question) => question.trap).length;
    setLabel.textContent = `Set ${currentDay} of ${totalDays}`;
    setTitle.textContent = progress[currentDay] ? "Sticker collected" : "Random challenge";
    setSummary.textContent = `${day.questions.length} questions with ${topics.size} topics and ${trapCount} sneaky ${trapCount === 1 ? "trap" : "traps"}.`;
    topicCountText.textContent = String(topics.size);
    trapCountText.textContent = String(trapCount);
    previousMixButton.disabled = currentDay <= 1;
    newMixButton.disabled = currentDay >= totalDays;
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
    mysteryText.textContent = "Finish the set to open it.";
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
    const totalDays = getTotalDays();
    const completedDays = Array.from({ length: totalDays }, (_, index) => index + 1).filter((day) => progress[day]);
    albumCount.textContent = `${completedDays.length} / ${totalDays}`;
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
      sticker.setAttribute("aria-label", day ? `Sticker for set ${day}` : "Locked sticker");
      stickerGrid.append(sticker);
    });

    if (completed >= totalDays) {
      nextStickerText.textContent = "Album complete. Legendary cat scholar.";
    } else if (completed === 0) {
      nextStickerText.textContent = "Finish a set to collect the first sticker.";
    } else {
      nextStickerText.textContent = `Next surprise in ${Math.min(3, totalDays - completed)} day${totalDays - completed === 1 ? "" : "s"}.`;
    }
  }

  function setupNotifications() {
    if (!notificationButton || !notificationPanel || !notificationClose) return;

    notificationButton.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleNotifications();
    });

    notificationClose.addEventListener("click", () => {
      closeNotifications();
      notificationButton.focus();
    });

    notificationPanel.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    document.addEventListener("click", closeNotifications);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNotifications();
    });
  }

  function toggleNotifications() {
    if (notificationPanel.hidden) {
      updateNotifications();
      openNotifications();
    } else {
      closeNotifications();
    }
  }

  function openNotifications() {
    notificationPanel.hidden = false;
    notificationButton.setAttribute("aria-expanded", "true");
  }

  function closeNotifications() {
    if (!notificationPanel || notificationPanel.hidden) return;
    notificationPanel.hidden = true;
    notificationButton.setAttribute("aria-expanded", "false");
  }

  function updateNotifications(correctCount) {
    if (!notificationButton || !notificationList) return;

    const completedDays = Object.values(progress).filter(Boolean).length;
    const totalDays = getTotalDays();
    const correct = Number.isFinite(correctCount) ? correctCount : getCurrentCorrectCount();
    const remaining = Math.max(0, QUESTIONS_PER_DAY - correct);
    const dayComplete = remaining === 0;
    const missionBody = dayComplete
      ? `Set ${currentDay} is complete. The ${stickerForDay(currentDay)} sticker is in your album.`
      : `${remaining} ${remaining === 1 ? "question" : "questions"} left to open today's mystery box.`;
    const albumBody = completedDays >= totalDays
      ? "Sticker album complete."
      : `${completedDays} of ${totalDays} stickers collected. Next surprise after another completed set.`;

    notificationButton.setAttribute("aria-label", "Open 2 practice updates");
    notificationList.innerHTML = `
      <article class="notification-item">
        <span class="notification-dot" aria-hidden="true"></span>
        <div>
          <strong>Set ${currentDay} mission</strong>
          <p>${escapeHtml(missionBody)}</p>
        </div>
      </article>
      <article class="notification-item">
        <span class="notification-dot" aria-hidden="true"></span>
        <div>
          <strong>Sticker album</strong>
          <p>${escapeHtml(albumBody)}</p>
        </div>
      </article>
    `;
  }

  function getCurrentCorrectCount() {
    const day = days[currentDay - 1];
    const cards = Array.from(questionList.querySelectorAll(".question-card"));
    return cards.reduce((count, card, index) => {
      const input = card.querySelector(".answer-input");
      return count + (isCorrect(input.value.trim(), day.questions[index].answer) ? 1 : 0);
    }, 0);
  }

  function stickerForDay(dayNumber) {
    return stickerRewards[(dayNumber - 1) % stickerRewards.length];
  }

  function getTotalDays() {
    return days.length || (questionBank && questionBank.dayCount) || TOTAL_DAYS;
  }

  function getInitialSetNumber() {
    const savedSet = Number(loadJson(CURRENT_SET_KEY, 1));
    if (Number.isInteger(savedSet) && savedSet >= 1 && savedSet <= getTotalDays()) {
      return savedSet;
    }
    const nextOpenSet = days.find((day) => !progress[day.day]);
    return nextOpenSet ? nextOpenSet.day : 1;
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
    return escapeHtml(value)
      .replace(/(\(?-?\d+\)?|\d*[a-z])\^(-?\d+)/gi, "$1<sup>$2</sup>")
      .replace(/([+-]?\d+(?:\.\d+)?)\s*\/\s*([+-]?\d+(?:\.\d+)?)(?![\d<])/g, renderFraction)
      .replace(/(\d)\s+x\s+(\(?&minus;?\d|\(?-?\d|[a-z])/gi, "$1 &times; $2")
      .replace(/([a-z]|\))\s+x\s+(\(?&minus;?\d|\(?-?\d|[a-z])/gi, "$1 &times; $2")
      .replace(/\s-\s-/g, " &minus; &minus;")
      .replace(/(^|[\s(=])-(?=\d|\()/g, "$1&minus;")
      .replace(/<sup>-/g, "<sup>&minus;");
  }

  function renderFraction(match, numerator, denominator) {
    return `<span class="math-frac" aria-label="${numerator} over ${denominator}"><span>${normaliseMathSign(numerator)}</span><span>${normaliseMathSign(denominator)}</span></span>`;
  }

  function normaliseMathSign(value) {
    return value.replace(/^-/, "&minus;");
  }
})();
