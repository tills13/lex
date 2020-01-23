import util from "util";

import { CompiledGrammar, Rule } from "./compileGramar";
import Token from "./Token";
import Stack from "./Stack";
import TokenStream from "./TokenStream";

interface Node {
  name: string;
  parent?: Node;
  children?: Array<Token | Node>;
}

type ParserStack = Stack<Token | Node>;

const REGEXP_SPECIAL_CHARS = "$?|*.[]+()/".split("");
const REGEXP_SPECIAL_CHARS_REGEXP = new RegExp(
  `${REGEXP_SPECIAL_CHARS.map(c => "\\" + c).join("|")}`,
  "g"
);

class Parser {
  private stack: ParserStack = new Stack();
  private lookahead: number = 1;

  constructor(private grammar: Rule[]) {
    console.log(util.inspect(this.grammar, { colors: true, depth: 10 }));
  }

  compileToRegexString(rule: Rule): string {
    if (rule.__type === "complex") {
      throw new Error("cannot generate RegEx for complex rule");
    }

    switch (rule!.__type) {
      case "literal":
        return rule.value.replace(
          REGEXP_SPECIAL_CHARS_REGEXP,
          char => "\\" + char
        );
      // const regex =
      case "or":
        let ruleRegexes = [];

        for (let subRule of rule.rules) {
          ruleRegexes.push(this.compileToRegexString(subRule));
        }

        return `(${ruleRegexes.join("|")})`;
      case "ref":
        return this.compileToRegexString(
          this.grammar.find(r => r.name === rule.target)!
        );
    }
  }

  match(rule: Rule, stack: ParserStack): boolean {
    if (rule.__type === "complex") {
      if (rule.rules.length > stack.size()) {
        return false;
      }

      const tempStack = stack.clone();

      for (let ruleIdx = rule.rules.length - 1; ruleIdx >= 0; ruleIdx--) {
        if (!this.match(rule.rules[ruleIdx], tempStack)) {
          continue;
        }

        tempStack.pop();
      }

      return true;
    }

    const ruleRegexStr = this.compileToRegexString(rule);
    const ruleRegex = new RegExp(`^${ruleRegexStr}$`);

    if (rule.__type === "ref") {
      const t = stack.peek();
      if (t instanceof Token) {
        if (ruleRegex.test((stack.peek() as Token)!.value)) {
          return true;
        }
      } else {
        if (t.name === rule.name) {
          return true;
        }
      }
    }

    if (ruleRegex.test((stack.peek() as Token)!.value)) {
      return true;
    }

    return false;
  }

  public parse(tokenStream: TokenStream) {
    let currenToken = tokenStream.currentToken();

    while (currenToken) {
      this.stack.push(currenToken);
      this.reduce();

      console.log(util.inspect(this.stack, { colors: true }));

      currenToken = tokenStream.nextToken();
    }

    this.reduce();
  }

  public reduce() {
    outer: while (true) {
      for (let rule of this.grammar) {
        if (this.match(rule, this.stack)) {
          const children = [];
          if (rule.__type === "complex") {
            for (let i = 0; i < rule.rules.length; i++) {
              children.push(this.stack.pop());
            }
          } else {
            children.push(this.stack.pop());
          }

          this.stack.push({ name: rule.name, children } as Node);
          break outer;
        }
      }

      return;
    }
  }
}

export default Parser;
