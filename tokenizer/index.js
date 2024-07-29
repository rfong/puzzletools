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
    myTokenizer;

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

// setup event listeners
function setup() {
  // when button is clicked, run the tokenizer and display parsed tokens
  tokenizeButton.addEventListener("click", () => {
    const tokenBank = tokensInput.value.split(delimiterInput.value);
    let text = textInput.value;
    // Recase text
    switch (caseSelect.value) {
      case "upper":
        text = text.toUpperCase(); break;
      case "lower":
        text = text.toLowerCase(); break;
    }
  
    // Run tokenizer
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
    Array.from(document.getElementsByClassName("hidden")).forEach((el) => {
      if (el.id != "mapContainer") {
        el.classList.remove("hidden");
      }
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

