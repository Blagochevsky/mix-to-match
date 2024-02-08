document.addEventListener('DOMContentLoaded', function() {
    setVH();
    window.addEventListener('resize', setVH);
});

function setVH() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.body.style.opacity = "1";
}

document.addEventListener("DOMContentLoaded", function () {
    function mixColorsWithMixbox() {
        const targetColor = document.getElementById("targetColor");
        const mixedColor = document.getElementById("mixedColor");
        const colorButtons = document.querySelectorAll(".colors");
        let selectedColors = []; // Store selected colors
        const baseColors = {
            red: [211, 31, 53],
            blue: [44, 52, 128],
            yellow: [252, 215, 0],
            white: [255, 255, 255]
        };
        let colorCount = { red: 0, blue: 0, yellow: 0, white: 0 };
        let hintColors = []; // Define hintColors in the function scope
        let colorSelections = 0;
        let partsNumber = 2; // Define partsNumber in the function scope
        const colorDots = {
            red: document.getElementById("redDot"),
            blue: document.getElementById("blueDot"),
            yellow: document.getElementById("yellowDot"),
            white: document.getElementById("whiteDot")
        };

        // Initially hide the "Check" and "Reset" buttons
        document.getElementById("check").style.display = 'none';
        document.getElementById("reset").style.display = 'none';

        document.getElementById("check").addEventListener("click", () => {
            document.getElementById("overlay").style.display = 'block';
        });

        for (let color in colorDots) {
            const rgbColor = baseColors[color];
            colorDots[color].style.backgroundColor = `rgb(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]})`;
            colorDots[color].style.display = 'none';
        }

        // colorButtons.forEach((button) => {
        //     const color = button.dataset.color;
        //     const rgbColor = baseColors[color];
        //     button.style.backgroundColor = `rgb(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]})`;
        //     button.style.color = 'white'; // Set the text color to white for better contrast
        // });

        colorButtons.forEach((button) => {
            button.addEventListener("click", function () {
                const color = this.dataset.color;
                selectedColors.push(baseColors[color]); // Store RGB arrays, not color names
                mixSelectedColors();
                colorCount[color]++;
                colorDots[color].style.transform = `scale(${1 + (colorCount[color] / 2)})`; // Increase the size of the color dot
                if (colorCount[color] === 0) {
                    colorDots[color].style.display = 'none'; // Hide the color dot
                } else {
                    colorDots[color].style.display = 'block'; // Show the color dot
                }
                // updateButtonLabels();
                colorSelections++;
                checkCorrectMix(); // Check if the mix is correct
                // Show the "Check" and "Reset" buttons when a color is added
                document.getElementById("check").style.display = 'block';
                document.getElementById("reset").style.display = 'block';
            });
        });

        function checkCorrectMix() {
            const targetColorStyle = window.getComputedStyle(targetColor);
            const targetColorRgb = targetColorStyle.backgroundColor.match(/\d+/g).map(Number); // Extract RGB values

            const mixedColorStyle = window.getComputedStyle(mixedColor);
            const mixedColorRgb = mixedColorStyle.backgroundColor.match(/\d+/g).map(Number); // Extract RGB values

            const distance = Math.sqrt(
                Math.pow(targetColorRgb[0] - mixedColorRgb[0], 2) +
                Math.pow(targetColorRgb[1] - mixedColorRgb[1], 2) +
                Math.pow(targetColorRgb[2] - mixedColorRgb[2], 2)
            );

            const maxDistance = Math.sqrt(Math.pow(255, 2) * 3); // Maximum possible distance (black to white)

            const closenessPercentage = 100 - (distance / maxDistance * 100);

            const messageDiv = document.getElementById("message");
            if (closenessPercentage >= 100) { // Adjusted threshold
                messageDiv.textContent = 'Correct mix!';
            } else if (closenessPercentage >= 99) {
                messageDiv.textContent = `Almost! You are ${closenessPercentage.toFixed(2)}% close. Try again!`;
            } else {
                messageDiv.textContent = `Incorrect mix. You are ${closenessPercentage.toFixed(2)}% close. Try again!`;
            }
        }

        function mixSelectedColors() {
            let mixedLatent = new Array(mixbox.LATENT_SIZE).fill(0);
            selectedColors.forEach((color) => {
                const colorLatent = mixbox.rgbToLatent(color);
                mixedLatent = mixedLatent.map(
                    (c, i) => c + colorLatent[i] / selectedColors.length,
                );
            });
            const mixedColorRgb = mixbox.latentToRgb(mixedLatent);
            mixedColor.style.backgroundColor = `rgb(${mixedColorRgb[0]}, ${mixedColorRgb[1]}, ${mixedColorRgb[2]})`;
        }

        function resetGame() {
            mixedColor.style.backgroundColor = "rgb(255, 255, 255)"; // Reset mixed color
            selectedColors = []; // Clear selected colors
            colorCount = { red: 0, blue: 0, yellow: 0, white: 0 }; // Reset counts
            document.getElementById("message").textContent = ''; // Reset the message
        
            // Reset the scale and visibility of the color dots
            for (let color in colorDots) {
                colorDots[color].style.transform = 'scale(1)';
                colorDots[color].style.display = 'none'; // Hide the color dot
            }
            document.getElementById("overlay").style.display = 'none'; // Hide the modal
            // Hide the "Check" and "Reset" buttons when the colors are reset
            document.getElementById("check").style.display = 'none';
            document.getElementById("reset").style.display = 'none';
        }
        
        document.getElementById("reset").addEventListener("click", resetGame);
        document.getElementById("tryAgain").addEventListener("click", resetGame);

        // function updateButtonLabels() {
        //     colorButtons.forEach(button => {
        //         const color = button.dataset.color;
        //         const count = colorCount[color];
        //         button.textContent = count > 0 ? `${capitalizeFirstLetter(color)} (${count})` : capitalizeFirstLetter(color);
        //     });
        // }

        // function capitalizeFirstLetter(string) {
        //     return string.charAt(0).toUpperCase() + string.slice(1);
        // }

        function createTargetColor() {
            hintColors = []; // Reset hint colors for each new target
            let targetColorLatent = new Array(mixbox.LATENT_SIZE).fill(0);

            const colorKeys = Object.keys(baseColors);

            for (let i = 0; i < partsNumber; i++) {
                const colorName = colorKeys[Math.floor(Math.random() * colorKeys.length)]; // Select color randomly
                const color = baseColors[colorName];
                hintColors.push(colorName); // Save the color name for the hint
                const colorLatent = mixbox.rgbToLatent(color);
                targetColorLatent = targetColorLatent.map(
                    (c, i) => c + colorLatent[i] / partsNumber,
                );
            }

            const targetColorRgb = mixbox.latentToRgb(targetColorLatent);
            targetColor.style.backgroundColor = `rgb(${targetColorRgb[0]}, ${targetColorRgb[1]}, ${targetColorRgb[2]})`;
            document.getElementById("levelNumber").textContent =
                `Level ${partsNumber - 1}`;
        }

        // document.getElementById("hintButton").addEventListener("click", () => {
        //     const hintDisplay = document.getElementById("hintDisplay");
        //     if (hintDisplay.textContent !== '') {
        //         hintDisplay.textContent = '';
        //     } else {
        //         let hintMessage = 'Hint: The colors needed are ';
        //         hintColors.forEach((colorName, index) => {
        //             hintMessage += `${colorName}${index < hintColors.length - 1 ? ', ' : '.'}`;
        //         });
        //         hintDisplay.textContent = hintMessage;
        //     }
        // });

        document.getElementById("nextColor").addEventListener("click", () => {
            selectedColors = []; // Clear selected colors
            colorCount = { red: 0, blue: 0, yellow: 0, white: 0 }; // Reset counts
            mixedColor.style.backgroundColor = "rgb(255, 255, 255)"; // Reset mixed color
            // updateButtonLabels(); // Update button labels
            // document.getElementById("hintDisplay").textContent = ''; // Hide hint if it's visible
            document.getElementById("message").textContent = ''; // Reset the message
            partsNumber++; // Increment partsNumber
            createTargetColor(); // Create a new target color

            // Reset the scale and visibility of the color dots
            for (let color in colorDots) {
                colorDots[color].style.transform = 'scale(1)';
                colorDots[color].style.display = 'none'; // Hide the color dot
            }

            document.getElementById("overlay").style.display = 'none'; // Hide the modal
            // Hide the "Check" and "Reset" buttons when the colors are reset
            document.getElementById("check").style.display = 'none';
            document.getElementById("reset").style.display = 'none';
        });

        document.getElementById("changeColor").addEventListener("click", () => {
            selectedColors = []; // Clear selected colors
            colorCount = { red: 0, blue: 0, yellow: 0, white: 0 }; // Reset counts
            mixedColor.style.backgroundColor = "rgb(255, 255, 255)"; // Reset mixed color
            // updateButtonLabels(); // Update button labels
            // document.getElementById("hintDisplay").textContent = ''; // Hide hint if it's visible
            document.getElementById("message").textContent = ''; // Reset the message
            createTargetColor(); // Create a new target color

            // Reset the scale and visibility of the color dots
            for (let color in colorDots) {
                colorDots[color].style.transform = 'scale(1)';
                colorDots[color].style.display = 'none'; // Hide the color dot
            }

            document.getElementById("overlay").style.display = 'none'; // Hide the modal
            // Hide the "Check" and "Reset" buttons when the colors are reset
            document.getElementById("check").style.display = 'none';
            document.getElementById("reset").style.display = 'none';
        });

        createTargetColor(); // Create the initial target color
    }

    mixColorsWithMixbox();
});