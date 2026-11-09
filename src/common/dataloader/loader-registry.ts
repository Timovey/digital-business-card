import DataLoader from 'dataloader';

/** Загружает значения для пачки ключей; результат должен совпадать с `keys` по индексам. */
export type BatchLoadFn<K, V> = (keys: readonly K[]) => Promise<V[]>;

/**
 * Реестр экземпляров DataLoader в рамках одного запроса.
 *
 * Batch-функции живут в singleton-провайдерах (у них нет состояния), а оборачивающий их
 * DataLoader создаётся лениво, один раз на GraphQL-запрос. Так кэш DataLoader живёт
 * в рамках запроса, но весь DI-граф не становится request-scoped
 * (`Scope.REQUEST` в Nest пересоздавал бы каждый зависимый провайдер).
 */
export class LoaderRegistry {
  private readonly loaders = new Map<BatchLoadFn<unknown, unknown>, DataLoader<unknown, unknown>>();

  get<K, V>(batchLoadFn: BatchLoadFn<K, V>): DataLoader<K, V> {
    const key = batchLoadFn as BatchLoadFn<unknown, unknown>;
    let loader = this.loaders.get(key);
    if (!loader) {
      loader = new DataLoader<unknown, unknown>(key);
      this.loaders.set(key, loader);
    }
    return loader as DataLoader<K, V>;
  }
}
