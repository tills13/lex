import fs from "fs";
import util from "util";

import Lexer from "./Lexer";
import compileTokenGrammar from "./compileTokenGrammar";
import parseGrammar from "./parseTokenGrammar";
import compileGrammar from "./compileGramar";
import Parser from "./Parser";

const rawTokens = fs.readFileSync("./example.tokens", { encoding: "utf-8" });
const rawGrammar = fs.readFileSync("./example.grammar", { encoding: "utf-8" });
// const input = fs.readFileSync("./input", { encoding: "utf-8" });

const grammar = parseGrammar(rawGrammar);
const compiledGrammar = compileGrammar(grammar);

if (false) {
  console.log(
    util.inspect(compiledGrammar, {
      depth: 10,
      showHidden: false,
      colors: true
    })
  );
}

const tokenGrammar = parseGrammar(rawTokens);
const compiledTokenGrammar = compileTokenGrammar(tokenGrammar);

const lexer = new Lexer(compiledTokenGrammar);
const tokenStream = lexer.tokenize(`1 + 2 * 3`, { trim: true });

const parser = new Parser(compiledGrammar);
parser.parse(tokenStream);

// const tokens = [...tokenStream.filter(t => !(t.is("WS") || t.is("NEWLINE")))];
// for (let token of tokens) {
//   console.log(token.toString());
// }
