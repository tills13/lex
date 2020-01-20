import { RawGrammar } from "./parseTokenGrammar";

const ESCAPED_QUOTE_MARKER = "$_$_$";
const ESCAPED_QUOTE_MARKER_REGEXP = new RegExp(`\\$_\\$_\\$`, "g");

const REGEXP_SPECIAL_CHARS = "$?|*.[]+()/".split("");
const REGEXP_SPECIAL_CHARS_REGEXP = new RegExp(
  `${REGEXP_SPECIAL_CHARS.map(c => "\\" + c).join("|")}`,
  "g"
);

export type CompiledTokenGrammar = Record<string, RegExp>;

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

export default function compileTokenGrammar(tokenGrammar: RawGrammar) {
  const compiledGrammar: CompiledTokenGrammar = {};

  for (let rule in tokenGrammar) {
    const rawRule = tokenGrammar[rule];
    compiledGrammar[rule] = processRule(rawRule);
  }

  return compiledGrammar;
}
