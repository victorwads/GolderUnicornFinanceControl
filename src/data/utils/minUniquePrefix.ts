export class UniqueIdShortener<T extends { id: string }> {
  public items: T[];
  private minLength = 0;
  private lastLength = -1; // assinatura simples baseada só na contagem

  constructor(items: T[] = []) {
    this.items = [...items];
    this.recalculate();
  }

  setItems(items: T[]): void {
    this.items = [...items];
    this.recalculate();
  }

  private validateNoDuplicates() {
    const seen = new Set<string>();
    for (const it of this.items) {
      if (seen.has(it.id)) throw new Error(`ID duplicado: ${it.id}`);
      seen.add(it.id);
    }
  }

  private computeMinLength(): number {
    if (this.items.length === 0) return 0;
    const ids = this.items.map(i => i.id);
    const max = Math.max(...ids.map(i => i.length));
    for (let len = 1; len <= max; len++) {
      const prefixes = new Set(ids.map(id => id.slice(0, len)));
      if (prefixes.size === ids.length) return len;
    }
    return max;
  }

  private recalculate() {
    this.validateNoDuplicates();
    this.minLength = this.computeMinLength();
    this.lastLength = this.items.length;
  }

  private ensure() {
    if (this.items.length !== this.lastLength) {
      this.recalculate();
    }
  }

  getMinLength(): number {
    this.ensure();
    return this.minLength;
  }

  shorten(): (Omit<T, 'id'> & { id: string })[] {
    this.ensure();
    const len = this.minLength;
    return this.items.map(i => ({ ...i, id: i.id.slice(0, len) }));
  }

  restore(shortId: string): string | undefined {
    this.ensure();
    if (shortId.length !== this.minLength) return undefined;
    const match = this.items.filter(i => i.id.startsWith(shortId));
    return match.length === 1 ? match[0].id : undefined;
  }
}
