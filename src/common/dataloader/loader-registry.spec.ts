import { type BatchLoadFn, LoaderRegistry } from './loader-registry';

describe('LoaderRegistry', () => {
  const double: BatchLoadFn<number, number> = (keys) => Promise.resolve(keys.map((k) => k * 2));

  it('returns the same DataLoader for the same batch function', () => {
    const registry = new LoaderRegistry();
    expect(registry.get(double)).toBe(registry.get(double));
  });

  it('isolates caches between registries (i.e. between requests)', () => {
    expect(new LoaderRegistry().get(double)).not.toBe(new LoaderRegistry().get(double));
  });

  it('coalesces loads issued in the same tick into one batch', async () => {
    const batch = jest.fn(double);
    const loader = new LoaderRegistry().get(batch);

    await expect(Promise.all([loader.load(1), loader.load(2), loader.load(1)])).resolves.toEqual([
      2, 4, 2,
    ]);
    expect(batch).toHaveBeenCalledTimes(1);
    expect(batch).toHaveBeenCalledWith([1, 2]);
  });
});
