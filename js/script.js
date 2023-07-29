document.querySelector("main").style["display"] = "flex";

let currentMode = "single-color";

const radioInputs = document.querySelectorAll("input[type='radio']");
radioInputs.forEach(radioInput => {
    updateCurrentMode.call(radioInput);
    radioInput.addEventListener("change", updateCurrentMode);
});

const colorInputs = document.querySelectorAll("input[type='color']");
colorInputs.forEach(colorInput => {
    updateWrapperBackgroundColor.call(colorInput);
    colorInput.addEventListener("change", updateWrapperBackgroundColor);
});


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