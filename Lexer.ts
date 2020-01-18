import { CompiledTokenGrammar } from "./compileTokenGrammar";
import Token from "./Token";
import TokenStream from "./TokenStream";

class Lexer {
  public constructor(private tokenGrammar: CompiledTokenGrammar) {}

  public tokenize(program: string): TokenStream {
    const tokenStream = new TokenStream();
    const rules = Object.keys(this.tokenGrammar);
    let index = 0;

    let prevRulesMatched: Token[] = [];
    let buffer = [];

    while (index < program.length) {
      buffer.push(program.charAt(index));
      const part = buffer.join("");

      let currRulesMatched: Token[] = [];

      for (let rule of rules) {
        const rRule = this.tokenGrammar[rule];

        if (rRule.test(part)) {
          currRulesMatched.push(new Token(rule, part, index - part.length + 1));
        }
      }

      // console.log(currRulesMatched, prevRulesMatched);

      // maximally match i.e. expand the selection until the # of matches goes
      // down. ideally, the most specific rule would then be the match
      if (currRulesMatched.length < prevRulesMatched.length) {
        tokenStream.pushToken(prevRulesMatched.shift()!);

        buffer = [];
        prevRulesMatched = [];
      } else {
        prevRulesMatched = [...currRulesMatched];
        index++;
      }
    }

    if (prevRulesMatched) {
      tokenStream.pushToken(prevRulesMatched.shift()!);
    }

    return tokenStream;
  }
}

export default Lexer;
