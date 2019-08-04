import { readFile, stat } from "./fs-utils";
import * as rp from "request-promise-native";
import { Logger } from "./logger";

export interface Cache<K, V> {
  get(key: K): Promise<V>;
}

export function memoize<K, V>(fun: (key: K) => V): (key: K) => V {
  const map: Map<K, V> = new Map<K, V>();
  return (key: K) => {
    if (map.has(key)) {
      return map.get(key) || fun(key);
    }
    const value = fun(key);
    map.set(key, value);
    return value;
  };
}

abstract class MapCache<K, V> implements Cache<K, V> {
  private readonly map: Map<K, Promise<V>> = new Map<K, Promise<V>>();

  async get(key: K): Promise<V> {
    let upToDate = await this.upToDateFn(key);
    if (upToDate) {
      return this.map.get(key) || this.loadFn(key);
    }
    const value = this.loadFn(key);
    this.map.set(key, value);
    return value;
  }

  abstract loadFn(key: K): Promise<V>;

  protected upToDateFn(key: K): Promise<boolean> {
    return Promise.resolve(this.map.has(key));
  }
}

class ReadFileCache extends MapCache<string, string> {
  private readonly modified: Map<string, number> = new Map<string, number>();
  private logger: Logger = Logger.getLogger("cache.file");

  async getAsJson<T>(path: string): Promise<T> {
    const result = await this.get(path);
    return JSON.parse(result) as T;
  }

  loadFn(key: string): Promise<string> {
    this.logger.info("Read file", key);
    return readFile(key, "utf-8");
  }

  protected async upToDateFn(key: string): Promise<boolean> {
    this.logger.trace("check up-to-date", key);
    let stats = await stat(key);
    let lastModified: number = stats.mtimeMs;
    if (this.modified.get(key) === lastModified) {
      this.logger.trace("Hooray, it is up-to-date", key);
      return true;
    }
    this.logger.trace("Out of date", key);
    this.modified.set(key, lastModified);
    return false;
  }
}

export const readFileCache = new ReadFileCache();

class FetchCache<T> extends MapCache<string, T> {
  private logger: Logger = Logger.getLogger("cache.http");

  loadFn(key: string): Promise<T> {
    this.logger.info("HTTP get", key);
    return (rp.get(key, { json: true }) as any) as Promise<T>;
  }
}

export const fetchCache = new FetchCache<any>();
