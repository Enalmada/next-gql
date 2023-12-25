import { type ChannelPubSubConfig } from '@graphql-yoga/subscription/typings/create-pub-sub';
import { type PubSub, type YogaServerInstance, type YogaServerOptions } from 'graphql-yoga';
type PubSubPublishArgsByKey = {
    [key: string]: [] | [any] | [number | string, any];
};
export interface YogaContext<TUser, TPubSubChannels extends PubSubPublishArgsByKey> {
    currentUser?: TUser;
    pubSub: PubSub<TPubSubChannels>;
}
export interface YogaConfiguration<TUser = unknown, TPubSubChannels extends PubSubPublishArgsByKey = Record<string, never>> extends YogaServerOptions<any, any> {
    logError?: (message: string) => void;
    handleCreateOrGetUser?: (req: Request) => Promise<TUser | null>;
    pubSubOverride?: PubSub<TPubSubChannels>;
    pubSubConfig?: ChannelPubSubConfig<TPubSubChannels> | undefined;
    graphQLArmorConfig?: any;
}
export declare function makeServer<TUser, TPubSubChannels extends PubSubPublishArgsByKey = Record<string, never>>(config: YogaConfiguration<TUser, TPubSubChannels>): YogaServerInstance<Record<string, any>, YogaContext<TUser, TPubSubChannels>>;
export {};
