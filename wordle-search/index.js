import { getEl } from "../helpers.js";

let myApp = angular.module('wordleSearchApp', []);
myApp.controller('WordleSearchCtrl', function($scope) {
  function setDefaultValues() {
    $scope.wordLen = 5;
    $scope.greys = [];
    $scope.greens = [];
    $scope.yellows = [];
    $scope.yellowInputs = [];
    $scope.onLenChange();

    // import helpers used in template
    $scope.getChars = getChars;
    $scope.isValidChar = isValidChar;
  }

  // when the 'search' button is clicked
  $scope.search = function() {
    $scope.output = ["foo", "bar"];
    // get all negations for each position
    let negations = $scope.yellows.map(
      (yellowRow) => yellowRow.concat($scope.greys));
    // build the regex
    var regStr = "";
    for (var i=0; i<$scope.wordLen; i++) {
      // if a green char exists, just set it at this position and skip the rest
      if (isValidChar($scope.greens[i])) {
        regStr += $scope.greens[i];
        continue;
      }
      // otherwise, use the negations
      regStr += `[^${negations[i].join('')}]`;
    }
    regStr = `,${regStr},`;
    const re = new RegExp(regStr, 'g');
    $scope.output = (
      $scope.wordsByLen[$scope.wordLen].match(re)
      .map((s) => s.replace(/,/g, ''))
    );
    console.debug(regStr, $scope.output);
  };

  // when the grey raw input changes
  $scope.onGreyChange = function() {
    $scope.greys = getChars($scope.disallowed);
    $scope.checkInputs();
  };

  // when a yellow row's input changes
  $scope.onYellowChange = function(posn) {
    $scope.yellows[posn] = getChars($scope.yellowInputs[posn]);
    $scope.checkInputs();
  };

  // when the word length changes
  $scope.onLenChange = function() {
    $scope.greens = cropOrExtendArray($scope.greens, $scope.wordLen, '');
    $scope.yellows = cropOrExtendArray($scope.yellows, $scope.wordLen, []);
    $scope.yellowInputs = cropOrExtendArray($scope.yellowInputs, $scope.wordLen, '');
  };

  // set a green character, 0-indexed
  $scope.setGreen = function(posn) {
    let c = window.prompt("set a character").trim() ?? '',
        el = Array.from(getEl("green-cells").children)[posn];
    $scope.greens[posn] = c;
    console.debug(`set ${c} at posn ${posn}`);
    $scope.checkInputs();
  }

  // check if ok to submit, if not issue warnings
  $scope.checkInputs = function() {
    let warnings = []
    let greySet = new Set($scope.greys);
    let greenSet = new Set($scope.greens);
    let yellowSet = new Set(flatten($scope.yellows));
    console.debug(greySet, greenSet, yellowSet);
    if (greySet.intersection(greenSet).size > 0) {
      warnings.push("grey letters should not overlap with green letters");
    }
    if (greySet.intersection(yellowSet).size > 0) {
      warnings.push("grey letters should not overlap with yellow letters");
    }
    for (var i=0; i<$scope.wordLen; i++) {
      if ($scope.yellows[i].includes($scope.greens[i])) {
        warnings.push("a letter should not be in the same green and yellow position");
        continue;
      }
    }
    $scope.warnings = warnings;
  }

  // setup
  setDefaultValues();
  fetch("./wordnik_by_len.json")
  .then((response) => response.json())
  .then((words) => {
    $scope.$apply(() => {
      $scope.wordsByLen = words;

      // weird hack to make select's default value work
      $scope.wordLens = Object.keys($scope.wordsByLen);
      $scope.wordLen = $scope.wordLens[4]; // set default val to 5
    });
  });
});

// given a string of comma-delimited characters, split and normalize them
function getChars(s) {
  return (
    s.split(",")
    .map((x) => x.trim().toLowerCase()[0]) // only one char allowed
    .filter((x) => x)
  );
}

// crop or extend an array to match a new length, filling empty vals if needed
function cropOrExtendArray(arr, newLen, defaultVal) {
  // If the new length is shorter, crop the old array.
  if (arr.length >= newLen) {
    return arr.slice(0, newLen);
  }
  // Otherwise, extend and pad with default values.
  return arr.concat(Array(newLen-arr.length).fill(defaultVal));
}

// check if char is valid to put in box
const alphabet = 'abcdefghijklmnopqrstuvwxyz';
function isValidChar (c) {
  return (c && c.length == 1 && alphabet.includes(c));
}

// shallow flatten an array of arrays.
function flatten(nestedList) {
  return [].concat.apply([], nestedList)
}
