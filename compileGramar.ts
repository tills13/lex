import { RawGrammar } from "./parseTokenGrammar";

interface BaseRule {
  optional?: boolean;
  parent?: Rule;
  repeats?: boolean;
}

interface LiteralRule extends BaseRule {
  __type: "literal";
  value: string;
}

interface RefRule extends BaseRule {
  __type: "ref";
  target: string;
}

interface OrRule extends BaseRule {
  __type: "or";
  rules: Array<Rule>;
}

interface ComplexRule extends BaseRule {
  __type: "complex";
  rules: Array<Rule>;
}

export type Rule = ComplexRule | LiteralRule | OrRule | RefRule;
export type CompiledGrammar = Record<string, Rule>;

function resolveRule(rawRuleFragment: string): Rule {
  let resolvedRule: Rule;

  if (rawRuleFragment.endsWith("+")) {
    resolvedRule = resolveRule(
      rawRuleFragment.substring(0, rawRuleFragment.length - 1)
    );
    resolvedRule.repeats = true;
  } else if (rawRuleFragment.endsWith("?")) {
    resolvedRule = resolveRule(
      rawRuleFragment.substring(0, rawRuleFragment.length - 1)
    );
    resolvedRule.optional = true;
  } else if (rawRuleFragment.startsWith('"')) {
    resolvedRule = {
      __type: "literal",
      value: rawRuleFragment.substring(1, rawRuleFragment.length - 1)
    };
  } else if (rawRuleFragment.startsWith("(")) {
    resolvedRule = resolveRule(
      rawRuleFragment.substring(1, rawRuleFragment.length - 1)
    );
  } else {
    resolvedRule = { __type: "ref", target: rawRuleFragment };
  }

  return resolvedRule;
}

function parseRule(rawRulePart: string, parent?: Rule): Rule {
  const parts = rawRulePart.split(" ");
  const ruleParts: Array<Rule> = [];

  for (let part of parts) {
    const rule = resolveRule(part);
    rule.parent = parent;
    ruleParts.push(rule);
  }

  if (ruleParts.length === 1) {
    return ruleParts[0];
  }

  return {
    __type: "complex",
    rules: ruleParts
  };
}

function compileGrammar(grammar: RawGrammar): CompiledGrammar {
  const compiledGrammar: Record<string, Rule | undefined> = {};

  // initialize
  for (let ruleName in grammar) {
    compiledGrammar[ruleName] = undefined;
  }

  for (let ruleName in grammar) {
    const rule = grammar[ruleName].replace("\n", "").trim();
    const ruleCases = rule.split(/(?: )*\|(?: )*/g);

    let compiledRule: Rule;

    if (ruleCases.length > 1) {
      compiledRule = { __type: "or", rules: [] };
      for (let ruleCase of ruleCases) {
        compiledRule.rules.push(parseRule(ruleCase, compiledRule));
      }
    } else {
      compiledRule = parseRule(ruleCases[0]);
    }

    compiledGrammar[ruleName] = compiledRule;

    // if (ruleParts.length === 1) {
    //   compiledGrammar[ruleName] = ruleParts[0];
    // } else {
    //   compiledGrammar[ruleName] =
    // }
  }

  return compiledGrammar as CompiledGrammar;
}

export default compileGrammar;