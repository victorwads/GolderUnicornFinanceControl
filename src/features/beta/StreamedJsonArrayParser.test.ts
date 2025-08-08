import { describe, it, expect, vi, beforeEach } from 'vitest';
import StreamedJsonArrayParser from './StreamedJsonArrayParser';

// Helper to collect all parsed payloads
function collect<T>() {
  const found: any[] = [];
  const parser = new StreamedJsonArrayParser<T>((data: any) => {
    found.push(data);
  });
  return { parser, found } as const;
}

describe('StreamedJsonArrayParser', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('parses a single complete JSON object in one chunk', () => {
    const { parser, found } = collect<any>();

    parser.push('{"id":1,"name":"rice"}');

    expect(found.length).toBe(1);
    expect(found[0]).toEqual({ id: 1, name: 'rice' });
  });

  it('parses a single JSON object split across multiple chunks (including nested objects)', () => {
    const { parser, found } = collect<any>();

    parser.push('{"id":');
    parser.push('1');
    parser.push(',"nested":{');
    parser.push('"a"');
    parser.push(':2}');
    parser.push('}');

    expect(found.length).toBe(1);
    expect(found[0]).toEqual({ id: 1, nested: { a: 2 } });
  });

  it('parses multiple consecutive objects in a single stream', () => {
    const { parser, found } = collect<any>();

    parser.push('{"a":1}{"a":2}{"b":3}');

    expect(found.length).toBe(3);
    expect(found[0]).toEqual({ a: 1 });
    expect(found[1]).toEqual({ a: 2 });
    expect(found[2]).toEqual({ b: 3 });
  });

  it('ignores characters before the first object and between objects', () => {
    const { parser, found } = collect<any>();

    parser.push('   [  '); // ignored until first '{'
    parser.push('{"a":3}');

    expect(found.length).toBe(1);
    expect(found[0]).toEqual({ a: 3 });
  });

  it('does not emit while object is incomplete', () => {
    const { parser, found } = collect<any>();

    parser.push('{"a":');

    expect(found.length).toBe(0);

    parser.push('1}');

    expect(found.length).toBe(1);
    expect(found[0]).toEqual({ a: 1 });
  });

  it('handles trailing commas in objects (like javascript code)', () => {
    const { parser, found } = collect<any>();

    parser.push('{"a":1,}');

    expect(found.length).toBe(1);
    expect(found[0]).toEqual({ a: 1 });
  });

  it('logs an error and resets buffer on invalid JSON', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { parser, found } = collect<any>();

    parser.push('{"a":banana}'); // invalid JSON

    expect(errorSpy).toHaveBeenCalled();
    expect(found.length).toBe(0);
  });

  it('when have noise on text', () => {
    const { parser, found } = collect<any>();

    parser.push('other things here {"a":"text"} more thing here'); // invalid JSON

    expect(found.length).toBe(1);
    expect(found[0]).toEqual({ a: 'text' });
  });

  it('perfect array', () => {
    const { parser, found } = collect<any>();

    parser.push('[{"a":1},{"a":2},{"b":3}]');

    expect(found.length).toBe(3);
    expect(found[0]).toEqual({ a: 1 });
    expect(found[1]).toEqual({ a: 2 });
    expect(found[2]).toEqual({ b: 3 });
  });

});
