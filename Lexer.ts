import { CompiledTokenGrammar } from "./compileTokenGrammar";
import Token from "./Token";
import TokenStream from "./TokenStream";

function maximumMatch(matches: Record<string, RegExpMatchArray | null>) {
  let t: { matchToken: string; matchLength: number } | undefined;

  for (let matchToken in matches) {
    const match = matches[matchToken];

    if (!match) {
      continue;
    }

    const matchLength = match[0].length;

    if ((t && matchLength > t.matchLength) || (!t && matchLength > 0)) {
      t = { matchToken, matchLength };
    }
  }

  return t;
}

const defaultTokenizeOpts = { trim: true };

class Lexer {
  public constructor(private tokenGrammar: CompiledTokenGrammar) {}

  public tokenize(
    program: string,
    opts: { trim?: boolean } = defaultTokenizeOpts
  ): TokenStream {
    const tokenStream = new TokenStream();

    let programBuffer = program;
    let currentOffset = 0;

    if (opts.trim) {
      programBuffer = programBuffer.replace("\n", "").trim();
    }

    while (programBuffer) {
      const matches: Record<string, RegExpMatchArray | null> = {};

      for (let [tokenName, matcher] of this.tokenGrammar) {
        matches[tokenName] = programBuffer.match(matcher);
      }

      const match = maximumMatch(matches);

      if (!match) {
        throw new Error(
          `unexpected token ${programBuffer[0]} at offset ${currentOffset}`
        );
      }

      tokenStream.pushToken(
        new Token(
          match.matchToken,
          programBuffer.substring(0, match.matchLength),
          currentOffset
        )
      );

      programBuffer = programBuffer.substring(match.matchLength);

      if (opts.trim) {
        programBuffer = programBuffer.replace("\n", "").trim();
      }

      currentOffset += match.matchLength;
    }

    return tokenStream;
  }
}

export default Lexer;
