import { type YogaServerInstance, type YogaServerOptions } from 'graphql-yoga';
export interface YogaConfiguration<TUser> extends YogaServerOptions<any, any> {
    logError?: (message: string) => void;
    handleCreateOrGetUser?: (req: Request) => Promise<TUser | null>;
}
export declare function makeServer<TUser = unknown>(config: YogaConfiguration<TUser>): YogaServerInstance<Record<string, any>, {
    currentUser: TUser;
}>;