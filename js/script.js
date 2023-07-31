"use strict";

//* if JavaScript is disabled main is display: none;
document.querySelector("main").style["display"] = "flex";

const userSelect = (function () {
  const noSelect = `
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
    `;

  return {
    disable() {
      const body = document.querySelector("body");
      body.style.cssText += noSelect;
    },

    enable() {
      const body = document.querySelector("body");
      body.removeAttribute("style");
    },
  };
})();

const grid = (function () {
  let currentMode = "single-color";
  const gridContainer = document.querySelector(".grid-container");
  let isMouseDragging = false;
  let dragButton = null;
  const hoverMode = document.getElementById("hover-mode");
  const colors = [];
  let colorIndex = 0;
  const moves = [];
  const movesUndone = [];
  const MAX_UNDO_MOVES = 4500;
  let currentUndoMoves = 0;

  gridContainer.addEventListener("mousedown", (event) => {
    if (isMouseDragging) return;
    //* to prevent dragging of grid
    event.preventDefault();
    const color = getColor();
    event.target.style.backgroundColor = color;
    registerMove(event.target, color);
    isMouseDragging = true;
    dragButton = event.button;
  });

  gridContainer.addEventListener("mouseover", (event) => {
    if (!isMouseDragging && !hoverMode.checked) return;
    const color = getColor();
    event.target.style.backgroundColor = color;
    registerMove(event.target, color);
  });

  window.addEventListener("mouseup", (event) => {
    if (isMouseDragging && event.button === dragButton) {
      isMouseDragging = false;
    }
  });

  gridContainer.addEventListener("contextmenu", (event) => {
    //* to prevent to opening of context menu on grid
    event.preventDefault();
  });
  
  function getColor() {
    if (currentMode === "eraser") return "#fffde9";
    if (currentMode === "single-color") return colors[0];
    if (colorIndex >= colors.length) colorIndex = 0;
    const color = colors[colorIndex];
    colorIndex++;
    if (currentMode === "multiple-color") return color;
    const red = Math.floor(Math.random() * 256).toString(16);
    const green = Math.floor(Math.random() * 256).toString(16);
    const blue = Math.floor(Math.random() * 256).toString(16);
    return `#${red}${green}${blue}`;
  }
  
  function registerMove(grid, color) {
    const gridOfLastMoves = moves.at(-1);
    if (gridOfLastMoves?.at(0) === grid &&
      gridOfLastMoves?.at(-1) === color) return;

    if (currentUndoMoves >= MAX_UNDO_MOVES) {
      const gridOfFirstMoves = moves[0];
      if (gridOfFirstMoves.length > 2) gridOfFirstMoves.pop();
      if (gridOfFirstMoves.length === 2) moves.shift();
    }

    if (gridOfLastMoves?.at(0) === grid) {
      gridOfLastMoves.push(color);
      currentUndoMoves++;
      console.log(moves);
      return;
    }
    moves.push([grid, color]);
    console.log(moves);
  }

  return {
    undo() {

    },

    setColors() {
      const colorInputs = document.querySelectorAll(
        `label[for="${currentMode}"] input`
      );
      colors.splice(0);
      if (colorInputs.length)
        colorInputs.forEach((colorInput) => {
          const color = colorInput.value;
          colors.push(color);
        });
    },

    setMode(mode) {
      currentMode = mode;
    },

    render(size) {
      document.documentElement.style.setProperty("--grid-size", `${size}`);
      const gridHtmlElement = `<div class="grid"></div>`;
      const gridsInnerHtml = gridHtmlElement.repeat(size * size);
      const gridSize = document.querySelector(".grid-size-display");
      gridSize.innerText = `${size} X ${size}`;
      gridContainer.innerHTML = gridsInnerHtml;
    },

    clearMoves() {
      moves.splice(0);
      console.log(moves);
    },

    clearMovesUndone() {
      movesUndone.splice(0);
    },
  };
})();

//* radio mode
const radioInputs = document.querySelectorAll("input[type='radio']");
radioInputs.forEach((radioInput) => {
  updateCurrentMode.call(radioInput);
  radioInput.addEventListener("change", updateCurrentMode);
});

//* color
const colorInputs = document.querySelectorAll("input[type='color']");
colorInputs.forEach((colorInput) => {
  updateColor.call(colorInput);
  colorInput.addEventListener("change", updateColor);
});

//* Range
const range = {
  target: document.querySelector(".range"),
  isMouseDragging: false,
  value: 16,
  min: 2,
  max: 64,
  thumb: document.querySelector(".range-thumb"),
  track: document.querySelector(".range-track"),

  calculateThumbValue(event) {
    if (event.type.startsWith("mouse") && !range.isMouseDragging) return;

    const clientX = event.type.startsWith("mouse")
      ? event.clientX
      : event.touches[0].clientX;

    const trackLeft = range.track.getBoundingClientRect().left;
    const trackRight = trackLeft + range.track.clientWidth;
    const percentageX =
      ((Math.min(Math.max(clientX, trackLeft), trackRight) - trackLeft) /
        range.track.clientWidth) *
      100;

    range.target.style.setProperty("--left-offset", `${percentageX}%`);

    const value = ((range.max - range.min) * percentageX) / 100 + range.min;
    range.value = Math.floor(value);
  },

  onMouseMovement(event) {
    range.calculateThumbValue(event);
    grid.render(range.value);
  },

  onStartInteraction(event) {
    event.preventDefault();
    if (event.type.startsWith("mouse") && event.buttons === 1) {
      range.isMouseDragging = true;
      window.addEventListener("mousemove", range.onMouseMovement);
      userSelect.disable();
      document.querySelector("body").style.cursor = "pointer";
    }
    range.calculateThumbValue(event);
    grid.render(range.value);
  },

  onEndInteraction(event) {
    if (event.button === 0 && range.isMouseDragging) {
      range.isMouseDragging = false;
      window.removeEventListener("mousemove", range.onMouseMovement);
      userSelect.enable();

      document.querySelector("body").removeAttribute("style");
    }
  },
};

range.target.addEventListener("mousedown", range.onStartInteraction);

range.target.addEventListener("touchstart", range.onStartInteraction);
range.target.addEventListener("touchmove", range.onStartInteraction);

window.addEventListener("mouseup", range.onEndInteraction);

grid.render(range.value);

const clearButton = document.querySelector(".clear-button");
clearButton.addEventListener("click", onClear);

function onClear() {
  grid.render(range.value);
  grid.clearMoves();
  grid.clearMovesUndone();
}

function updateColor() {
  const color = this.value;
  this.parentElement.style["background-color"] = `${color}`;
  grid.setColors();
}

function updateCurrentMode() {
  if (!this.checked) return;

  const labels = document.querySelectorAll("label.button");
  labels.forEach((label) => {
    if (this.id === label.getAttribute("for")) {
      label.classList.add("checked");
      let currentMode = label.getAttribute("for");
      grid.setMode(currentMode);
      grid.setColors();
    } else if (this.id !== label.getAttribute("for")) {
      label.classList.remove("checked");
    }
  });
}
