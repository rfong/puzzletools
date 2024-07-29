const langSelect = document.getElementById("langSelect");
const inpField = document.getElementById("inputText");
const scoreButton = document.getElementById("scoreButton");
const scoreOutput = document.getElementById("scoreOutput");

function displayOutput(text) {
  scoreOutput.innerHTML = text;
}

// Load a python file as a module
async function loadPythonFile(fname) {
  await pyodide.runPythonAsync(`
    from pyodide.http import pyfetch
    response = await pyfetch("./${fname}")
    with open("${fname}", "wb") as f:
      f.write(await response.bytes())
  `)
  return pyodide.pyimport(fname.split(".")[0]);
}

// Pretty-print the lang key for display
function getLangName(lang) {
  return lang[0].toUpperCase() + lang.slice(1, lang.length);
}

// Fetch rubric data and setup
function setupInterface() {
  // Populate lang dropdown with all langs available in rubrics
  let langOptionHtml = "";
  let langKeys = scorer.getLangs().toJs().sort();
  for (const langKey of langKeys) {
    langOptionHtml += `<option value="${langKey}">${scorer.getLangName(langKey)}</option>`;
  }
  langSelect.innerHTML = langOptionHtml;

  // When lang dropdown changes, update the visible char set.
  document.getElementById("langSelect").addEventListener("change", (evt) => {
    let lang = langSelect.value;
    let scores = scorer.rubrics.toJs()["polish"].scores.toJs();
    let tokens = scores.keys().toArray().sort();
    document.getElementById("langCharSet").innerHTML = `
      Allowed characters: ${tokens.join(", ")}`;
  });

  // On button click, evaluate and display the score
  scoreButton.addEventListener("click", () => {
    let lang = langSelect.value;
    let inputText = inpField.value.toUpperCase();

    let result = scorer.scorePhrase(lang, inputText);
    switch (typeof(result)) {
      case 'string': 
        // handle (expected) error message
        console.log(result);
        displayOutput(`${inputText}<br/>${result}
          <br/>Make sure you have selected the correct language.
          <br/>Also check that you are using legal Scrabble characters; some languages' tiles do not allow certain diacritics.
        `);
        break;
      case 'object':
        displayOutput(`${inputText} = ${result.toJs().join(' ')} (${scorer.getLangName(lang)})`);
        break;
    }
  });

  // Set default example values
  inpField.value = "Pchnąć w tę łódź jeża lub ośm skrzyń fig";
  langSelect.value = "polish";
  langSelect.dispatchEvent(new Event('change'));
  displayOutput("");

}

const pyodide = await loadPyodide();
const rubricsModule = await loadPythonFile("rubrics.py");
const scorer = await loadPythonFile("score.py");
setupInterface();
