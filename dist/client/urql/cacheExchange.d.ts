import { type Cache, type CacheExchangeOpts } from '@urql/exchange-graphcache';
import { type Exchange } from '@urql/next';
export interface CacheExchangeOptions extends CacheExchangeOpts {
}
export declare function createCacheExchange(options: CacheExchangeOptions): Exchange;
export { type Cache };
