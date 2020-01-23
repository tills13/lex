class Stack<T> {
  constructor(public stack: T[] = []) {}

  clone(): Stack<T> {
    return new Stack([...this.stack]);
  }

  peek(): T {
    return this.stack[this.stack.length - 1];
  }

  pop() {
    return this.stack.pop();
  }

  push(t: T): void {
    this.stack.push(t);
  }

  size(): number {
    return this.stack.length;
  }
}

export default Stack;
