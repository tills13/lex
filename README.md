Parser written in TypeScript.

Eventually I'd like this to include the full parser toolchain.

## Tokenizer

### Usage

```
const lexer = new Lexer(compiledTokenGrammar);
const tokenStream = lexer.tokenize(input, { trim });
```

### Token Grammar

Key:Value pairs describing valid tokens in the language to be parsed.

The LHS is the name of the token e.g. `KEYWORD` or `INTLITERAL`.

The RHS describes the token either via REGEX or via one-or-many literals

- `"const" | "var" | "let"` would capture tokens matching those strings exactly. Expressions of this type are automatically compiled into regular expressions (`const|var|let` in this case).
- `0 | [1-9][0-9]*` would capture tokens for which the regular expression matches. This particular expression matches integer literals like `0` or `7` or `17`.
- use \ to escape quotes. For example, you could match a string literal with `'[^']*' | \"[^\"]*\"`

The right hand side must be terminated by a semi-colon.

See `examples/example.tokens` for a complete example. The language described looks like TypeScript.

_Input_

```
const x = -10.5
console.log("the answer to x + 2 is", x + 2)
```

_Token Output_ (with `NEWLINES` and `WS` tokens filtered or `LexerOptions#trim` enabled)

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

## Parser

The syntactical analysis part of this repo.

### Usage

```
const parser = new Parser(compiledGrammar);
parser.parse(tokenStream);
```

### Grammar

Similar to the token grammar, however, instead of regular expressions, you build structure through recursion and references. The syntax is similar to regular expressions.

See `examples/example.grammar` for a basic example.

For example,

```
Digit:
  "0" | "1" | "2" | "3" | "4" |
  "5" | "6" | "7" | "8" | "9" ;
```

Describes a single digit literal. Following,

```
DigitLiteral1:
  Digit Digit+;

DigitLiteral2:
  Digit Digit*;
```

`DigitLiteral1` describes number literals in your language that look like `10` or `100` or `09` (but not 1..9). That is, the `+` symbol is equivalent to "one or many" of the preceding symbol.

`DigitLiteral2` describes pretty much any integer including sequences starting with `0` e.g. `01`. That is, the `*` symbol is equivalent to "zero or many" of the preceding symbol.

_Note_ as of writing this, neither of these operators work.

Unquoted values on the RHS represent references to other rules. For example, in the above, `Digit` in `DigitLiteralOfLengthGreaterThanOne` refers to and will expand by `Digit`. As of right now, there's no differences between Pascal, camel, or other cased references. Other context-free grammars might impose conventions like "start terminal symbols with a lowercased character".

Quoted fragments on the RHS represent literal values. _example_, `Expression: Digit "+" Digit` matches expressions that looks like `0 + 1` (and so on).

A `?` can be used to mark a fragment as optional. _example_ `DecimalLiteral: Digit? "." Digit Digit*` matches expressions like `0.5`, `0.54`, `.5`, `.54`, and so on.

`Parser#parse` uses a Shift-Reduce algorithm to syntactically analyze the input.
