import { RawGrammar } from "./parseGrammar";
import Token from "./Token";
import Stack from "./Stack";

interface BaseRule {
  name: string;
  optional?: boolean;
  parent?: Rule;
  repeats?: boolean;
}

// type AnonymousRule = Partia;

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

function resolveRule(fragment: string): Rule {
  let resolvedRule: Rule;

  if (fragment.endsWith("*")) {
    resolvedRule = resolveRule(fragment.substring(0, fragment.length - 1));
    resolvedRule.optional = true;
    resolvedRule.repeats = true;
  } else if (fragment.endsWith("+")) {
    resolvedRule = resolveRule(fragment.substring(0, fragment.length - 1));
    resolvedRule.repeats = true;
  } else if (fragment.endsWith("?")) {
    resolvedRule = resolveRule(fragment.substring(0, fragment.length - 1));
    resolvedRule.optional = true;
  } else if (fragment.startsWith('"')) {
    const value = fragment.substring(1, fragment.length - 1);
    resolvedRule = { __type: "literal", value };
  } else if (fragment.startsWith("(")) {
    resolvedRule = resolveRule(fragment.substring(1, fragment.length - 1));
  } else {
    resolvedRule = { __type: "ref", target: fragment };
  }

  return resolvedRule;
}

function parseRule(rawRulePart: string, parent?: Rule): Partial<Rule> {
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

  return { __type: "complex", rules: ruleParts };
}

function compileGrammar(rawGrammar: RawGrammar): Rule[] {
  const grammar: Rule[] = [];

  for (let ruleName in rawGrammar) {
    const rule = rawGrammar[ruleName].replace("\n", "").trim();
    const ruleCases = rule.split(/(?: )*\|(?: )*/g);

    let compiledRule: Partial<Rule> = { name: ruleName };

    if (ruleCases.length > 1) {
      compiledRule = { ...compiledRule, __type: "or", rules: [] };

      for (let ruleCase of ruleCases) {
        compiledRule.rules.push(parseRule(ruleCase, compiledRule));
      }
    } else {
      compiledRule = parseRule(ruleCases[0]);
    }

    compiledRule.name = ruleName;

    grammar.push(compiledRule as Rule);
  }

  return grammar;
}

export default compileGrammar;
