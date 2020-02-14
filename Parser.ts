import util from "util";

import { RefRule, Rule, canCompileRule } from "./compileGrammar";
import Token from "./Token";
import Stack from "./Stack";
import TokenStream from "./TokenStream";

interface Node {
  name: string;
  children: Array<Token | Node>;
}

type ParserStack = Stack<Token | Node>;

const REGEXP_SPECIAL_CHARS = "$?|*.[]+()/".split("");
const REGEXP_SPECIAL_CHARS_REGEXP = new RegExp(
  `${REGEXP_SPECIAL_CHARS.map(c => "\\" + c).join("|")}`,
  "g"
);

function printStack(stack: ParserStack) {
  console.log(
    stack.stack.map(t => (t instanceof Token ? t.value : t.name)).join(" ")
  );
}

class Parser {
  private stack: ParserStack = new Stack();
  private lookahead: number = 1;

  constructor(private grammar: Rule[]) {
    // console.log(grammar);
    // console.log(util.inspect(this.grammar, { colors: true, depth: 10 }));
  }

  public compileToRegexString(rule: Rule, parent?: Rule): string {
    switch (rule!.__type) {
      case "complex": {
        let ruleRegexes = [];

        for (let subRule of rule.rules) {
          ruleRegexes.push(this.compileToRegexString(subRule));
        }

        return "^" + ruleRegexes.join("") + "$";
      }

      case "literal": {
        return rule.value.replace(
          REGEXP_SPECIAL_CHARS_REGEXP,
          char => "\\" + char
        );
      }

      case "or": {
        let ruleRegexes = [];

        for (let subRule of rule.rules) {
          ruleRegexes.push(this.compileToRegexString(subRule));
        }

        return `(?:${ruleRegexes.join("|")})`;
      }

      case "ref": {
        const target = this.grammar.find(r => r.name === rule.target)!;
        let targetRegexStr = this.compileToRegexString(target);

        // optional - ?
        // repeats - +
        // optional + repeats - *

        if (rule.optional && rule.repeats) {
          targetRegexStr = `(?:${targetRegexStr})*`;
        } else if (rule.optional) {
          targetRegexStr = `(?:${targetRegexStr})?`;
        } else if (rule.repeats) {
          targetRegexStr = `(?:${targetRegexStr})+`;
        }

        return targetRegexStr;
      }
    }
  }

  public match(rule: Rule, stack: ParserStack): boolean {
    if (rule.__type === "complex") {
      if (!canCompileRule(this.grammar, rule)) {
        if (rule.rules.length > stack.size()) {
          return false;
        }

        const tempStack = stack.clone();

        for (let ruleIdx = rule.rules.length - 1; ruleIdx >= 0; ruleIdx--) {
          if (!this.match(rule.rules[ruleIdx], tempStack)) {
            return false;
          }

          tempStack.pop();
        }

        return true;
      }
    }

    const t = stack.peek()!;

    if (!(t instanceof Token)) {
      if (rule.__type === "ref") {
        return rule.target === t.name;
      }

      if (rule.__type === "literal") {
        const target = t.children[0];

        if (target instanceof Token) {
          return rule.value === target.value;
        }

        return false;
      }

      if (rule.__type === "or") {
        for (let r of rule.rules) {
          if (this.match(r, this.stack)) {
            return true;
          }
        }

        return false;
      }

      return false;
    }

    if (!canCompileRule(this.grammar, rule)) {
      return false;
    }

    const ruleRegexStr = this.compileToRegexString(rule);
    const ruleRegex = new RegExp(`^${ruleRegexStr}$`);

    if (ruleRegex.test(t.value)) {
      return true;
    }

    return false;
  }

  public parse(tokenStream: TokenStream) {
    let currenToken = tokenStream.currentToken();

    while (currenToken) {
      this.stack.push(currenToken);

      console.log(util.inspect(this.stack, { colors: true }));

      this.reduce();

      currenToken = tokenStream.nextToken();
    }

    this.reduce();

    return this.stack;
  }

  public reduce() {
    printStack(this.stack);

    outer: while (true) {
      for (let rule of this.grammar) {
        // terminal symbols are not applied in the grammar
        if (rule.name[0].toUpperCase() === rule.name[0]) {
          continue;
        }

        if (this.match(rule, this.stack)) {
          console.log("reducing with", rule.name);
          const children = [];

          if (
            rule.__type === "complex" &&
            !canCompileRule(this.grammar, rule)
          ) {
            for (let i = 0; i < rule.rules.length; i++) {
              children.push(this.stack.pop());
            }
          } else {
            children.push(this.stack.pop());
          }

          this.stack.push({
            name: rule.name,
            children: children.reverse()
          } as Node);

          this.reduce();
        }
      }

      return;
    }
  }
}

export default Parser;
