import React, { type ReactNode } from 'react';
import { type ClientOptions, type Exchange } from '@urql/next';
interface UrqlWrapperProps extends Partial<ClientOptions> {
    url: string;
    isLoggedIn: boolean;
    cookie?: string | null;
    children: ReactNode;
    cacheExchange?: Exchange;
    nonce?: string;
}
export declare function UrqlWrapper(props: UrqlWrapperProps): React.JSX.Element;
export {};
