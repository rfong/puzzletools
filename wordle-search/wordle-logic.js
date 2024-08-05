export function makeWordleSearchApp(
  appName, ctrlName, dataSource, charSet, wordSearch, scopeAddons,
) {
  /* factory function to set up an angular app for wordle search
   * @param {string} appName - the `ng-app` value in HTML template
   * @param {string} ctrlName - the `ng-controller` value in template
   * @param {string} dataSource - path to JSON file mapping word lengths to
   *   lists of words
   * @param {[string]} charSet - list of accepted characters
   * @param {function} wordSearch() - returns a list of words matching the 
   *   current search parameters. Can access $scope as `this`.
   * @param {{string:*}|undefined} otherScopeAddons - arbitrary other params
   *   to be attached to $scope. Any functions can access $scope as `this`.
   * @returns {object} - an angular app
   */
  let myApp = angular.module(appName, []);
  let myCtrl = myApp.controller(
    ctrlName,
    wordleSearchControllerFactory(
      dataSource, wordSearch, charSet, scopeAddons ?? {}),
  );
  return myApp;
}

// decorate a function($scope) controller with additional parameters
function wordleSearchControllerFactory(...params) {
  return ($scope) => {
    return wordleSearchControllerSetup.apply(null, [$scope].concat(params));
  };
}

// core logic for angular controller function with addon parameters
function wordleSearchControllerSetup(
  $scope, dataSource, wordSearch, charSet, otherScopeAddons,
) {
  const DEFAULT_WORD_LEN = 5;
  function setDefaultValues() {
    $scope.wordLen = DEFAULT_WORD_LEN;
    $scope.greys = [];
    $scope.greens = [];
    $scope.yellows = [];
    $scope.yellowInputs = [];
    $scope.onLenChange();
    
    // set app parameters on scope
    $scope.dataSource = dataSource;
    $scope.wordSearch = wordSearch;
    $scope.charSet = charSet;
    for (const key in (otherScopeAddons ?? {})) {
      var o = otherScopeAddons[key];
      if (typeof o == 'function') o = o.bind($scope);
      $scope[key] = o;
    }

    // import helpers used in template
    $scope.getChars = getChars;
  }

  // run a word search with current inputs
  $scope.search = function() {
    $scope.hasRunSearch = true;
    $scope.output = $scope.wordSearch();
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

  // set a green character
  $scope.setGreen = function(index, c) {
    $scope.greens[index] = c;
    console.debug(`set ${c} at green index=${index}`);
    $scope.checkInputs();
  }
  
  // when the word length changes
  $scope.onLenChange = function() {
    $scope.greens = cropOrExtendArray($scope.greens, $scope.wordLen, '');
    $scope.yellows = cropOrExtendArray($scope.yellows, $scope.wordLen, []);
    $scope.yellowInputs = cropOrExtendArray($scope.yellowInputs, $scope.wordLen, '');
  };

  // clear all
  $scope.clearData = function() {
    $scope.greens = [];
    $scope.yellows = [];
    $scope.yellowInputs = [];
    $scope.greys = [];
    $scope.onLenChange();
  };

  // check if ok to submit, if not issue warnings
  $scope.checkInputs = function() {
    let warnings = []
    let greySet = new Set($scope.greys);
    let greenSet = new Set($scope.greens);
    let yellowSet = new Set(flatten($scope.yellows));
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

  $scope.processData = function(data) {
    $scope.wordsByLen = data;
  };

  // setup
  setDefaultValues();
  fetch($scope.dataSource)
  .then((response) => response.json())
  .then((data) => {
    $scope.$apply(() => {
      $scope.processData(data);

      // weird hack to make select's default value work
      $scope.wordLens = Object.keys($scope.wordsByLen);
      $scope.wordLen = $scope.wordLens[DEFAULT_WORD_LEN - 1];
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
export function flatten(nestedList) {
  return [].concat.apply([], nestedList)
}
