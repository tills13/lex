class Token {
  constructor(
    public type: string,
    public value: string,
    public offset: number
  ) {}

  is(predicate: string | ((token: Token) => boolean)): boolean {
    return typeof predicate === "string"
      ? this.is(t => t.type === predicate)
      : predicate(this);
  }
}

export default Token;
