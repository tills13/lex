import fs from "fs";

import Lexer from "./Lexer";
import compileTokenGrammar from "./compileTokenGrammar";
import parseTokenGrammar from "./parseTokenGrammar";

const rawTokens = fs.readFileSync("./l.tokens", { encoding: "utf-8" });
// const input = fs.readFileSync("./input", { encoding: "utf-8" });

const tokenGrammar = parseTokenGrammar(rawTokens);
const compiledTokenGrammar = compileTokenGrammar(tokenGrammar);

const lexer = new Lexer(compiledTokenGrammar);
const tokenStream = lexer.tokenize(`-1.0 + 2 + -3`);

console.log(tokenStream);
