import fs from "fs";

import { RawGrammar } from "./parseGrammar";
import Token from "./Token";
import Stack from "./Stack";

interface BaseRule {
  name: string;
  optional?: boolean;
  repeats?: boolean;
}

export interface LiteralRule extends BaseRule {
  __type: "literal";
  value: string;
}

export interface RefRule extends BaseRule {
  __type: "ref";
  target: string;
}

export interface AlternativesRule extends BaseRule {
  __type: "or";
  rules: Array<Rule>;
}

export interface ComplexRule extends BaseRule {
  __type: "complex";
  rules: Array<Rule>;
}

export type Rule = ComplexRule | LiteralRule | AlternativesRule | RefRule;
export type CompiledGrammar = Record<string, Rule>;

export function canCompileRule(
  allRules: Rule[],
  rule: Rule,
  seen: string[] = []
): boolean {
  if (seen.includes(rule.name)) {
    return false;
  }

  switch (rule.__type) {
    case "complex": {
      seen.push(rule.name);

      for (const subRule of rule.rules) {
        if (subRule.__type === "literal") {
          return false;
        }

        if (!canCompileRule(allRules, subRule, seen)) {
          return false;
        }
      }

      break;
    }
    case "or": {
      for (const subRule of rule.rules) {
        if (!canCompileRule(allRules, subRule, seen)) {
          return false;
        }
      }

      break;
    }
    case "ref": {
      const target = allRules.find(r => r.name === rule.target);
      return !!target && canCompileRule(allRules, target, seen);
    }
  }

  return true;
}

function resolveRule(fragment: string): Partial<Rule> {
  let resolvedRule: Partial<Rule>;

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

function parseRule(rawRulePart: string): Partial<Rule> {
  const parts = rawRulePart.split(" ");
  const ruleParts: Array<Rule> = [];

  for (let part of parts) {
    const rule = resolveRule(part);
    ruleParts.push(rule as Rule);
  }

  if (ruleParts.length === 1) {
    return ruleParts[0];
  }

  return { __type: "complex", rules: ruleParts };
}

function writeDeclarations(grammar: Rule[]) {
  const out = fs.openSync("./grammar.compiled.ts", "w");

  fs.writeSync(out, "export enum Symbols {\n");

  for (let idx = 0; idx < grammar.length; idx++) {
    const rule = grammar[idx];
    fs.writeSync(out, `  ${rule.name} = '${rule.name}',\n`);
  }

  fs.writeSync(out, "};\n");

  fs.closeSync(out);
}

interface CompileGrammarOptions {
  writeDeclarationFile?: boolean;
}

export default function compileGrammar(
  rawGrammar: RawGrammar,
  opts: CompileGrammarOptions
): Rule[] {
  const grammar: Rule[] = [];

  for (let [ruleName, rawRule] of rawGrammar) {
    const rule = rawRule.replace("\n", "").trim();
    const alternatives = rule.split(/(?: )*\|(?: )*/g);

    let compiledRule: Partial<Rule> = { name: ruleName };

    if (alternatives.length > 1) {
      compiledRule = {
        ...compiledRule,
        __type: "or",
        rules: []
      } as AlternativesRule;

      for (let idx in alternatives) {
        const rawAlt = alternatives[idx];
        const alternative = parseRule(rawAlt);
        compiledRule.rules!.push({
          name:
            alternative.__type === "ref"
              ? alternative.target
              : `${ruleName}${idx}`,
          ...alternative
        } as Rule);
      }
    } else {
      compiledRule = { ...compiledRule, ...parseRule(alternatives[0]) };
    }

    grammar.push(compiledRule as Rule);
  }

  if (opts.writeDeclarationFile) {
    writeDeclarations(grammar);
  }

  return grammar;
}
