import { describe, it, expect } from 'vitest';
import { UniqueIdShortener } from './minUniquePrefix';

const fireChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const randomFirestoreId = () => Array.from({ length: 20 }, () => fireChars[Math.floor(Math.random() * fireChars.length)]).join('');

describe('UniqueIdShortener', () => {
  it('minLength esperado em cenário fixo (3 prefixos iguais exigem 3)', () => {
    const s = new UniqueIdShortener([
      { id: 'abc123' },
      { id: 'abd456' },
      { id: 'abf789' },
      { id: 'zzz000' }
    ]);
    expect(s.getMinLength()).toBe(3); // abc abd abf zzz => precisam de 3
    const shortened = s.shorten();
    expect(shortened.every(x => x.id.length === 3)).toBe(true);
  });

  it('calcula comprimento mínimo', () => {
    const s = new UniqueIdShortener([{ id: 'abc123' }, { id: 'abd999' }, { id: 'zzz000' }]);
    const min = s.getMinLength();
    expect(min).toBeGreaterThanOrEqual(1);
    const shortList = s.shorten();
    expect(new Set(shortList.map(x => x.id)).size).toBe(3);
    expect(shortList.every(x => x.id.length === min)).toBe(true);
  });

  it('atualiza quando lista muda', () => {
  const s = new UniqueIdShortener([{ id: 'abc' }, { id: 'abd' }]);
  const len1 = s.getMinLength();
  s.setItems([...s.items, { id: 'abf' }]);
  const len2 = s.getMinLength();
  expect(len2).toBeGreaterThanOrEqual(len1);
  });

  it('recalcula ao dar push direto (length mudou)', () => {
    const s = new UniqueIdShortener([{ id: 'abc' }, { id: 'abd' }]);
    const before = s.getMinLength();
    (s.items as any).push({ id: 'abf' });
    const after = s.getMinLength();
    expect(after).toBeGreaterThanOrEqual(before);
  });

  it('shorten e restore round trip', () => {
    const s = new UniqueIdShortener([{ id: 'appleXYZ' }, { id: 'apricotXYZ' }, { id: 'bananaXYZ' }]);
    const shortList = s.shorten();
    for (const sh of shortList) {
      const full = s.restore(sh.id);
      expect(full).toBeDefined();
    }
  });

  it('restore exige tamanho exato', () => {
    const s = new UniqueIdShortener([{ id: 'carrot123' }, { id: 'celery456' }, { id: 'banana789' }]);
    const min = s.getMinLength();
    const prefix = 'c';
    if (min > 1) expect(s.restore(prefix)).toBeUndefined();
  });

  it('erro em duplicados', () => {
  expect(() => new UniqueIdShortener([{ id: 'dup' }, { id: 'dup' }])).toThrow();
  });

  it('aleatório simples (1024 IDs) round trip amostral', () => {
    const set = new Set<string>();
    while (set.size < 1024) set.add(randomFirestoreId());
    const data = Array.from(set).map(id => ({ id }));
    const s = new UniqueIdShortener(data);
    const min = s.getMinLength();
    const shortened = s.shorten();
    expect(shortened.length).toBe(data.length);
    expect(new Set(shortened.map(x => x.id)).size).toBe(shortened.length);
    expect(shortened.every(x => x.id.length === min)).toBe(true);
    // Amostragem: pegar 23 índices pseudo-aleatórios usando Math.random (suficiente para validar)
    const sampleSize = 23;
    const picked = new Set<number>();
    while (picked.size < sampleSize) {
      picked.add(Math.floor(Math.random() * data.length));
    }
    for (const i of picked) {
      const shortId = shortened[i].id;
      const full = s.restore(shortId);
      expect(full).toBe(data[i].id);
    }
  });
});
