import { describe, it, expect } from 'vitest';
import { increment } from 'firebase/firestore';
import { incrementUseValues, sumValues } from './ResourcesUseRepository';
import { ResourceUsage, ResourceUseNode } from '@resourceUse';

describe('useUtils', () => {
  describe('incrementUseValues', () => {
    it('deve transformar números em sentinelas increment nos níveis de topo', () => {
      const input = { queryReads: 2, docReads: 3, writes: 1 } as any;
      const out = incrementUseValues(input);
      expect(out).toEqual({
        queryReads: increment(2),
        docReads: increment(3),
        writes: increment(1),
      });
    });

    it('deve processar profundamente incluindo nós aninhados (remote/local/cache/ai)', () => {
      const input: ResourceUsage = {
        remote: { queryReads: 1, docReads: 2, writes: 3 },
        local: { queryReads: 0, docReads: 5, writes: 0 },
        cache: { queryReads: 7, docReads: 0, writes: 9 },
        ai: {
          ["gpt-5-nano"]: { input: 100, output: 200, requests: 3 },
          ["gpt-5-mini"]: { input: 10, output: 20, requests: 1 },
        },
      };

      const out = incrementUseValues(input);
      expect(out).toEqual({
        remote: { queryReads: increment(1), docReads: increment(2), writes: increment(3) },
        local: { queryReads: increment(0), docReads: increment(5), writes: increment(0) },
        cache: { queryReads: increment(7), docReads: increment(0), writes: increment(9) },
        ai: {
          "gpt-5-nano": { input: increment(100), output: increment(200), requests: increment(3) },
          "gpt-5-mini": { input: increment(10), output: increment(20), requests: increment(1) },
        },
      });
    });
  });

  describe('sumValues', () => {
    it('deve somar valores rasos e retornar o alvo mutado', () => {
      const source = { a: 1, b: 2 };
      const additional = { a: 3, c: 4, d: 5 };
      const result = sumValues(source, additional);
      const expected = { a: 4, b: 2, c: 4, d: 5 }
      expect(result).toEqual(expected);
      expect(result).not.toEqual(source);
    });

    it('deve somar valores rasos e retornar o alvo mutado', () => {
      const source = { a: 1, b: 2 };
      const additional = { a: 3, c: 4, d: 5 };
      const result = sumValues(source, additional, false);
      const expected = { a: 4, b: 2, c: 4, d: 5 }
      expect(result).toEqual(expected);
      expect(result).toEqual(source);
    });

    it('deve somar valores e criar sub objectos que não existem em copia', () => {
      const source = {};
      const additional = { a: 3, c: { t: { ok: 5}}, d: 5 };
      const result = sumValues(source, additional);
      const expected = { a: 3, c: { t: { ok: 5}}, d: 5 }
      expect(result).toEqual(expected);
      expect(result).not.toEqual(source);
    });

    it('deve somar valores e criar sub objectos que não existem no original', () => {
      const source = {};
      const additional = { a: 3, c: { t: { ok: 5}}, d: 5 };
      const result = sumValues(source, additional, false);
      const expected = { a: 3, c: { t: { ok: 5}}, d: 5 }
      expect(result).toEqual(expected);
      expect(result).toEqual(source);
    });

    it('deve somar valores aninhados criando objetos quando necessário', () => {
      const target = {
        remote: { writes: 2 },
        ai: {
          gpt4o: { input: 100, output: 200, requests: 3 },
          gpt5: { input: 0, output: 8, requests: 3 },
        },
      };
      const additional: ResourceUseNode = {
        remote: { writes: 1, docReads: 5 },
        ai: {
          ["gpt-5-nano"]: { input: 10 },
          ["gpt-5-mini"]: { output: 5, requests: 1 },
        },
      };

      const result = sumValues(target, additional);
      expect(result).toEqual({
        remote: { writes: 3, docReads: 5 },
        ai: {
          gpt4o: { input: 100, output: 200, requests: 3 },
          gpt5: { input: 0, output: 8, requests: 3 },
          "gpt-5-nano": { input: 10 },
          "gpt-5-mini": { output: 5, requests: 1 },
        },
      });
    });

    it('deve permitir uso como função pura retornando novo objeto quando alvo é vazio', () => {
      const result = sumValues({}, { x: 1, nested: { y: 2 } });
      expect(result).toEqual({ x: 1, nested: { y: 2 } });
    });
  });
});
