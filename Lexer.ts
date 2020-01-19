import { CompiledTokenGrammar } from "./compileTokenGrammar";
import Token from "./Token";
import TokenStream from "./TokenStream";

function maximumMatch(matches: Record<string, number>) {
  let t: { matchToken: string; matchLength: number } | undefined;

  for (let matchToken in matches) {
    const matchLength = matches[matchToken];

    if ((t && matchLength > t.matchLength) || matchLength > 0) {
      t = { matchToken, matchLength: matchLength };
    }
  }

  return t;
}

const ESCAPE_CHARACTERS = [" ", ";"];

class Lexer {
  public constructor(private tokenGrammar: CompiledTokenGrammar) {}

  public tokenize(program: string): TokenStream {
    const tokenStream = new TokenStream();

    let programBuffer = program.split("");
    let startCursor: number = 0;

    while (startCursor < programBuffer.length) {
      const matches: Record<string, number> = {};

      let endCursor = startCursor;

      // iterate through all substrings of `program` from
      // startCursor to endCursor generating a map of tokens to
      // the maximum length match
      while (endCursor < programBuffer.length) {
        const part = programBuffer.slice(startCursor, endCursor + 1).join("");

        for (let tokenName in this.tokenGrammar) {
          const match = this.tokenGrammar[tokenName];

          if (match.test(part)) {
            matches[tokenName] =
              (matches[tokenName] ?? endCursor - startCursor) + 1;
          }
        }

        if (ESCAPE_CHARACTERS.includes(part)) {
          break;
        }

        endCursor++;
      }

      const matchedToken = maximumMatch(matches);

      if (!matchedToken) {
        throw new Error(
          `unexpected token ${programBuffer[startCursor]} at offset ${startCursor}`
        );
      }

      tokenStream.pushToken(
        new Token(
          matchedToken.matchToken,
          programBuffer
            .slice(startCursor, startCursor + matchedToken.matchLength)
            .join(""),
          startCursor
        )
      );

      startCursor = startCursor + matchedToken.matchLength;
    }

    return tokenStream;
  }
}

export default Lexer;
