## Lex

Parser written in TypeScript.

Eventually I'd like this to include the full parser toolchain.

Edit the input string in `index.ts` and edit the token file `l.token` as you see fit.

## Tokenizer

_Input_

```
const x = -10.5
console.log("the answer to x + 2 is", x + 2)
```

_Token Output_ (with `NEWLINES` and `WS` tokens filtered)

```
[ Token { type: 'KEYWORD', value: 'const', offset: 1 },
  Token { type: 'IDENTIFIER', value: 'x', offset: 7 },
  Token { type: 'OPERATOR', value: '=', offset: 9 },
  Token { type: 'DECIMALLITERAL', value: '-10.5', offset: 11 },
  Token { type: 'IDENTIFIER', value: 'console', offset: 17 },
  Token { type: 'SEPARATOR', value: '.', offset: 24 },
  Token { type: 'IDENTIFIER', value: 'log', offset: 25 },
  Token { type: 'PARENTHESIS', value: '(', offset: 28 },
  Token {
    type: 'STRINGLITERAL',
    value: '"the answer to x + 2 is"',
    offset: 29 },
  Token { type: 'SEPARATOR', value: ',', offset: 53 },
  Token { type: 'IDENTIFIER', value: 'x', offset: 55 },
  Token { type: 'OPERATOR', value: '+', offset: 57 },
  Token { type: 'INTLITERAL', value: '2', offset: 59 },
  Token { type: 'PARENTHESIS', value: ')', offset: 60 } ]
```
