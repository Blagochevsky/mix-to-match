const BASE_COLORS = {
  red: [211, 31, 53],
  blue: [44, 52, 128],
  yellow: [252, 215, 0],
  white: [255, 255, 255],
};
const MAXIMUM_DOT_SCALE = 80;

document.addEventListener("DOMContentLoaded", function () {
  let state = {
    targetColor: null,
    currentColor: null,
    currentMixedColors: [],
    currentLevel: 1,
  };

  const getColorPart = (colors, seed) => colors[Object.keys(colors).at(seed)];

  const rgbToString = (color) => `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

  const mixColors = (colors) => {
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

    console.log(parts);
    return mixColors(parts);
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

  const getOptionsByCloseness = (closenessPercentage) => {
    if (closenessPercentage >= 100) {
      return {
        buttons: [nextColor],
        titles: [
          "Color Perfection Achieved!",
          "Master Mixer!",
          "Palette Pro!",
          "Ultimate Color Wizardry!",
          "Excellent Match!",
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
        buttons: [tryAgain, changeColor, nextColor],
        titles: [
          "Color Brilliance!",
          "So close!",
          "Near Perfection!",
          "One Step from Perfect",
          "Touch-Up or Level Up?",
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
    } else {
      return {
        buttons: [tryAgain, changeColor],
        titles: [
          "Keep Mixing",
          "Close, But Not Quite",
          "Almost There",
          "Aim Higher!",
          "Brush Up Your Mix",
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

  const updateState = (state, update) => ({
    ...state,
    currentColor: null,
    currentMixedColors: [],
    ...(update ? update : {}),
  });

  const updateUI = (state) => {
    resetcontainer.style.visibility = state.currentColor ? "visible" : "hidden";

    mixedColor.style.backgroundColor = state.currentColor
      ? rgbToString(state.currentColor)
      : "white";

    levelNumber.textContent = `Level ${state.currentLevel}`;

    targetColor.style.backgroundColor = rgbToString(state.targetColor);

    document.querySelectorAll("[data-color]").forEach((element) => {
      const color = element.dataset.color;

      window[`${color}Dot`].style.transform = `scale(${Math.min(
        MAXIMUM_DOT_SCALE,
        state.currentMixedColors.reduce(
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

    return newRound(state);
  };

  const newRound = (state) => {
    let targetColor;
    do {
      targetColor = createColor(BASE_COLORS, state.currentLevel);
    } while (targetColor.join() === state.targetColor?.join());

    return updateUI(updateState(state, { targetColor }));
  };

  const getElementScale = (element) => {
    return parseFloat(
      element.style.transform.match(/scale\(([\d\.]+)\)/)?.at(1) ?? 1
    );
  };

  // LISTENERS

  reset.addEventListener("click", () => {
    state = updateUI(updateState(state));
  });

  check.addEventListener("click", () => {
    if (state.currentMixedColors.length === 0) return;

    const closenessPercentage = getDistance(
      state.targetColor,
      state.currentColor
    );

    const options = getOptionsByCloseness(closenessPercentage);

    [nextColor, changeColor, tryAgain].forEach((button) => {
      button.style.display = options.buttons.includes(button)
        ? "inline"
        : "none";
    });
    title.textContent = getRandomOption(options.titles);
    message.textContent = getRandomOption(options.messages);

    dialog.showModal();
  });

  tryAgain.addEventListener("click", () => {
    state = updateUI(updateState(state));
  });

  changeColor.addEventListener("click", () => {
    state = newRound(updateState(state));
  });

  nextColor.addEventListener("click", () => {
    state = newRound(
      updateState(state, { currentLevel: state.currentLevel + 1 })
    );
  });

  document.querySelectorAll("[data-color]").forEach((element) =>
    element.addEventListener("click", (event) => {
      const color = event.target.dataset.color;

      const mixedColors = addColor(
        state.currentMixedColors,
        BASE_COLORS[color]
      );
      const mixedColor = mixColors(mixedColors);

      state = updateUI(
        updateState(state, {
          currentColor: mixedColor,
          currentMixedColors: mixedColors,
        })
      );
    })
  );

  state = initializeGame(state);
});
