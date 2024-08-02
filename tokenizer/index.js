import { setHidden, getEl } from "../helpers.js";
import { ParseError, isTokenBankValid, InvalidTokenBankError, Tokenizer } from "./tokenizer.js";
import { getOutput, getUpdatedMap, isWhitespaceInTokens } from "./helpers.js";

// shorthand for get element by id
function getEl(id) {
  return document.getElementById(id);
}

const tokensInput = getEl("tokens"),
      delimiterInput = getEl("delimiter"),
      textInput = getEl("input"),
      caseSelect = getEl("caseSelect"),
      tokenizeButton = getEl("tokenizeButton"),
      delimiterOutput = getEl("outDelimiter"),
      outputEl = getEl("output"),
      mapCheckbox = getEl("mapCheckbox"),
      mapContainer = getEl("mapContainer");

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

function getAndValidateTokenBank() {
  let tokens = tokensInput.value.split(delimiterInput.value);
  try {
    if (isTokenBankValid(tokens)) {
      console.debug("token bank is valid");
      tokenizeButton.removeAttribute("disabled");
      getEl("tokenBankWarning").innerHTML = "";
    }
  } catch (err) {
    if (err instanceof InvalidTokenBankError) {
      console.debug(err.message);
      tokenizeButton.setAttribute("disabled", true);
      getEl("tokenBankWarning").innerHTML = err.message;
    } else { throw err; }
  }
  return tokens;
}

// return true if inputs have changed since last run.
// note that we care if the computed token bank has changed, but don't care if 
// delimiter & tokens change together such that token bank is the same.
function hasInputChanged() {
  // this comes first to ensure the validity check runs
  let tokens = getAndValidateTokenBank();

  if (caseSelect.value != lastInputs.caseSel) return true;
  if (textInput.value != lastInputs.text) return true;
  console.debug(tokens, lastInputs.tokenBank, tokens.equals(lastInputs.tokenBank));
  return !tokens.equals(lastInputs.tokenBank);
}

// if inputs have changed, do something about it
function checkInputChanged() {
  // hide change warning if nothing has changed, show if it has changed
  setHidden(getEl("inputChangeWarning"), !hasInputChanged());
  console.debug("has input changed?:", hasInputChanged());
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
    const tokenBank = getAndValidateTokenBank(); 
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
    myTokenizer = new Tokenizer(tokenBank);
    try {
      let tokens = myTokenizer.tokenize(text);
      // Update display and token map
      setOutput(tokens);
      refreshMap(tokenBank);
    } catch (err) {
      // If it failed to parse, output an error message
      if (err instanceof ParseError) {
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
    const mapPanel = getEl("mapPanel");
    if (mapCheckbox.checked == false) {
      mapPanel.classList.add("hidden");
    } else {
      mapPanel.classList.remove("hidden");
    }
    // in either case, refresh the output
    refreshOutput();
  });

  // listen for map autofill buttons
  Array.from(document.getElementsByClassName("mapButton")).forEach((el) => {
    el.addEventListener("click", (evt) => {
      switch(evt.target.id) {
        // TODO should this only be available for 1-26?
        case "fillLetters":
          var i = 1;
          for (const tok of myTokenizer.tokens) {
            tokMap[tok] = String.fromCharCode(64 + i);
            i++;
          }
          break;
        case "fillNumsOne":
        case "fillNumsZero":
          var i = (evt.target.id.endsWith("Zero") ? 0 : 1);
          for (const tok of myTokenizer.tokens) {
            tokMap[tok] = i;
            i = (i+1)%10;
          }
          break;
      }
      refreshDisplay();
    });
  })
}
setup();

// refresh all display based on current state
function refreshDisplay() {
  refreshMapDisplay();
  refreshOutput();
}

// received new tokens. update the map, but preserve any values mapped to 
// tokens that are still in the current set.
function refreshMap() {
  let tokens = myTokenizer.tokens;
  tokMap = getUpdatedMap(tokMap, tokens);
  refreshMapDisplay();
}
// just refresh the display without changing state
function refreshMapDisplay() {
  let tokens = myTokenizer.tokens;
  let hasWhitespace = isWhitespaceInTokens(tokens);

  // update which map buttons are visible
  setHidden(getEl("fillLetters"), tokens.length > 26);
  setHidden(getEl("fillNumsOne"), tokens.length > 10);
  setHidden(getEl("fillNumsZero"), tokens.length > 10);

  // update the HTML contents
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
