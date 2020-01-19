import fs from "fs";

import Lexer from "./Lexer";
import compileTokenGrammar from "./compileTokenGrammar";
import parseTokenGrammar from "./parseTokenGrammar";

const rawTokens = fs.readFileSync("./example.tokens", { encoding: "utf-8" });
// const input = fs.readFileSync("./input", { encoding: "utf-8" });

const tokenGrammar = parseTokenGrammar(rawTokens);
const compiledTokenGrammar = compileTokenGrammar(tokenGrammar);

const lexer = new Lexer(compiledTokenGrammar);
const tokenStream = lexer.tokenize(`
const x = -10.5
console.log("the answer to x + 2 is", x + 2)
`);

const tokens = [...tokenStream.filter(t => !(t.is("WS") || t.is("NEWLINE")))];
for (let token of tokens) {
  console.log(token.toString());
}
