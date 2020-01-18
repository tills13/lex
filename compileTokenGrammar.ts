import { RawTokenGrammar } from "./parseTokenGrammar";

const ESCAPED_PARENS_MARKER = "$_$_$";
const ESCAPED_PARENS_MARKER_REGEXP = new RegExp(`\\$_\\$_\\$`, "g");
const REGEXP_SPECIAL_CHARS = "?|*.[]+()/".split("");
const REGEXP_SPECIAL_CHARS_REGEXP = new RegExp(
  `${REGEXP_SPECIAL_CHARS.map(c => "\\" + c).join("|")}`,
  "g"
);

export type CompiledTokenGrammar = Record<string, RegExp>;

export default function compileTokenGrammar(tokenGrammar: RawTokenGrammar) {
  const compiledGrammar: CompiledTokenGrammar = {};

  Object.keys(tokenGrammar).forEach(rule => {
    const rawRule = tokenGrammar[rule];

    const mRule = rawRule
      .replace(/\\"/g, ESCAPED_PARENS_MARKER)
      .replace(/"[^"]+"/g, function(substring, ...args) {
        let replacement = substring
          .substring(1, substring.length - 1)
          .replace(REGEXP_SPECIAL_CHARS_REGEXP, char => "\\" + char);

        return replacement;
      })
      .replace(/[ ]*\|[ ]*/g, "|")
      .replace(ESCAPED_PARENS_MARKER_REGEXP, '"');

    compiledGrammar[rule] = new RegExp(`^(${mRule})$`);
  });

  return compiledGrammar;
}
