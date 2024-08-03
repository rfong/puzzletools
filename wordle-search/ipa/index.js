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

    // prompt for a green character and set it
    getAndSetGreen: function(posn) {
      this.keyboardOpenStates.green = true;
      this.setCellTakingInput('green', posn, undefined);
      console.log(this.cellTakingInput);
      //this.setGreen(posn, window.prompt("set a character").trim() ?? '');
    },
    phonemes: phonemes,
    allPhonemes: allPhonemes,

    keyboardOpenStates: {},
    cellTakingInput: {},

    setCellTakingInput: function(color, index, subIndex) {
      console.log("scope from addon fn:", this);
      // Specifies a unique cell currently accepting keyboard input.
      this.cellTakingInput = {
        color: color,
        index: index,
        subIndex: subIndex,
      };
    },
    isTakingInput: function(color, index, subIndex) {
      // Returns true if this cell is currently taking input.
      console.log(this.cellTakingInput);
      return (
        color===this.cellTakingInput.color &&
        index===this.cellTakingInput.index &&
        (!subIndex || subIndex===this.cellTakingInput.subIndex)
      );
    },

    ipaKeypress: function(ph) {
      // Set output of ipa keyboard on the scope.
      console.log("executing fn from parent scope");
      this.ipaInput = ph;
      console.log("got phoneme:", this.ipaInput);
      // Clear highlighted cell
      this.cellTakingInput = {};
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

