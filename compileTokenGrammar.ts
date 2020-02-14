import { RawGrammar } from "./parseGrammar";

const ESCAPED_QUOTE_MARKER = "$_$_$";
const ESCAPED_QUOTE_MARKER_REGEXP = new RegExp(`\\$_\\$_\\$`, "g");

const REGEXP_SPECIAL_CHARS = "$?|*.[]+()/".split("");
const REGEXP_SPECIAL_CHARS_REGEXP = new RegExp(
  `${REGEXP_SPECIAL_CHARS.map(c => "\\" + c).join("|")}`,
  "g"
);

export type CompiledTokenGrammar = Array<[string, RegExp]>;

function processRule(rawRule: string): RegExp {
  const ruleRegex = rawRule
    .replace(/\\"/g, ESCAPED_QUOTE_MARKER)
    .replace(/"[^"]+"/g, function(substring, ...args) {
      let replacement = substring
        .substring(1, substring.length - 1)
        .replace(REGEXP_SPECIAL_CHARS_REGEXP, char => "\\" + char);

      return replacement;
    })
    .replace(/[ ]*\|[ ]*/g, "|")
    .replace(ESCAPED_QUOTE_MARKER_REGEXP, '"');

  return new RegExp(`^(${ruleRegex})`);
}

function compileTokenGrammar(tokenGrammar: RawGrammar): CompiledTokenGrammar {
  const compiledGrammar: CompiledTokenGrammar = [];

  for (let [ruleName, rawRule] of tokenGrammar) {
    compiledGrammar.push([ruleName, processRule(rawRule)]);
  }

  return compiledGrammar;
}

export default compileTokenGrammar;
