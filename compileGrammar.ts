import fs from "fs";

import { RawGrammar } from "./parseGrammar";
import Token from "./Token";
import Stack from "./Stack";
import { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } from "constants";

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

  for (let ruleName in rawGrammar) {
    const rule = rawGrammar[ruleName].replace("\n", "").trim();
    const alternatives = rule.split(/(?: )*\|(?: )*/g);

    let compiledRule: Partial<Rule> = { name: ruleName };

    if (alternatives.length > 1) {
      compiledRule = {
        ...compiledRule,
        __type: "or",
        rules: []
      } as AlternativesRule;

      for (let idx in alternatives) {
        const alternative = alternatives[idx];
        compiledRule.rules!.push({
          name: `${ruleName}${idx}`,
          ...parseRule(alternative)
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
