import fs from "fs";

import Lexer from "./Lexer";
import compileTokenGrammar from "./compileTokenGrammar";
import parseTokenGrammar from "./parseTokenGrammar";

const rawTokens = fs.readFileSync("./l.tokens", { encoding: "utf-8" });
// const input = fs.readFileSync("./input", { encoding: "utf-8" });

const tokenGrammar = parseTokenGrammar(rawTokens);
const compiledTokenGrammar = compileTokenGrammar(tokenGrammar);

const lexer = new Lexer(compiledTokenGrammar);
const tokenStream = lexer.tokenize(`
  // input program
`);

console.log(
  [...tokenStream.filter(t => t.offset < 50)].map(t => t.value).join("")
);
