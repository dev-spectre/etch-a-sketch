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
    value: 16,
    min: 2,
    max: 64,
    thumb: document.querySelector(".range-thumb"),
    track: document.querySelector(".range-track"),
        
    calculateThumbValue(event) {
        if (event.type.startsWith("mouse") && !range.isMouseDragging) return;

        const clientX = (event.type.startsWith("mouse"))?
            event.clientX :
            event.touches[0].clientX;

        const trackLeft = range.track.getBoundingClientRect().left;
        const trackRight = trackLeft + range.track.clientWidth;
        const percentageX = 
            (Math.min(Math.max(clientX, trackLeft), trackRight) -
            trackLeft) / range.track.clientWidth * 100;

        range.target.style.setProperty("--left-offset", `${percentageX}%`);

        const value = (range.max - range.min) * percentageX / 100 + range.min;
        range.value = Math.floor(value);
    },
    
    onMouseMovement(event) {
        range.calculateThumbValue(event);
        renderGrid(range.value);
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
        renderGrid(range.value);
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



//* toggle switch
const hoverMode = document.querySelector("#hover-mode");
let eventType = (hoverMode.checked)? "mousemove": "mousedown";

//* Grid
renderGrid(range.value);
function renderGrid(size) {
    const grid = `<div class="grid"></div>`;
    const gridContainer = document.querySelector(".grid-container");
    document.documentElement.style.setProperty("--grid-size",`${size}`);
    const grids = grid.repeat(size*size);
    const gridSize = document.querySelector(".grid-size-display");
    gridSize.innerText = `${size} X ${size}`;
    gridContainer.innerHTML = grids;
    console.log("render grid");
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