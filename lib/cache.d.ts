export interface Cache<K, V> {
  get(key: K): Promise<V>;
}
export declare function memoize<K, V>(fun: (key: K) => V): (key: K) => V;
declare abstract class MapCache<K, V> implements Cache<K, V> {
  private readonly map;
  get(key: K): Promise<V>;
  abstract loadFn(key: K): Promise<V>;
  protected upToDateFn(key: K): Promise<boolean>;
}
declare class ReadFileCache extends MapCache<string, string> {
  private readonly modified;
  private logger;
  getAsJson<T>(path: string): Promise<T>;
  loadFn(key: string): Promise<string>;
  protected upToDateFn(key: string): Promise<boolean>;
}
export declare const readFileCache: ReadFileCache;
declare class FetchCache<T> extends MapCache<string, T> {
  private logger;
  loadFn(key: string): Promise<T>;
}
export declare const fetchCache: FetchCache<any>;
export {};
