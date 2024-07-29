import { InvalidTokenError, Tokenizer } from "./tokenizer.js";
import { getOutput, getUpdatedMap, isWhitespaceInTokens } from "./helpers.js";

const tokensInput = document.getElementById("tokens"),
      delimiterInput = document.getElementById("delimiter"),
      textInput = document.getElementById("input"),
      caseSelect = document.getElementById("caseSelect"),
      tokenizeButton = document.getElementById("tokenizeButton"),
      delimiterOutput = document.getElementById("outDelimiter"),
      outputEl = document.getElementById("output"),
      mapCheckbox = document.getElementById("mapCheckbox"),
      mapContainer = document.getElementById("mapContainer");

let outputTokens,
    tokMap = {},
    myTokenizer,
    lastInputs = {};

// set some default example values
tokensInput.value = "a,b,c,aaa";
textInput.value = "aabaaac";

// Set new output token values, and refresh the display
function setOutput(tokens) {
  outputTokens = tokens;
  refreshOutput();
}

// Update the output to match current settings, without changing the 
// underlying token representation.
function refreshOutput() {
  outputEl.innerHTML = getOutput(
    outputTokens, delimiterOutput.value, tokMap, mapCheckbox.checked);
}

function getTokenBank() {
  return tokensInput.value.split(delimiterInput.value);
}

// return true if inputs have changed since last run.
// note that we care if the computed token bank has changed, but don't care if 
// delimiter & tokens change together such that token bank is the same.
function hasInputChanged() {
  if (caseSelect.value != lastInputs.caseSel) return true;
  if (textInput.value != lastInputs.text) return true;
  console.log(getTokenBank(), lastInputs.tokenBank, getTokenBank().equals(lastInputs.tokenBank));
  return !getTokenBank().equals(lastInputs.tokenBank);
}

// if inputs have changed, do something about it
function checkInputChanged() {
  const warningEl = document.getElementById("inputChangeWarning");
  if (hasInputChanged()) warningEl.classList.remove("hidden");
  else warningEl.classList.add("hidden");
}

// setup event listeners
function setup() {

  // setup input change listeners
  [tokensInput, delimiterInput, textInput].forEach((el) => {
    el.addEventListener("input", checkInputChanged);
  });
  caseSelect.addEventListener("change", checkInputChanged);
  
  // when button is clicked, run the tokenizer and display parsed tokens
  tokenizeButton.addEventListener("click", () => {
    const tokenBank = getTokenBank();
    let text = textInput.value;
    // recase text
    switch (caseSelect.value) {
      case "upper":
        text = text.toUpperCase(); break;
      case "lower":
        text = text.toLowerCase(); break;
    }
    // save inputs for future comparison
    lastInputs = {
      tokenBank: tokenBank,
      text: text,
      caseSel: caseSelect.value,
    };
    checkInputChanged();
  
    // run tokenizer
    let myTokenizer = new Tokenizer(tokenBank);
    try {
      let tokens = myTokenizer.tokenize(text);
      // Update display and token map
      setOutput(tokens);
      refreshMap(tokenBank);
    } catch (err) {
      // If it failed to parse, output an error message
      if (err instanceof InvalidTokenError) {
        setOutput([]);
        window.alert(err.message);
        // Hide empty output panels
        Array.from(document.getElementsByClassName("hiddenIfEmpty")).forEach((el) => {
          el.classList.add("hidden");
        });
        return;
      }
      throw err;
    }
    // Unhide output panels
    Array.from(document.getElementsByClassName("hiddenIfEmpty")).forEach((el) => {
      el.classList.remove("hidden");
    });
  });
  
  // automatically change output display when the output delimiter value changes
  delimiterOutput.addEventListener("input", (evt) => {
    refreshOutput();
  });
  
  // when substitution map is toggled, update display
  mapCheckbox.addEventListener("change", () => {
    if (mapCheckbox.checked == false) {
      mapContainer.classList.add("hidden");
    } else {
      mapContainer.classList.remove("hidden");
    }
    // in either case, refresh the output
    refreshOutput();
  });
}
setup();

// received new tokens. update the map, but preserve any values mapped to 
// tokens that are still in the current set.
function refreshMap(tokens) {
  tokMap = getUpdatedMap(tokMap, tokens);
  let hasWhitespace = isWhitespaceInTokens(tokens);

  // update the HTML
  mapContainer.innerHTML = "";
  for (const tok of tokens) { // follow the canonical token order
    let el = document.createElement("div");
    el.innerHTML = (
      hasWhitespace
      ? `<span class="show-boundaries">${tok}</span>`
      : tok
    );
    el.innerHTML += ` -> <input data-tok="${tok}" value="${tokMap[tok]}"/>`;
    mapContainer.appendChild(el);
  }

  for (const el of mapContainer.querySelectorAll("input")) {
    el.addEventListener("input", () => {
      tokMap[el.getAttribute("data-tok")] = el.value;
      refreshOutput();
    });
  }
}

if(Array.prototype.equals) {
  console.warn("Overriding existing Array.prototype.equals.");
}
Array.prototype.equals = function (array) {
  // Sanity checks
  if (!array) return false;
  if (array === this) return true;
  if (this.length != array.length) return false;
  // Compare all values
  for (var i=0; i<this.length; i++) {
    // if both elements are arrays, recurse
    if (this[i] instanceof Array && array[i] instanceof Array
        && !this[i].equals(array[i])
    ) return false;
    // direct comparison for primitives. this won't work for objects
    if (this[i] != array[i]) return false;
  }
  return true;
}
