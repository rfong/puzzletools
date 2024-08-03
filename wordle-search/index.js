import { makeWordleSearchApp, flatten } from './wordle-logic.js';

makeWordleSearchApp(
  'wordleSearchApp',
  'WordleSearchCtrl', 
  './wordnik_by_len.json',
  'abcdefghijklmnopqrstuvwxyz'.split(''),
  function wordSearch() {
    // get all negations for each position
    let negations = this.yellows.map(
      (yellowRow) => yellowRow.concat(this.greys));
    // additional required characters
    let requiredChars = Array.from(new Set(flatten(this.yellows)));
    console.log(requiredChars);
    // build the regex
    var regStr = "";
    for (var i=0; i<this.wordLen; i++) {
      // if a green char exists, just set it at this position and skip the rest
      if (this.isValidChar(this.greens[i])) {
        regStr += this.greens[i];
        continue;
      }
      // otherwise, use the negations
      regStr += `[^${negations[i].join('')}]`;
    }
    regStr = `,${regStr},`;
    const re = new RegExp(regStr, 'g');
    return (
      $scope.wordsByLen[$scope.wordLen].match(re)
      .map((s) => s.replace(/,/g, ''))
    );
  },
  { // other scope addons
    // prompt for a green character and set it
    getAndSetGreen: function(posn) {
      this.setGreen(posn, window.prompt("set a character").trim() ?? '');
    },
  },
);
