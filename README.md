Parser written in TypeScript.

Eventually I'd like this to include the full parser toolchain.

Edit the input string in `index.ts` and edit the token file `example.tokens` as you see fit.

## Tokenizer

### Token Grammar

Key:Value pairs describing valid tokens in the language to be parsed.

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

```
(KEYWORD const)
(IDENTIFIER x)
(OPERATOR =)
(OPERATOR -)
(DECIMALLITERAL 10.5)
(IDENTIFIER console)
(SEPARATOR .)
(IDENTIFIER log)
(SEPARATOR ()
(STRINGLITERAL "the answer to x + 2 is")
(SEPARATOR ,)
(IDENTIFIER x)
(OPERATOR +)
(INTLITERAL 2)
(SEPARATOR ))
```
