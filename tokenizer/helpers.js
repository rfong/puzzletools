/* Helpers, separated for testing */

// get final output string for display
export function getOutput(tokens, delimiter, tokMap, useMap) {
  return (
    useMap ? tokens.map((tok) => tokMap[tok]) : tokens
  ).join(delimiter);
}

// received new tokens. update the map, but preserve any values mapped to 
// tokens that are still in the current set.
export function getUpdatedMap(tokMap, newTokens) {
  let newMap = {};
  for (const tok of newTokens) {
    // if token was in old map, copy over old value
    if (tok in tokMap) {
      newMap[tok] = tokMap[tok];
    // if new token, map to itself
    } else {
      newMap[tok] = tok;
    }
  }
  return newMap;
}

// returns true if any whitespace characters found in any tokens
export function isWhitespaceInTokens(tokens) {
  return tokens.some((s) => /\s/.test(s));
}
