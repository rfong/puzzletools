// this error is thrown when text is unparseable with the given set of tokens
export class ParseError extends Error {
  constructor(message, searchText, tokenBank) {
    super(message);
    this.name = "ParseError";
    this.searchText = searchText;
    this.tokenBank = tokenBank;
  }
}

// this error is thrown when text is unparseable with the given set of tokens
export class InvalidTokenBankError extends Error {
  constructor(message, searchText, tokenBank) {
    super(message);
    this.name = "InvalidTokenBankError";
    this.tokenBank = tokenBank;
  }
}

export function isTokenBankValid(tokens) {
  if (new Set(tokens).size != tokens.length) 
    throw new InvalidTokenBankError("cannot have duplicate tokens");
  if (tokens.some((tok) => tok.length == 0))
    throw new InvalidTokenBankError("cannot have zero-length token");
  return true;
}

export class Tokenizer {
  constructor(tokens) {
    this.tokens = tokens; // maintain the original order of the token bank
    this.maxLen = 0;
    for (const tok of tokens) {
      this.maxLen = Math.max(this.maxLen, tok.length);
    }
  }

  // Search for the next possible token in descending length order,
  // or throw an ParseError if not possible
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
    throw new ParseError(
      `No valid token in "${token}", check your settings`,
      text.slice(startPos, startPos+this.maxLen),
      this.tokens,
    );
  }

  // Return list of tokens in this text
  tokenize(text) {
    let toks = [];
    let pos = 0;
    while (pos < text.length) {
      try {
        toks.push(this.findNextToken(text, pos));
      } catch (err) {
        if (err instanceof ParseError) {
          throw err;
        }
      }
      pos += toks[toks.length-1].length;
    }
    return toks;
  }

}
