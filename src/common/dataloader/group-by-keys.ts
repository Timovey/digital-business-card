/**
 * Группирует строки по внешнему ключу и выравнивает группы по запрошенным ключам,
 * как требует контракт DataLoader. Ключам без строк достаётся пустой массив.
 * Порядок строк внутри группы сохраняется, так что ORDER BY из запроса продолжает действовать.
 */
export function groupByKeys<K, V>(
  keys: readonly K[],
  rows: readonly V[],
  keyOf: (row: V) => K,
): V[][] {
  const groups = new Map<K, V[]>(keys.map((key) => [key, []]));
  for (const row of rows) {
    groups.get(keyOf(row))?.push(row);
  }
  return keys.map((key) => groups.get(key) ?? []);
}
