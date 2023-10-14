import { type Exchange } from '@urql/core';
import { type Cache, type CacheExchangeOpts } from '@urql/exchange-graphcache';
export interface CacheExchangeOptions extends CacheExchangeOpts {
}
export declare function createCacheExchange(options: CacheExchangeOptions): Exchange;
export { type Cache, type Exchange };
