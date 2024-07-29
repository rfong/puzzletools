const langSelect = document.getElementById("langSelect");
const inpField = document.getElementById("inputText");
const scoreButton = document.getElementById("scoreButton");
const scoreOutput = document.getElementById("scoreOutput");

function displayOutput(text) {
  scoreOutput.innerHTML = text;
}

// Fetch rubric data and setup
fetch("./rubrics.json")
.then((response) => response.json())
.then((data) => {
  let rubrics = parseRawRubricData(data);

  // Populate lang dropdown with all langs available in rubrics
  let langOptionHtml = "";
  let langKeys = Object.keys(rubrics).sort();
  for (const langKey of langKeys) {
    langOptionHtml += `<option value="${langKey}">${rubrics[langKey].langName}</option>`;
  }
  langSelect.innerHTML = langOptionHtml;

  // When lang dropdown changes, update the visible char set.
  document.getElementById("langSelect").addEventListener("change", (evt) => {
    let lang = langSelect.value;
    document.getElementById("langCharSet").innerHTML = `
      Allowed characters: ${Object.keys(rubrics[lang].scores).sort().join(", ")}`;
  });

  // Set default example values
  inpField.value = "Pchnąć w tę łódź jeża lub ośm skrzyń fig";
  langSelect.value = "polish";
  langSelect.dispatchEvent(new Event('change'));

  // On button click, evaluate and display the score
  scoreButton.addEventListener("click", () => {
    let lang = langSelect.value;
    let inputText = inpField.value.toUpperCase();

    let scoreText = getScores(rubrics[lang], inputText);
    if (scoreText) {
      displayOutput(`${inputText} = ${scoreText} (${rubrics[lang].langName})`);
    }
  });
});

function getScores(rubric, text) {
  let scores = [];
  for (const word of text.split(' ')) {
    let wordScore = 0;
    let tokens = tokenize(word, rubric);
    if (tokens === null) {
      return null;
    }
    for (const token of tokens) {
      wordScore += rubric.scores[token];
    }
    scores.push(wordScore);
  }
  return scores.join(" ");
}

// Split text into a list of possibly multicharacter tokens, specified 
// in `rubric`.
// Treat a null return value as an error.
function tokenize(text, rubric) {
  let tokens = [];
  let pos = 0;
  while (pos < text.length) {
    let token = findNextToken(rubric, text, pos);
    if (token === null) {
      return null;
    }
    tokens.push(token);
    pos += token.length;
  }
  return tokens;
}

// Using `rubric`, find the next possibly-multicharacter token in `text`.
// Treat a null return value as an error.
function findNextToken(rubric, text, startPos) {
  // Start searching in descending order of possible token lengths
  let tokenLen = rubric.maxTokenLen;
  let token;
  while (tokenLen > 0) {
    token = text.slice(startPos, startPos + tokenLen);
    if (token in rubric.scores) {
      return token;
    }
    tokenLen -= 1;
  }
  displayOutput(
    `ERROR: Could not find ${rubric.langName} token matching "${token}". 
    <br/>Make sure you have selected the correct language.
    <br/>Also check that you are using legal Scrabble characters; some languages' tiles do not allow certain diacritics.`);
  return null;
}

function parseRawRubricData(data) {
  // Parse all raw rubric text to dicts
  let rubrics = {};
  for (const lang in data) {
    let lines = data[lang].split('\n');
    let rubric = {};
    let maxTokenLen = 0;

    // Map chars to point values
    for (var line of lines) {
      line = line.trim();
      let score = parseInt(line.split(' ')[0]);

      // Following the "<score>:" is a comma-separated list of Scrabble tile
      // tokens, sometimes multicharacter tokens.
      for (const substr of line.split(':')[1].trim().split(',')) {
        var ch = substr.trim().split(' ')[0];
        rubric[ch] = score;
        maxTokenLen = Math.max(maxTokenLen, ch.length);
      }
    }

    rubrics[lang] = {
      langName: lang[0].toUpperCase() + lang.slice(1, lang.length),
      maxTokenLen: maxTokenLen,
      scores: rubric,
    };
  }
  return rubrics;
}
