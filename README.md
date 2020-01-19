Parser written in TypeScript.

Eventually I'd like this to include the full parser toolchain.

Edit the input string in `index.ts` and edit the token file `l.token` as you see fit.

## Tokenizer

### Token Grammar

A file containing Key:Value pairs describing what valid tokens are in the language to be parsed.

The LHS is the name of the token e.g. `KEYWORD` or `INTLITERAL`.

The RHS describes the token either via REGEX or via one-or-many literals

- `"const" | "var" | "let"` would capture tokens matching those strings exactly. Expressions of this type are automatically compiled into regular expressions (`const|var|let` in this case).
- `0 | [1-9][0-9]*` would capture tokens for which the regular expression matches. This particular expression matches integer literals like `0` or `7` or `17`.
- use \ to escape quotes. For example, you could match a string literal with `'[^']*' | \"[^\"]*\"`

The right hand side must be terminated by a semi-colon.

See `example.tokens` for a complete example. The language described looks like TypeScript.

_Input_

```
const x = -10.5
console.log("the answer to x + 2 is", x + 2)
```

_Token Output_ (with `NEWLINES` and `WS` tokens filtered)

```js
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
