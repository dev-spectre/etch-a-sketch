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
        }
    }
})();

let currentMode = "single-color";

//* radio mode
const radioInputs = document.querySelectorAll("input[type='radio']");
radioInputs.forEach(radioInput => {
    updateCurrentMode.call(radioInput);
    radioInput.addEventListener("change", updateCurrentMode);
});

//* color
const colorInputs = document.querySelectorAll("input[type='color']");
colorInputs.forEach(colorInput => {
    updateWrapperBackgroundColor.call(colorInput);
    colorInput.addEventListener("change", updateWrapperBackgroundColor);
});

//* Range
const range = {
    target: document.querySelector(".range"),
    isMouseDragging: false,
    value: 64,
    min: 2,
    max: 64,
    thumb: document.querySelector(".range-thumb"),
    track: document.querySelector(".range-track"),
    isCalculatingValue: false,

    getTrackThumbRatio() {
        const thumbWidth = range.thumb.clientWidth;
        const trackWidth = range.track.clientWidth;
        const ratio = Math.round(trackWidth / thumbWidth * 1000) / 1000;
        return ratio;
    },
        
    adjustThumb(event) {
        if (!range.isMouseDragging || range.isCalculatingValue) return;
        range.isCalculatingValue = true;
        

        range.isCalculatingValue = false;
    },
}

range.target.addEventListener("mousedown", (event) => {
    if (event.buttons === 1) range.isMouseDragging = true;
    userSelect.disable();
    document.querySelector("body").style.cursor = "pointer";
});

window.addEventListener("mousemove", range.adjustThumb);

window.addEventListener("mouseup", (event) => {
    if (event.button === 0 && range.isMouseDragging) {
        range.isMouseDragging = false;
        userSelect.enable();
        
        document.querySelector("body").removeAttribute("style");
    }
});

//* Grid
renderGrid(range.value);
function renderGrid(size) {
    const grid = `<div class="grid"></div>`;
    const gridContainer = document.querySelector(".grid-container");
    document.documentElement.style.setProperty("--grid-size",`${size}`);
    const grids = grid.repeat(size*size);
    gridContainer.innerHTML += grids;
}

function updateWrapperBackgroundColor() {
    const color = this.value;
    this.parentElement.style["background-color"] = `${color}`;
}

function updateCurrentMode() {
    if (!this.checked) return;

    const labels = document.querySelectorAll("label.button");
    labels.forEach(label => {
        if (this.id === label.getAttribute("for")) {
            label.classList.add("checked");
            currentMode = label.getAttribute("for");
        } else if (this.id !== label.getAttribute("for")) {
            label.classList.remove("checked");
        }
    });
}