import { getEl } from "../helpers.js";

export function makeWordleSearchApp(
  appName, ctrlName, dataSource, charSet, makeSearchRegex,
) {
  /* factory function to set up an angular app for wordle search
   * @param {string} appName - the `ng-app` value in HTML template
   * @param {string} ctrlName - the `ng-controller` value in template
   * @param {string} dataSource - path to JSON file mapping word lengths to
   *   lists of words
   * @param {[string]} charSet - list of accepted characters
   * @param {function} makeSearchRegex($scope) - takes a WordleSearchApp's 
   *   $scope and returns a RegExp instance matching the search parameters
   * @returns {object} - an angular app
   */
  let myApp = angular.module(appName, []);
  let myCtrl = myApp.controller(
    ctrlName,
    wordleSearchControllerFactory(dataSource, makeSearchRegex, charSet),
  );
  return myApp;
}

makeWordleSearchApp(
  'wordleSearchApp',
  'WordleSearchCtrl', 
  './wordnik_by_len.json',
  'abcdefghijklmnopqrstuvwxyz'.split(''),
  // make search regex
  function($scope) {
    // get all negations for each position
    let negations = $scope.yellows.map(
      (yellowRow) => yellowRow.concat($scope.greys));
    // build the regex
    var regStr = "";
    for (var i=0; i<$scope.wordLen; i++) {
      // if a green char exists, just set it at this position and skip the rest
      if ($scope.isValidChar($scope.greens[i])) {
        regStr += $scope.greens[i];
        continue;
      }
      // otherwise, use the negations
      regStr += `[^${negations[i].join('')}]`;
    }
    regStr = `,${regStr},`;
    return new RegExp(regStr, 'g');
  },
);

// decorate a function($scope) controller with other parameters
function wordleSearchControllerFactory(...params) {
  return ($scope) => {
    return wordleSearchControllerSetup.apply(null, [$scope].concat(params));
  };
}

// angular controller function with additional parameters
function wordleSearchControllerSetup(
  $scope, dataSource, makeSearchRegex, charSet,
) {
  function setDefaultValues() {
    $scope.wordLen = 5;
    $scope.greys = [];
    $scope.greens = [];
    $scope.yellows = [];
    $scope.yellowInputs = [];
    $scope.onLenChange();
    
    // set app parameters on scope
    $scope.dataSource = dataSource;
    $scope.makeSearchRegex = makeSearchRegex;
    $scope.charSet = charSet;

    // import helpers used in template
    $scope.getChars = getChars;
  }

  // when the 'search' button is clicked
  $scope.search = function() {
    const re = $scope.makeSearchRegex($scope);
    $scope.output = (
      $scope.wordsByLen[$scope.wordLen].match(re)
      .map((s) => s.replace(/,/g, ''))
    );
    console.debug(re, $scope.output);
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

  // check if char is valid to put in box
  $scope.isValidChar = function(c) {
    return (c && c.length == 1 && $scope.charSet.includes(c));
  }

  // setup
  setDefaultValues();
  fetch($scope.dataSource)
  .then((response) => response.json())
  .then((words) => {
    $scope.$apply(() => {
      $scope.wordsByLen = words;

      // weird hack to make select's default value work
      $scope.wordLens = Object.keys($scope.wordsByLen);
      $scope.wordLen = $scope.wordLens[4]; // set default val to 5
    });
  });
}

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

// shallow flatten an array of arrays.
function flatten(nestedList) {
  return [].concat.apply([], nestedList)
}
