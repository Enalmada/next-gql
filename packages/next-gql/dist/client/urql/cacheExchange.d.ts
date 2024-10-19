import { type Cache, type CacheExchangeOpts } from "@urql/exchange-graphcache";
import type { Exchange } from "@urql/next";
export type CacheExchangeOptions = CacheExchangeOpts;
export declare function createCacheExchange(options: CacheExchangeOptions): Exchange;
export type { Cache };
