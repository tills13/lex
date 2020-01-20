import util from "util";

import { CompiledGrammar, Rule } from "./compileGramar";
import Token from "./Token";
import TokenStream from "./TokenStream";

type Stack = Array<Rule | Token>;

function applyRule(stack: Stack, rule: Rule): void {
  switch (rule.__type) {
    case "complex":
      for (let x in rule.rules) {
      }

      break;
    case "literal":
      const lastStackValue = stack[stack.length - 1];

      if (
        lastStackValue instanceof Token &&
        lastStackValue.value === rule.value
      ) {
        stack.pop();
        stack.push(rule);
      }
    case "ref":
      break;
    case "or":
      for (let x of rule.rules) {
        applyRule(stack, x);
      }
  }
}

class Parser {
  private stack: Stack = [];
  private lookahead: number = 1;

  constructor(private grammar: CompiledGrammar) {}

  public reduce() {
    const startCursor = this.stack.length - 1;

    for (let ruleName in this.grammar) {
      const rule = this.grammar[ruleName];
      applyRule(this.stack, rule);
    }
  }

  public parse(tokenStream: TokenStream) {
    let currenToken = tokenStream.currentToken();

    while (currenToken) {
      if (currenToken.is("WS") || currenToken.is("NEWLINE")) {
        currenToken = tokenStream.nextToken();
        continue;
      }

      console.log(util.inspect(this.stack, { colors: true }));

      this.stack.push(currenToken);
      this.reduce();

      console.log(util.inspect(this.stack, { colors: true }));
      console.log();

      currenToken = tokenStream.nextToken();
    }

    this.reduce();
  }
}

export default Parser;
