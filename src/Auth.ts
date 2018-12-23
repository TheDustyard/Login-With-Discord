/*!
 * Copyright (C) 2018  Zachary Kohnen (DusterTheFirst)
 */

import { Scope } from "./lwd";

export interface IAuthResponse extends Record<string, string> {
    /** User's access token */
    access_token: string;
    /** Interval the token is valid for */
    expires_in: string;
    /** Scopes of the token */
    scopes: string;
    /** State */
    state: string;
    /** Token type */
    token_type: "Bearer";
}

export function isResponseAuth(auth: IStorageAuth | IAuthResponse): auth is IAuthResponse {
    return "access_token" in auth;
}

export interface IStorageAuth {
    /** User's access token */
    accessToken: string;
    /** Interval the token is valid for */
    expiresIn: number;
    /** Scopes of the token */
    scopes: Scope[];
    /** State */
    state: string;
    /** Token type */
    tokenType: "Bearer";
    /** Time of auth */
    atime: number;
}

export class Auth implements IStorageAuth {
    /** User's access token */
    public accessToken: string;
    /** Interval the token is valid for */
    public expiresIn: number;
    /** Scopes of the token */
    public scopes: Scope[];
    /** State */
    public state: string;
    /** Token type */
    public tokenType: "Bearer";
    /** Time of auth */
    public atime: number;

    constructor(auth: IAuthResponse | IStorageAuth) {
        if (isResponseAuth(auth)) {
            this.accessToken = auth.access_token;
            this.expiresIn = parseInt(auth.expires_in, 10);
            this.scopes = auth.scopes.split("+") as Scope[];
            this.state = auth.state;
            this.tokenType = auth.token_type;
        } else {
            this.accessToken = auth.accessToken;
            this.expiresIn = auth.expiresIn;
            this.scopes = auth.scopes;
            this.state = auth.state;
            this.tokenType = auth.tokenType;
        }

        this.atime = Date.now();
    }

    public get expired() {
        return this.atime + this.expiresIn * 1000 < Date.now();
    }

    public toJSON() {
        return JSON.stringify(this);
    }
}
