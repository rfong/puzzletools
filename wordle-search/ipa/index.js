import { getEl } from '../../helpers.js';
import { makeWordleSearchApp, flatten } from '../wordle-logic.js';

const phonemes = {
  monophthongs: 'ɑæəʌɔɛɝɚɪiʊu'.split(''),
  dipthongs: ['aʊ', 'aɪ', 'eɪ', 'oʊ', 'ɔɪ'],
  consonants: 'bdðʤfghklmnŋprsʃtʧθvwjzʒ'.split(''),
};
const allPhonemes = phonemes.monophthongs.concat(phonemes.dipthongs, phonemes.consonants);

let myApp = makeWordleSearchApp(
  'wordleSearchApp',
  'WordleSearchCtrl', 
  '../wordnik_by_len.json',
  // monophthongs
  'ɑæəʌɔɛɝɚɪiʊubdðʤfghklmnŋprsʃtʧθvwjzʒ'.split('')
  // dipthongs
    .concat(['aʊ', 'aɪ', 'eɪ', 'oʊ', 'ɔɪ']),
  function wordSearch() {
    // get all negations for each position
    let negations = this.yellows.map(
      (yellowRow) => yellowRow.concat(this.greys));
    // additional required characters; use lookahead
    let requiredChars = Array.from(new Set(flatten(this.yellows)));
    var regStr = requiredChars.map((c) => `(?=\\w*${c}\\w*)`).join('');
    // build the rest of the regex
    for (var i=0; i<this.wordLen; i++) {
      // if a green char exists, just set it at this position and skip the rest
      if (this.isValidChar(this.greens[i])) {
        regStr += this.greens[i];
        continue;
      }
      // otherwise, use the negations
      regStr += `[^${negations[i].join('')}]`;
    }
    regStr = ` ${regStr} `;
    const re = new RegExp(regStr, 'g');
    return (
      (this.wordsByLen[this.wordLen].match(re) ?? [])
      .map((s) => s.replace(/,/g, ''))
    );
  },
  { // other scope addons
    // constants
    phonemes: phonemes,
    allPhonemes: allPhonemes,

    // state
    keyboardOpenStates: {},
    currCell: {},

    // set output of ipa keyboard on the scope
    ipaKeypress: function(ph) {
      console.log("executing fn from parent scope");
      this.ipaInput = ph;
      console.log("got phoneme:", this.ipaInput);
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

    // prompt for a green character
    promptGreen: function(index) {
      // note which cell is currently being highlighted
      this.setCellTakingInput('green', index, undefined);
    },

    // prompt for a grey character
    promptGrey: function(index) {
      // note which cell is currently being highlighted
      this.setCellTakingInput('grey', index, undefined);
    },
    // set a grey character
    setGrey: function(index, c) {
      if (this.isValidChar(c)) {
        this.greys[index] = c;
        console.debug(`set ${c} at grey index=${index}`);
      } else {
        // remove if invalid/empty
        this.greys.splice(index, 1);
      }
      this.checkInputs();
    },

    // prompt for a yellow character
    promptYellow: function(index, subIndex) {
      // note which cell is currently being highlighted
      this.setCellTakingInput('yellow', index, subIndex);
    },
    // set a yellow character
    setYellow: function(index, subIndex, c) {
      this.yellows[index][subIndex] = c;
      console.debug(`set ${c} at yellow (${index},${subIndex})`);
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
        (!subIndex || subIndex===this.currCell.subIndex)
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

