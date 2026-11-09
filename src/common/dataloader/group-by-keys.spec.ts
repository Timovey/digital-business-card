import { groupByKeys } from './group-by-keys';

describe('groupByKeys', () => {
  const rows = [
    { id: 1, ownerId: 'b' },
    { id: 2, ownerId: 'a' },
    { id: 3, ownerId: 'b' },
  ];

  it('aligns groups with the order of keys and keeps row order', () => {
    expect(groupByKeys(['a', 'b'], rows, (r) => r.ownerId)).toEqual([
      [{ id: 2, ownerId: 'a' }],
      [
        { id: 1, ownerId: 'b' },
        { id: 3, ownerId: 'b' },
      ],
    ]);
  });

  it('returns an empty group for keys without rows', () => {
    expect(groupByKeys(['x', 'a'], rows, (r) => r.ownerId)).toEqual([
      [],
      [{ id: 2, ownerId: 'a' }],
    ]);
  });

  it('ignores rows whose key was not requested', () => {
    expect(groupByKeys(['a'], rows, (r) => r.ownerId)).toEqual([[{ id: 2, ownerId: 'a' }]]);
  });
});
