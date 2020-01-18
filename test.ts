import fs from "fs";

import Lexer from "./Lexer";
import compileTokenGrammar from "./compileTokenGrammar";
import parseTokenGrammar from "./parseTokenGrammar";

const rawTokens = fs.readFileSync("./l.tokens", { encoding: "utf-8" });
const input = fs.readFileSync("./test2.ys", { encoding: "utf-8" });

const tokenGrammar = parseTokenGrammar(rawTokens);
const compiledTokenGrammar = compileTokenGrammar(tokenGrammar);

const lexer = new Lexer(compiledTokenGrammar);
const tokenStream = lexer.tokenize(input);

console.log(
  [...tokenStream.filter(t => t.offset < 50)].map(t => t.value).join("")
);
