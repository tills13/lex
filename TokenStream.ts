import Token from "./Token";

class TokenStream {
  private cursor = 0;

  constructor(public tokens: Token[] = []) {}

  currentToken(moveCursor: boolean = false): Token {
    const token = this.tokens[this.cursor];

    if (moveCursor) {
      this.cursor++;
    }

    return token;
  }

  *filter(predicate: string | ((token: Token) => boolean)): Iterable<Token> {
    if (typeof predicate === "string") {
      yield* this.filter(t => t.is(predicate));
      return;
    }

    for (let token of this.tokens) {
      if (predicate(token)) {
        yield token;
      }
    }
  }

  hasNext(): boolean {
    return !!this.peekToken();
  }

  isCurrent(predicate: string | ((token: Token) => boolean)): boolean {
    return this.currentToken().is(predicate);
  }

  joinAll(separator: string = ""): string {
    return this.tokens.map(t => t.value).join(separator);
  }

  joinUntil(predicate: string | ((token: Token) => boolean)): string {
    return [...this.takeUntil(predicate)].map(t => t.value).join("");
  }

  nextUntil(predicate: string | ((token: Token) => boolean)): void {
    if (typeof predicate === "string") {
      this.nextUntil(t => !t.is(predicate));
      return;
    }

    let currentToken = this.currentToken();

    while (predicate(currentToken)) {
      currentToken = this.nextToken();
    }
  }

  nextToken(): Token {
    return this.tokens[++this.cursor];
  }

  peekToken(): Token {
    return this.tokens[this.cursor + 1];
  }

  pushToken(token: Token): void {
    this.tokens.push(token);
  }

  reset() {
    this.cursor = 0;
  }

  *takeUntil(predicate: string | ((token: Token) => boolean)): Iterable<Token> {
    if (typeof predicate === "string") {
      yield* this.takeUntil(t => t.is(predicate));
      return;
    }

    yield* this.takeWhile(t => !predicate(t));
  }

  *takeWhile(predicate: string | ((token: Token) => boolean)): Iterable<Token> {
    if (typeof predicate === "string") {
      yield* this.takeWhile(t => t.is(predicate));
      return;
    }

    let current = this.currentToken();

    while (predicate(current)) {
      yield current;
      current = this.nextToken();
    }
  }
}

export default TokenStream;
