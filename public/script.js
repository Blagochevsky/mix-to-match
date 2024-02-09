document.addEventListener("DOMContentLoaded", function () {
  document.body.style.opacity = "1";
});

const BASE_COLORS = {
  red: [211, 31, 53],
  blue: [44, 52, 128],
  yellow: [252, 215, 0],
  white: [255, 255, 255],
};

document.addEventListener("DOMContentLoaded", function () {
  let targetColorValue;
  let currentColorValue;
  let currentColors = [];
  let currentLevel = 1;

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
    const parts = Array.from({ length: partsCount }, () =>
      getColorPart(
        colors,
        Math.floor(Math.random() * Object.keys(colors).length)
      )
    );

    return mixColors(parts);
  };

  const checkDistance = (targetColor, mixedColor) => {
    const distance = Math.sqrt(
      Math.pow(targetColor[0] - mixedColor[0], 2) +
        Math.pow(targetColor[1] - mixedColor[1], 2) +
        Math.pow(targetColor[2] - mixedColor[2], 2)
    );
    const maxDistance = Math.sqrt(Math.pow(255, 2) * 3);

    return 100 - (distance / maxDistance) * 100;
  };

  const getMessageByDistance = (closenessPercentage) => {
    if (closenessPercentage >= 100) {
      return "Correct mix!";
    }

    if (closenessPercentage >= 99) {
      return `Almost! You are ${closenessPercentage.toFixed(
        2
      )}% close. Try again!`;
    }

    return `Incorrect mix. You are ${closenessPercentage.toFixed(
      2
    )}% close. Try again!`;
  };

  const addColor = (colors, color) => {
    return [...colors, color];
  };

  const resetElements = () => {
    currentColors = [];
    currentColorValue = null;

    resetcontainer.style.visibility = "hidden";

    document.querySelectorAll("[data-color]").forEach((element) => {
      window[`${element.dataset.color}Dot`].style.transform = "scale(0)";
    });

    mixedColor.style.backgroundColor = "white";
  };

  const newRound = (round) => {
    resetElements();

    levelNumber.textContent = `Level ${round}`;

    targetColorValue = createColor(BASE_COLORS, round + 1);
    targetColor.style.backgroundColor = rgbToString(targetColorValue);
  };

  const getElementScale = (element) => {
    return element.style.transform.match(/scale\(([\d\.]+)\)/)?.at(1) ?? 1;
  };

  // LISTENERS

  reset.addEventListener("click", resetElements);

  check.addEventListener("click", () => {
    if (currentColors.length === 0) return;

    const closenessPercentage = checkDistance(
      targetColorValue,
      currentColorValue
    );

    nextColor.style.display = closenessPercentage >= 99 ? "inline" : "none";
    message.textContent = getMessageByDistance(closenessPercentage);

    dialog.showModal();
  });

  tryAgain.addEventListener("click", resetElements);

  changeColor.addEventListener("click", () => {
    newRound(currentLevel);
  });

  nextColor.addEventListener("click", () => {
    newRound(++currentLevel);
  });

  document.querySelectorAll("[data-color]").forEach((element) =>
    element.addEventListener("click", (event) => {
      const color = event.target.dataset.color;
      const $dot = window[`${color}Dot`];
      const scale = parseFloat(getElementScale($dot));

      $dot.style.transform = `scale(${Math.max(
        1,
        Math.min(80, scale + 1)
      )})`;

      currentColors = addColor(currentColors, BASE_COLORS[color]);

      currentColorValue = mixColors(currentColors);
      mixedColor.style.backgroundColor = rgbToString(currentColorValue);

      resetcontainer.style.visibility =
        currentColors.length > 0 ? "visible" : "hidden";
    })
  );

  newRound(currentLevel);
});
