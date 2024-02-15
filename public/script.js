const CANVAS_COLOR = [233, 228, 221];
const BASE_COLORS = {
  red: [211, 31, 53],
  blue: [5, 79, 150],
  yellow: [252, 215, 0],
  white: [255, 255, 255],
};
const MAXIMUM_DOT_SCALE = 80;

document.addEventListener("DOMContentLoaded", function () {
  let state = {
    targetColor: null,
    targetMixColors: [],
    currentColor: null,
    currentMixColors: [],
    currentLevel: 1,
    totalCloseness: 0,
    attempts: 0,
    playerHealth: 5,
  };

  const getColorPart = (colors, seed) => colors[Object.keys(colors).at(seed)];

  const rgbToString = (color) => `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

  const mixColors = (colors) => {
    if (colors.length === 0) return CANVAS_COLOR;

    const mix = Array.from({ length: colors.length }, (_, i) =>
      mixbox.rgbToLatent(colors[i])
    )
      .reduce((acc, curr) => (!acc ? curr : acc.map((c, i) => c + curr[i])))
      .map((c) => c / colors.length);

    return mixbox.latentToRgb(mix);
  };

  const createColor = (colors, partsCount) => {
    let lastColor = null;
    const parts = Array.from({ length: partsCount }, () => {
      let color;
      do {
        color = getColorPart(
          colors,
          Math.floor(Math.random() * Object.keys(colors).length)
        );
      } while (color === lastColor);
      lastColor = color;
      return color;
    });

    return { color: mixColors(parts), parts };
  };

  const getDistance = (targetColor, mixedColor) => {
    const distance = Math.sqrt(
      Math.pow(targetColor[0] - mixedColor[0], 2) +
        Math.pow(targetColor[1] - mixedColor[1], 2) +
        Math.pow(targetColor[2] - mixedColor[2], 2)
    );
    const maxDistance = Math.sqrt(Math.pow(255, 2) * 3);

    return 100 - (distance / maxDistance) * 100;
  };

  const getOptions = (closenessPercentage, optimalParts, playerHealth) => {
    if (closenessPercentage >= 100 && optimalParts) {
      return {
        win: true,
        buttons: [nextColor],
        titles: [
          "⭐️⭐️⭐️ Efficiency Maestro!",
          "⭐️⭐️⭐️ Step-Savvy Virtuoso!",
          "⭐️⭐️⭐️ Precision Pioneer!",
          "⭐️⭐️⭐️ Optimal Artist!",
          "⭐️⭐️⭐️ Master of Minimality!",
        ],
        messages: [
          "Perfection with just the essentials—brilliant!",
          "Pure genius in minimal strokes!",
          "Artistry in economy—every part perfect!",
          "Minimalist mastery for the perfect blend!",
          "Elegance in simplicity—color perfection!",
        ],
      };
    } else if (closenessPercentage >= 100) {
      return {
        win: true,
        buttons: [tryAgain, changeColor, nextColor],
        titles: [
          "⭐️⭐️ Color Perfection Achieved!",
          "⭐️⭐️ Master Mixer!",
          "⭐️⭐️ Palette Pro!",
          "⭐️⭐️ Ultimate Color Wizardry!",
          "⭐️⭐️ Excellent Match!",
        ],
        messages: [
          "100% correct mix!",
          "Perfect 100% match!",
          "You nailed the mix!",
          "Great job on the mix!",
          "Excellent mix!",
        ],
      };
    } else if (closenessPercentage >= 99) {
      return {
        win: true,
        buttons: [tryAgain, changeColor, nextColor],
        titles: [
          "⭐️ Color Brilliance!",
          "⭐️ So close!",
          "⭐️ Near Perfection!",
          "⭐️ One Step from Perfect",
          "⭐️ Touch-Up or Level Up?",
        ],
        messages: [
          `You're just a shade away from perfection! ${closenessPercentage.toFixed(
            2
          )}% color match.`,
          `You've almost mastered the art of color mixing with a ${closenessPercentage.toFixed(
            2
          )}% match! Proceed or perfect your blend?`,
          `You've achieved a ${closenessPercentage.toFixed(
            2
          )}% color match! Ready to level up, or will you aim for absolute perfection?`,
          `You're on the brink of perfection with a ${closenessPercentage.toFixed(
            2
          )}% match. Do you dare to try for 100% or move on to new challenges?`,
          `Your palette prowess has earned you a ${closenessPercentage.toFixed(
            2
          )}% match. Opt for perfection or embrace the next level of color exploration?`,
        ],
      };
    } else if (playerHealth <= 1) {
      return {
        win: false,
        buttons: [startOver],
        titles: ["✖️ Game Over"],
        messages: [
          `You've achieved a ${closenessPercentage.toFixed(
            2
          )}% match! And you've run out of brushes.`,
        ],
      };
    } else {
      return {
        win: false,
        buttons: [tryAgain, changeColor],
        titles: [
          "✖️ Keep Mixing",
          "✖️ Close, But Not Quite",
          "✖️ Almost There",
          "✖️ Aim Higher!",
          "✖️ Brush Up Your Mix",
        ],
        messages: [
          `You've achieved a ${closenessPercentage.toFixed(
            2
          )}% match! Your color intuition is strong, but the perfect hue is still ahead. Mix again for a closer match.`,
          `With a ${closenessPercentage.toFixed(
            2
          )}% color match, you're on the verge of brilliance. Adjust your mix for that flawless finish.`,
          `You've blended a ${closenessPercentage.toFixed(
            2
          )}% match, showing promising skill. A little tweak could lead you to perfection. Give it another try!`,
          `Your artistic eye has earned you a ${closenessPercentage.toFixed(
            2
          )}% color match. Refine your blend to capture that elusive 100%.`,
          `A ${closenessPercentage.toFixed(
            2
          )}% match is impressive, but perfection awaits. Dive back into your palette and unveil the true artist within.`,
        ],
      };
    }
  };

  const getRandomOption = (options) => {
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  };

  const addColor = (colors, color) => {
    return [...colors, color];
  };

  const removeColor = (colors, color) => {
    const idx = colors.findIndex((item) => item.join() === color.join());

    if (idx === -1) return [...colors];
    return colors.filter((_, index) => index !== idx);
  };

  const updateState = (state, update) => {
    const newState = {
      ...state,
      ...(update ? update : {}),
    };

    return newState;
  };

  const recordState = (state) => {
    localStorage.setItem("state", JSON.stringify(state));
    return { ...state };
  };

  const restoreState = () => JSON.parse(localStorage.getItem("state")) ?? {};

  const updateUI = (state) => {
    resetcontainer.style.visibility = state.currentColor ? "visible" : "hidden";

    mixedColor.style.backgroundColor = state.currentColor
      ? rgbToString(state.currentColor)
      : "#e9e4dd";

    levelNumber.textContent = `Level ${state.currentLevel}`;
    totalCloseness.textContent = `Accuracy ${
      state.attempts === 0
        ? "100.00"
        : (state.totalCloseness / state.attempts).toFixed(2)
    }%`;
    playerHealth.textContent = "Brushes " + "🖌️".repeat(state.playerHealth);

    targetColor.style.backgroundColor = rgbToString(state.targetColor);

    document.querySelectorAll("[data-color]").forEach((element) => {
      const color = element.dataset.color;

      window[`${color}Dot`].style.transform = `scale(${Math.min(
        MAXIMUM_DOT_SCALE,
        state.currentMixColors.reduce(
          (acc, curr) =>
            BASE_COLORS[color].join() === curr.join() ? acc + 1 : acc,
          0
        )
      )})`;
    });

    return state;
  };

  const initializeGame = (state) => {
    document.querySelectorAll("[data-color]").forEach((element) => {
      const color = element.dataset.color;
      const rgb = BASE_COLORS[color];

      if (!rgb) return;

      element.previousElementSibling.firstElementChild.style.fill =
        rgbToString(rgb);
    });

    const restoredState = restoreState();
    if (Object.keys(restoredState).length === 0) {
      return newRound({ ...state, ...restoredState });
    } else {
      return updateUI({ ...state, ...restoredState });
    }
  };

  const newRound = (state) => {
    let targetColor, targetMixColors;
    do {
      const result = createColor(BASE_COLORS, state.currentLevel + 1);
      targetColor = result.color;
      targetMixColors = result.parts;
    } while (targetColor.join() === state.targetColor?.join());

    return updateUI(
      recordState(updateState(state, { targetColor, targetMixColors }))
    );
  };

  // LISTENERS

  reset.addEventListener("click", () => {
    state = updateUI(
      recordState(
        updateState(state, { currentColor: null, currentMixColors: [] })
      )
    );
  });

  check.addEventListener("click", () => {
    if (state.currentMixColors.length === 0) return;

    const closenessPercentage = getDistance(
      state.targetColor,
      state.currentColor
    );

    const optimalParts =
      state.currentMixColors.length <= state.targetMixColors.length;

    const options = getOptions(
      closenessPercentage,
      optimalParts,
      state.playerHealth
    );

    state = updateUI(
      recordState(
        updateState(state, {
          playerHealth: options.win
            ? state.playerHealth
            : state.playerHealth - 1,
          totalCloseness: state.totalCloseness + closenessPercentage,
          attempts: state.attempts + 1,
          currentColor: null,
          currentMixColors: [],
        })
      )
    );

    [(nextColor, changeColor, tryAgain, startOver)].forEach((button) => {
      button.style.display = options.buttons.includes(button)
        ? "inline"
        : "none";
    });
    title.textContent = getRandomOption(options.titles);
    message.textContent = getRandomOption(options.messages);

    dialog.showModal();
  });

  tryAgain.addEventListener("click", () => {
    state = updateUI(
      recordState(
        updateState(state, { currentColor: null, currentMixColors: [] })
      )
    );
  });

  changeColor.addEventListener("click", () => {
    state = newRound(
      recordState(
        updateState(state, { currentColor: null, currentMixColors: [] })
      )
    );
  });

  nextColor.addEventListener("click", () => {
    state = newRound(
      recordState(
        updateState(state, {
          currentLevel: state.currentLevel + 1,
          currentColor: null,
          currentMixColors: [],
        })
      )
    );
  });

  startOver.addEventListener("click", () => {
    state = {
      targetColor: null,
      targetMixColors: [],
      currentColor: null,
      currentMixColors: [],
      currentLevel: 1,
      totalCloseness: 0,
      attempts: 0,
      playerHealth: 5,
    };
    state = initializeGame(recordState(state));
  });

  document.querySelectorAll("[data-color]").forEach((element) => {
    element.addEventListener("click", (event) => {
      const color = event.target.dataset.color;

      const mixedColors = addColor(state.currentMixColors, BASE_COLORS[color]);
      const mixedColor = mixColors(mixedColors);

      state = updateUI(
        recordState(
          updateState(state, {
            currentColor: mixedColor,
            currentMixColors: mixedColors,
          })
        )
      );
    });

    element.addEventListener("contextmenu", (event) => {
      event.preventDefault();

      const color = event.target.dataset.color;

      const mixedColors = removeColor(
        state.currentMixColors,
        BASE_COLORS[color]
      );
      const mixedColor = mixColors(mixedColors);

      state = updateUI(
        recordState(
          updateState(state, {
            currentColor: mixedColor,
            currentMixColors: mixedColors,
          })
        )
      );
    });
  });

  state = initializeGame(state);
});
