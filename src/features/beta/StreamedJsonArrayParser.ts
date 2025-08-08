

/**
 * StreamedJsonArrayParser is a utility class that parses streamed JSON data
 * containing sequences of JSON objects, specifically designed to handle
 * imcomplete arrays and objects.
 */
export default class StreamedJsonArrayParser<T> {
  private buffer: string = '';
  private oppenedBrackets: number = 0;
  private get isInsideObject () {
    return this.oppenedBrackets > 0;
  }

  constructor(private onFoundObject: (data: T[]) => void) {}

  public push(chunk: string) {
    const chars = chunk.split('');
    for (const char of chars) {

      // ignore characters outside of JSON objects
      if (char !== '{' && !this.isInsideObject) return;
      
      this.buffer += char;
      if (char === '{') {
        this.oppenedBrackets++;
      } else if (char === '}') {
        this.oppenedBrackets--;
        if (this.oppenedBrackets === 0) {
          this.parseCompleteObject();
        }
      }
    }
  }

  private parseCompleteObject() {
    this.removeJSLikeCommas();
    try {
      const data: T[] = JSON.parse(this.buffer);
      this.onFoundObject(data);
    } catch (error) {
      console.error('Failed to parse streamed JSON objected:', this.buffer, error);
    }
    this.buffer = '';
  }

  /** Remove JS like trailing commas like {"a":1,} */
  private removeJSLikeCommas() {
    this.buffer = this.buffer.replace(/,\s*}$/, '}');
  }
}
