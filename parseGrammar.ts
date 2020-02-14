export enum State {
  Comment,
  Consuming,
  Parsing,
  String
}

export type RawGrammar = Array<[string, string]>;

export default function parseGrammar(grammar: string): RawGrammar {
  const _grammar: RawGrammar = [];

  let index = -1;
  let currentNode: string | undefined;
  let state: State = State.Parsing;
  let prevState: State | undefined;

  let buffer: string[] = [];

  while (index++ < grammar.length) {
    const char = grammar.charAt(index);
    buffer.push(char);

    // if we're dealing with a comment, continue consuming input until
    // a newline is reached. multi-line comments are not supported.
    if (state === State.Comment) {
      if (char !== "\n") {
        continue;
      }
    }

    if (state === State.String && char !== '"') {
      continue;
    }

    // if we consume a " that isn't preceded by a \, we're either
    // starting a string or terminating a string.
    if (char === '"') {
      if (grammar.charAt(index - 1) === "\\") {
        // ...
      } else {
        if (state === State.String) {
          state = prevState || State.Parsing;
        } else {
          state = State.String;
        }
      }
    }

    if (char === "#") {
      state = State.Comment;
    }

    if (char === "\n") {
      buffer.pop();

      if (state === State.Comment) {
        state = State.Parsing;
        buffer = [];
      }
    }

    if (char === ":") {
      if (state === State.String) {
        continue;
      }

      const part = buffer
        .slice(0, buffer.length - 1)
        .join("")
        .trim();

      currentNode = part;

      buffer = [];
    }

    if (char === ";") {
      if (state === State.String || grammar.charAt(index - 1) === "\\") {
        continue;
      }

      buffer.pop();

      const part = buffer.join("").trim();

      if (!currentNode) {
        throw new Error("invalid token grammar");
      }

      _grammar.push([currentNode, part]);

      index += 1; // consume the ";"
      buffer = [];
    }
  }

  return _grammar;
}
