import { calcContrast } from "https://cdn.skypack.dev/apcach";
import { parse, clampChroma, converter } from "https://cdn.skypack.dev/culori"

const hslPanel = document.getElementById('hslPanel');
const sliderHue = document.getElementById('sliderHue');
const heuValue = document.getElementById('heuValue');
const cardOklch = document.getElementById('cardOklch');
const cardHsl = document.getElementById('cardHsl');
const boostChromaCheckbox = document.getElementById('boostChromaCheckbox');
const clearButton = document.getElementById('clearButton');

const COLORS = 6;
const ACCENT_COLORS = [2, 4]
const theme = { accent: 0, ambient: 0 }

document.addEventListener('DOMContentLoaded', () => {
  let hue = parseFloat(sliderHue.value);
  updatePalettes(hue, false);
});

sliderHue.addEventListener('input', function () {
  let hue = parseFloat(sliderHue.value);
  let chromaBoost = boostChromaCheckbox.checked;
  updatePalettes(hue, chromaBoost);
  heuValue.textContent = hue;
});

boostChromaCheckbox.addEventListener('change', function () {
  let hue = parseFloat(sliderHue.value);
  let chromaBoost = boostChromaCheckbox.checked;
  updatePalettes(hue, chromaBoost);
});

clearButton.addEventListener('click', function () {
  clearButton.style.visibility = "hidden";
  let imgContainers = document.getElementsByClassName('image-container');
  for (let i = 0; i < imgContainers.length; i++) {
    imgContainers[i].style.backgroundImage = "";
  }
  theme.accent = 0;
  theme.ambient = 0;
  let hue = parseFloat(sliderHue.value);
  let chromaBoost = boostChromaCheckbox.checked;
  updatePalettes(hue, chromaBoost);
});



function updatePalettes(hueOffset, chromaBoost) {
  for (let i = 0; i < COLORS; i++) {
    let hue = (ACCENT_COLORS.includes(i) ? theme.accent : theme.ambient) + hueOffset;
    updateColor("oklch", i, hue + 29, chromaBoost)
    updateColor("hsl", i, hue, false)
  }
}

function updateColor(model, i, h, chromaBoost) {
  let comps
  let color
  if (model == "oklch") {
    comps = oklchComps[i];
    if (chromaBoost && i < 5) {
      let tempColor = "oklch(" + comps.l + " " + 0.4 + " " + h + ")";
      let clampedColor = clampChroma(tempColor, "oklch");
      color = "oklch(" + comps.l + " " + clampedColor.c.toFixed(2) + " " + h + ")";
    } else {
      color = "oklch(" + comps.l + " " + comps.c + " " + h + ")";
    }
  } else {
    comps = hslComps(i);
    color = "hsl(" + h + " " + comps.s + "% " + comps.l + "%)";
  }
  setVariable(comps.name, color);
  // Display color
  let codeLabelId = model + snippetId(i) + "Code";
  let codeLabel = document.getElementById(codeLabelId);
  codeLabel.textContent = color;
  // Contrast
  let crLabelId = model + snippetId(i) + "Cr";
  let crLabel = document.getElementById(crLabelId);
  if (crLabel) {
    let bg = getComputedStyle(cardOklch).backgroundColor;
    let cr = Math.round(Math.abs(i == 2 ? calcContrast(bg, color) : calcContrast(color, bg)));
    crLabel.textContent = "APCA: " + cr;
    if (cr < minContrast(i)) {
      crLabel.style.color = "#f00";
    } else {
      crLabel.style.color = "";
    }
  }
}

function snippetId(i) {
  switch (i) {
    case 0: return 2;
    case 1: return 1;
    case 2: return 5;
    case 3: return 4;
    case 4: return 3;
    case 5: return 6;
  }
}

function minContrast(i) {
  switch (i) {
    case 2: return 60;
    case 3: return 60;
    case 4: return 75;
    case 5: return 60;
    default: return 0;
  }
}

const oklchComps = {
  0: { l: 0.98, c: 0.01, name: "--color-oklch-50" },
  1: { l: 0.90, c: 0.05, name: "--color-oklch-100" },
  2: { l: 0.63, c: 0.14, name: "--color-oklch-600" },
  3: { l: 0.60, c: 0.14, name: "--color-oklch-700" },
  4: { l: 0.49, c: 0.09, name: "--color-oklch-800" },
  5: { l: 0.62, c: 0.00, name: "--color-oklch-dark-gray" }
}

function hslComps(i) {
  switch (i) {
    case 0: return { s: 100, l: 98, name: "--color-hsl-50" };
    case 1: return { s: 100, l: 89, name: "--color-hsl-100" };
    case 2: return { s: 100, l: 58, name: "--color-hsl-600" };
    case 3: return { s: 100, l: 48, name: "--color-hsl-700" };
    case 4: return { s: 100, l: 36, name: "--color-hsl-800" };
    case 5: return { s: 0, l: 52, name: "--color-hsl-dark-gray" };
  }
}

function setVariable(name, value) {
  document.documentElement.style.setProperty(name, value);
}


// DND -----------------------------

// Handle drag and drop events
cardOklch.addEventListener('dragover', (e) => {
  e.preventDefault();
  cardOklch.classList.add('drag-over');
});

cardOklch.addEventListener('dragleave', () => {
  cardOklch.classList.remove('drag-over');
});

cardOklch.addEventListener('drop', (e) => {
  e.preventDefault();
  cardOklch.classList.remove('drag-over');

  const file = e.dataTransfer.files[0];
  let imgageContainers = document.getElementsByClassName('image-container')

  if (file && file.type.startsWith('image/')) {
    let reader = new FileReader();

    reader.onload = (e) => {
      let imageUrl = e.target.result;
      for (let i = 0; i < imgageContainers.length; i++) {
        imgageContainers[i].style.backgroundImage = `url(${imageUrl})`;
      }

      composeTheme(imageUrl);
    };

    reader.readAsDataURL(file);
  }
});

function composeTheme(imageUrl) {
  let colorThief = new ColorThief();
  let imgContainer = document.getElementsByClassName('image-container')[0];
  let backgroundImageURL = window.getComputedStyle(imgContainer).getPropertyValue('background-image');
  let imageURL = backgroundImageURL.match(/\((.*?)\)/)[1].replace(/('|")/g, '');
  let image = new Image();

  // Set up an event handler to run when the image has loaded
  image.onload = function () {
    // Create a Color Thief instance
    let colorThief = new ColorThief();

    let palette = colorThief.getPalette(image, 2)
    let dominantColor = palette[0];
    let complimentaryColor = palette[1];

    let dominantColorRgb = rbgFromComponents(dominantColor);
    let complimentaryColorRgb = rbgFromComponents(complimentaryColor);

    let dominantColorOklch = converter("oklch")(dominantColorRgb);
    let complimentaryColorOklch = converter("oklch")(complimentaryColorRgb);

    let dominantColorH = Math.round(dominantColorOklch.h) - 29;
    let complimentaryColorH = Math.round(complimentaryColorOklch.h) - 29;

    theme.accent = complimentaryColorH
    theme.ambient = dominantColorH

    let hue = parseFloat(sliderHue.value);
    updatePalettes(hue, boostChromaCheckbox.checked)

    clearButton.style.visibility = "visible";
  };
  // Load the image by setting its source
  image.src = imageURL;
}

function rbgFromComponents(comps) {
  return `rgb(${comps[0]}, ${comps[1]}, ${comps[2]})`;
}