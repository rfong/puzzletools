import { getEl } from '../../helpers.js';
import { makeWordleSearchApp, flatten } from '../wordle-logic.js';

// phonemes by category
const phonemes = {
  monophthongs: 'ɑæəʌɔɛɝɚɪiʊu'.split(''),
  dipthongs: ['aʊ', 'aɪ', 'eɪ', 'oʊ', 'ɔɪ'],
  consonants: 'bʧdðfghʤklmnŋprsʃtθvwjzʒ'.split(''),
};

// word delimiter used in the json data source
const ipaDelim = ',';

// map IPA chars to CMU designations
const ipaToCmu = {
  "ɑ": "AA",
  "æ": "AE",
  "ə": "AH0",
  "ʌ": "AH",
  "ɔ": "AO",
  "aʊ": "AW",
  "aɪ": "AY",
  "ɛ": "EH",
  "ɝ": "ER",
  "ɚ": "ER",
  "eɪ": "EY",
  "ɪ": "IH",
  "i": "IY",
  "oʊ": "OW",
  "ɔɪ": "OY",
  "ʊ": "UH",
  "u": "UW",

  "b": "B",
  "ʧ": "CH",
  "d": "D",
  "ð": "DH",
  "f": "F",
  "g": "G",
  "h": "HH",
  "ʤ": "JH",
  "k": "K",
  "l": "L",
  "m": "M",
  "n": "N",
  "ŋ": "NG",
  "p": "P",
  "r": "R",
  "s": "S",
  "ʃ": "SH",
  "t": "T",
  "θ": "TH",
  "v": "V",
  "w": "W",
  "j": "Y",
  "z": "Z",
  "ʒ": "ZH",
};

// map cmu base chars back to IPA
// note that we will also have to parse out the stress annotations
// note that cmudict does not unambiguously distinguish ɝ from ɚ
const cmuToIpaBase = Object.fromEntries(
  Object.entries(ipaToCmu)     // convert to nested list of entries
  .map((tup)=>[tup[1],tup[0]]) // reverse order
);

// convert a cmu phoneme back to IPA by either looking in the map or stripping 
// the stress first (some stressed Arpabet phonemes are in the map)
function cmuToIpa(cmuPh) {
  return cmuToIpaBase[cmuPh] ?? cmuToIpaBase[cmuPh.replace(/[0-9]/, '')];
}

function ipaToCmuPattern(ph) {
  // given an IPA phoneme, map it to the equivalent CMU dict specification
  return ipaToCmu[ph] + (phonemes.consonants.includes(ph)? '' : `[012]?`);
}

let myApp = makeWordleSearchApp(
  // ng-app name
  'wordleSearchApp',
  // ng-controller name
  'WordleSearchCtrl', 
  // word data source
  './cmu_by_len.json',

  // valid "characters" (phonemes)
  Object.keys(ipaToCmu),
  // word search function, return list of results to display
  function wordSearch() {
    // required yellow IPA; use lookahead
    let requiredChars = Array.from(new Set(flatten(this.yellows)));
    var regStr = requiredChars.map((ph) => `(?=${ipaDelim}${ipaToCmuPattern(ph)}${ipaDelim})`).join('');
    // build the rest of the regex
    let negations = this.yellows.map(
      (yellowRow) => yellowRow.concat(this.greys).map((ph) => ipaToCmuPattern(ph)));
    let rePieces = [];
    for (var i=0; i<this.wordLen; i++) {
      // if a green char exists, just set it at this position and skip the rest
      if (this.isValidChar(this.greens[i])) {
        rePieces[i] = ipaToCmuPattern(this.greens[i]);
      // otherwise, use the negations
      } else if (negations) {
        rePieces[i] = `[\\w^${negations[i].join('')}]+`;
      // otherwise, wildcard
      } else {
        rePieces[i] = '\w';
      }
    }
    regStr += ipaDelim + rePieces.join(' ') + ipaDelim;
    const re = new RegExp(regStr, 'g');
    console.log("regex:", re);
    return (
      // get regex matches
      (this.wordsByLen[this.wordLen].match(re) ?? [])
      .map((s) => {
        // remove word delimiters
        let cmuStr = s.replace(new RegExp(ipaDelim, 'g'), '')
        // map each cmu phoneme back to ipa
        let ipaStr = cmuStr.split(' ').map((ph) => cmuToIpa(ph)).join('');
        console.log(cmuStr, ipaStr);
        return `/${ipaStr}/ - ` + (this.cmuToSpelling[cmuStr] ?? []).join(', ');
      })
    );
  },
  { // other scope addons
    // constants
    phonemes: phonemes,
    // TESTING ONLY
    greens: ['p', '', 'n', 'd', ''],

    // initial state
    currCell: {},

    // check if phoneme is valid to put in box
    isValidChar: function(ph) {
      return (ph && this.charSet.includes(ph));
    },

    // process json data
    processData: function(data) {
      this.wordsByLen = data.cmu_by_len;
      this.cmuToSpelling = data.cmu_to_spelling;
    },

    // set output of ipa keyboard on the scope
    ipaKeypress: function(ph) {
      this.ipaInput = ph;
      console.debug("got phoneme:", this.ipaInput);
      // Tell the currently highlighted cell about the input
      switch(this.currCell.color) {
        case "green":
          this.setGreen(this.currCell.index, ph);
          break;
        case "grey":
          this.setGrey(this.currCell.index, ph);
          break;
        case "yellow":
          this.setYellow(this.currCell.index, this.currCell.subIndex, ph);
          break;
      }
      // Clear highlighted cell
      this.currCell = {};
    },

    // prompt for a green input
    promptGreen: function(index) {
      // note which cell is currently being highlighted
      this.setCellTakingInput('green', index, undefined);
    },

    // prompt for a grey input
    promptGrey: function(index) {
      // note which cell is currently being highlighted
      this.setCellTakingInput('grey', index, undefined);
    },
    // set a grey input
    setGrey: function(index, ph) {
      if (this.isValidChar(ph)) {
        this.greys[index] = ph;
        console.debug(`set ${ph} at grey index=${index}`);
      } else {
        // remove if invalid/empty
        this.greys.splice(index, 1);
      }
      this.checkInputs();
    },

    // prompt for a yellow input
    promptYellow: function(index, subIndex) {
      console.debug(`prompt yellow (${index},${subIndex})`);
      // note which cell is currently being highlighted
      this.setCellTakingInput('yellow', index, subIndex);
    },
    // set a yellow input
    setYellow: function(index, subIndex, ph) {
      if (this.isValidChar(ph)) {
        this.yellows[index][subIndex] = ph;
        console.debug(`set ${ph} at yellow (${index},${subIndex})`);
      } else {
        // remove if invalid/empty
        this.yellows[index].splice(subIndex, 1);
      }
      this.checkInputs();
    },

    setCellTakingInput: function(color, index, subIndex) {
      // Specifies a unique cell currently accepting keyboard input.
      this.currCell = {
        color: color,
        index: index,
        subIndex: subIndex,
      };
    },
    isTakingInput: function(color, index, subIndex) {
      // Returns true if this cell is currently taking input.
      return (
        color===this.currCell.color &&
        index===this.currCell.index &&
        (subIndex==undefined || subIndex===this.currCell.subIndex)
      );
    },

  },
);

// Directive to render an interactive IPA keyboard
/* Example usage:
 *   <div ipa-keyboard
 *        ng-show="isKeyboardOpen"
 *        on-close="isKeyboardOpen"
 *        phonemes="phonemes"
 *        ipa-keypress="ipaKeypress(ph)"
 *        ></div>
 */
myApp.directive('ipaKeyboard', function() {
  return {
    restrict: 'A',
    replace: true,
    template: function(element, attrs) {
      return `
        <div class="keyboard">
          <button ng-click="onInput('')">clear</button>
          <div class="keyboard-section"
               ng-repeat="(category,sublist) in phonemes"
          >
            <div class="keyboard-header">{{ category }}</div>
            <span class="wordle-cell keyboard-key"
                  ng-repeat="ph in sublist"
                  ng-click="onInput(ph)"
                  >{{ ph }}</span>
          </div>
        </div>
      `;
    },
    scope: {
      ipaKeypress: '&',
      phonemes: '=',
      onClose: '&',
    },
    link: function($scope, element, attrs) {
      $scope.onInput = function(ph) {
        $scope.onClose();
        $scope.ipaKeypress({'ph':ph});
      };
    },
  };
});

