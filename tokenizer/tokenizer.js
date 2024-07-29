// this error is thrown when text is unparseable with the given set of tokens
export class InvalidTokenError extends Error {
  constructor(message, searchText, tokenBank) {
    super(message);
    this.name = "InvalidTokenError";
    this.searchText = searchText;
    this.tokenBank = tokenBank;
  }
}

// multi-char string tokenizer
export class Tokenizer {
  constructor(tokens) {
    this.tokens = tokens; // maintain the original order
    this.maxLen = 0;
    for (const tok of tokens) {
      this.maxLen = Math.max(this.maxLen, tok.length);
    }
  }

  // Search for the next possible token in descending length order,
  // or throw an InvalidTokenError if not possible
  findNextToken(text, startPos) {
    let tokLen = this.maxLen;
    let token;
    while (tokLen > 0) {
      token = text.slice(startPos, startPos+tokLen);
      if (this.tokens.includes(token)) {
        return token;
      }
      tokLen -= 1;
    }
    throw new InvalidTokenError(
      `No valid token in "${token}", check your settings`,
      text.slice(startPos, startPos+this.maxLen),
      this.tokens,
    );
  }

  // Return list of tokens in this text
  tokenize(text) {
    let tokens = [];
    let pos = 0;
    while (pos < text.length) {
      try {
        tokens.push(this.findNextToken(text, pos));
      } catch (err) {
        if (err instanceof InvalidTokenError) {
          throw err;
        }
      }
      pos += tokens[tokens.length-1].length;
    }
    return tokens;
  }

}
/*
if(Array.prototype.equals) {
  console.warn("Overriding existing Array.prototype.equals.);
}
Array.prototype.equals = function (array) {
  // Sanity checks
  if (!array) return false;
  if (array === this) return true;
  if (this.length != array.length) return false;
  // Compare all values
  for (var i=0; i<this.length. i++) {
    // if both elements are arrays, recurse
    if (this[i] instanceof Array && array[i] instanceof Array
        && !this[i].equals(array[i])
    ) return false;
    // direct comparison for primitives. this won't work for objects
    if (this[i] != array[i]) return false;
  }
  return true;
}
*/
