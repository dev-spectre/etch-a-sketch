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
  const gridBackgroundColor = getComputedStyle(
    document.documentElement
  ).getPropertyValue("--secondary-color");
  let isMouseDragging = false;
  let dragButton = null;
  const hoverMode = document.getElementById("hover-mode");
  const colors = [];
  let colorIndex = 0;

  gridContainer.addEventListener("mousedown", (event) => {
    if (isMouseDragging) return;
    //* to prevent dragging of grid
    event.preventDefault();
    colorGrid(event.target);
    isMouseDragging = true;
    dragButton = event.button;
  });

  gridContainer.addEventListener("mouseover", (event) => {
    if (!isMouseDragging && !hoverMode.checked) return;
    colorGrid(event.target);
  });

  window.addEventListener("mouseup", (event) => {
    if (isMouseDragging && event.button === dragButton) {
      isMouseDragging = false;
    }
  });

  let prevGridPosition = null;
  gridContainer.addEventListener("touchmove", (event) => {
    if (event.touches.length > 1 || !hoverMode.checked) return;
    //* to prevent scroll
    event.preventDefault();
    const gridSize = event.target.clientWidth;
    const gridRect = gridContainer.getBoundingClientRect();
    const gridX = event.touches[0].pageX - gridRect.left;
    const gridY = event.touches[0].pageY - gridRect.top;
    const SAFE_MARGIN_PIXELS = 5;
    if (
      gridX < 0 ||
      gridY < 0 ||
      gridX >= gridRect.right - gridRect.left - SAFE_MARGIN_PIXELS ||
      gridY >= gridRect.bottom - gridRect.top - SAFE_MARGIN_PIXELS
    )
      return;
    const gridRow = Math.floor(gridY / gridSize);
    const gridColumn = Math.floor(gridX / gridSize);
    const gridPosition = gridRow * range.value + gridColumn + 1;
    if (gridPosition === prevGridPosition || gridPosition > range.value ** 2)
      return;
    prevGridPosition = gridPosition;
    const grid = document.querySelector(
      `.grid-container :nth-child(${gridPosition})`
    );
    colorGrid(grid);
  });

  gridContainer.addEventListener("contextmenu", (event) => {
    //* to prevent to opening of context menu on grid
    event.preventDefault();
  });

  function colorGrid(grid) {
    const color = getColor();
    if (
      !colorHistory.has(grid) ||
      (colorHistory.has(grid) && colorHistory.get(grid).at(-1) !== color)
    ) {
      grid.style.backgroundColor = color;
      registerMove(grid, color);
    }
  }

  function getColor() {
    if (currentMode === "eraser") return gridBackgroundColor;
    if (currentMode === "single-color") return colors[0];
    if (colorIndex >= colors.length) colorIndex = 0;
    const color = colors[colorIndex];
    colorIndex++;
    if (currentMode === "multiple-color") return color;
    const red = Math.floor(Math.random() * 256);
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);
    return `rgb(${red}, ${green}, ${blue})`;
  }

  const colorHistory = new Map();
  const timeline = [];
  const currentMove = {
    grid: null,
    color: null,
  };
  let timelineIndex = 0;
  function registerMove(grid, color) {
    if (timelineIndex !== timeline.length - 1)
      timeline.splice(timelineIndex + 1);
    currentMove.grid = grid;
    currentMove.color = color;
    timeline.push({ ...currentMove });
    timelineIndex = timeline.length - 1;
    if (colorHistory.get(grid)?.at(-1) === color) return;
    if (!colorHistory.get(grid)?.push(color)) colorHistory.set(grid, [color]);
  }

  return {
    undo() {
      if (!timeline.length || timelineIndex < 0) return;

      const gridToUndo = currentMove.grid;

      let lastColorOfGrid = (function () {
        const colorHistoryOfGrid = colorHistory.get(gridToUndo);
        if (colorHistoryOfGrid.length <= 1 || !timelineIndex) {
          colorHistoryOfGrid.pop();
          return gridBackgroundColor;
        }
        colorHistoryOfGrid.pop();
        return colorHistoryOfGrid.at(-1);
      })();

      gridToUndo.style.backgroundColor = lastColorOfGrid;

      timelineIndex--;
      if (timelineIndex >= 0) {
        currentMove.grid = timeline[timelineIndex].grid;
        currentMove.color = timeline[timelineIndex].color;
      }
    },

    redo() {
      if (!timeline.length) return;
      if (timelineIndex >= timeline.length - 1) return;
      timelineIndex++;
      currentMove.grid = timeline[timelineIndex].grid;
      currentMove.color = timeline[timelineIndex].color;
      currentMove.grid.style.backgroundColor = currentMove.color;
      colorHistory.get(currentMove.grid).push(currentMove.color);
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
      const gridHtmlElement = `<div class="grid"><a href="#"></a></div>`;
      const gridsInnerHtml = gridHtmlElement.repeat(size * size);
      const gridSize = document.querySelector(".grid-size-display");
      gridSize.innerText = `${size} X ${size}`;
      gridContainer.innerHTML = gridsInnerHtml;
    },

    clearMoves() {
      timeline.splice(0);
      colorHistory.clear();
      currentMove.grid = null;
      currentMove.color = null;
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

const undoButton = document.querySelector(".undo");
undoButton.addEventListener("click", grid.undo);
window.addEventListener("keydown", function (event) {
  if (event.ctrlKey && event.key.toLowerCase() === "z" && !event.shiftKey)
    grid.undo();
});

const redoButton = document.querySelector(".redo");
redoButton.addEventListener("click", grid.redo);
window.addEventListener("keydown", function (event) {
  if (
    event.ctrlKey &&
    ((event.key.toLowerCase() === "z" && event.shiftKey) ||
      event.key.toLowerCase() === "y")
  )
    grid.redo();
});

const clearButton = document.querySelector(".clear-button");
clearButton.addEventListener("click", onClear);

function onClear() {
  grid.render(range.value);
  grid.clearMoves();
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
