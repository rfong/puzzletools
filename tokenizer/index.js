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
    tokMap = {};

// set some default values
tokensInput.value = "a,b,c,aaa";
textInput.value = "aabaaac";

function setOutput(tokens) {
  outputTokens = tokens;
  refreshOutput();
}

// Update the output to match current settings, without changing the 
// underlying token value.
function refreshOutput() {
  console.log("is mapcheckbox on?:", mapCheckbox.checked);
  let toks = (
    mapCheckbox.checked
    ? outputTokens.map((tok) => tokMap[tok])
    : outputTokens);
  outputEl.innerHTML = toks.join(delimiterOutput.value);
}

function setup() {
  // when button is clicked, run the tokenizer and display parsed tokens
  tokenizeButton.addEventListener("click", () => {
    const delim = delimiterInput.value;
    const tokenBank = tokensInput.value.split(delim);
    let text = textInput.value;
    switch (caseSelect.value) {
      case "upper":
        text = text.toUpperCase(); break;
      case "lower":
        text = text.toLowerCase(); break;
    }
  
    let toki = new Tokenizer(tokenBank);
    let tokens = toki.tokenize(text);
    setOutput(tokens);
    regenerateMap(tokens);
    Array.from(document.getElementsByClassName("hidden")).forEach((el) => {
      if (el.id != "mapContainer") {
        el.classList.remove("hidden");
      }
    });
  });
  
  // automatically change output display when the output delimiter value changes
  delimiterOutput.addEventListener("input", (evt) => {
    refreshOutput(outputTokens);
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
function regenerateMap(tokens) {
  // delete obsolete tokens from map
  for (const tok of Object.keys(tokMap)) {
    if (!tokens.includes(tok)) {
      delete tokMap[tok];
    }
  }
  // add new tokens to map
  for (const tok of tokens) {
    if (!Object.keys(tokMap).includes(tok)) {
      tokMap[tok] = tok;
    }
  }

  // update the HTML
  mapContainer.innerHTML = "";
  let sortedKeys = Object.keys(tokMap).sort();
  for (const tok of sortedKeys) {
    console.log(tok, tokMap[tok]);
    let el = document.createElement("div");
    el.innerHTML = `${tok} -> <input data-tok="${tok}" value="${tokMap[tok]}"/>`;
    mapContainer.appendChild(el);
  }

  for (const el of mapContainer.querySelectorAll("input")) {
    el.addEventListener("input", () => {
      tokMap[el.getAttribute("data-tok")] = el.value;
      refreshOutput();
    });
  }
}

// this error is thrown when text is unparseable with the given set of tokens
class InvalidTokenError extends Error {
  constructor(message, searchText, tokenBank) {
    super(message);
    this.name = "InvalidTokenError";
    this.searchText = searchText;
    this.tokenBank = tokenBank;
  }
}

// multi-char string tokenizer
class Tokenizer {
  constructor(tokens) {
    this.tokens = tokens;
    this.maxLen = 0;
    for (const tok of tokens) {
      this.maxLen = Math.max(this.maxLen, tok.length);
    }
  }

  // Search for the next possible token in descending length order,
  // or throw an InvalidTokenError if not possible
  findNextToken(text, startPos) {
    let tokLen = this.maxLen;
    while (tokLen > 0) {
      let token = text.slice(startPos, startPos+tokLen);
      if (this.tokens.includes(token)) {
        return token;
      }
      tokLen -= 1;
    }
    throw new InvalidTokenError(
      "Cannot find a valid token",
      text.slice(startPos, startPos+this.maxLen),
      this.tokens,
    );
  }

  // Return list of tokens in this text
  tokenize(text) {
    let tokens = [];
    let pos = 0;
    while (pos < text.length) {
      tokens.push(this.findNextToken(text, pos));
      pos += tokens[tokens.length-1].length;
    }
    return tokens;
  }

}
