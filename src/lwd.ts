/*!
 * Copyright (C) 2018  Zachary Kohnen (DusterTheFirst)
 */

import { EventEmitter } from "events";
import { AuthenticationInvalidError, AuthenticationRequiredError, GuildInviteExpiredError, MissingScopesError } from "./Errors";
import { Guild, IGuild } from "./Guild";
import { IUser, User } from "./User";
import { parseHash } from "./Util";

interface IOptions {
    /** Should the user's auth information be cached? (default: true) */
    cache?: boolean;
    /** The ID of the client */
    clientID: string;
    /** The scopes for the client */
    scopes: Scope[];
    /** The redirect url for the client */
    redirect_url?: string;
}

interface IAuth {
    /** User's access token */
    access_token: string;
    /** Interval the token is valid for */
    expires_in: number;
    /** Scopes of the token */
    scopes: Scope[];
    /** State */
    state: string;
    /** Token type */
    token_type: "Bearer";
    /** Time of auth */
    atime: number;
}

enum Scope {
    /** Allows access to linked third-party accounts */
    Connections = "connections",
    /** Allows you to fetch the user ***with*** an email */
    Email = "email",
    /** Allows you to fetch the user ***without*** an email */
    Identify = "identify",
    /** Allows you to fetch the user's guilds */
    Guilds = "guilds",
    /** Allows your app to add users to a guild */
    GuildsJoin = "guilds.join",
}

enum State {
    /** No auth token stored */
    LoggedOut,
    /** Auth token is stored */
    LoggedIn,
    /** Authorising */
    LoggingIn
}

// tslint:disable-next-line:interface-name
export default interface LoginWithDiscord {
    addListener(event: "login" | "logout", listener: () => void): this;
    on(event: "login" |"logout", listener: () => void): this;

    removeAllListeners(event?: "login" | "logout"): this;

    emit(event: "login" | "logout"): boolean;

    eventNames(): ["login", "logout"];
}
export default class LoginWithDiscord extends EventEmitter {
    /** Options */
    private options: IOptions;

    /** Authorisation */
    private auth?: IAuth;

    /** Login state */
    private state: State = State.LoggedOut;

    // tslint:disable-next-line:no-empty
    private _onlogin: Function = () => { };
    // tslint:disable-next-line:no-empty
    private _onlogout: Function = () => { };

    set onlogin(_: Function) {
        if (_ instanceof Function) {
            this._onlogin = _;
        }
        else {
            throw new Error("Event handlers must be callable");
        }
    }
    set onlogout(_: Function) {
        if (_ instanceof Function) {
            this._onlogout = _;
        }
        else {
            throw new Error("Event handlers must be callable");
        }
    }

    /** Create a loginer */
    constructor(options: IOptions) {
        super();
        this.options = options;

        //  SET DEFAULTS
        this.options.cache = options.cache || true;
        this.options.redirect_url = options.redirect_url || window.location.href;

        for (let scope of options.scopes) {
            if (!Object.values(Scope).includes(scope)) {
                throw new TypeError(`'${scope}' is not a supported scope`);
            }
        }

        this.auth = this.getAuth();

        if (Object.keys(parseHash(window)).includes("access_token")) {
            let parsed = parseHash(window);
            this.setAuth({
                access_token: parsed.access_token,
                atime: Date.now(),
                expires_in: parseInt(parsed.expires_in, 10),
                scopes: parsed.scope.split("+") as Scope[],
                state: parsed.state,
                token_type: parsed.token_type as "Bearer",
            });
        }

        window.addEventListener("load", () => this.init());
    }

    private init() {
        if (this.auth && (Date.now() < (this.auth.atime * 10e3) + this.auth.expires_in)) {
            if (this._onlogin) { this._onlogin(); }
        } else {
            if (this._onlogout) { this._onlogout(); }
            this.clearAuth();
        }
    }

    /** Login to the Discord API */
    public async login(): Promise<void> {
        // FIXME:
        if (this.getAuth()) {
            if (this._onlogin) { this._onlogin(); }
            return;
        }

        this.state = State.LoggingIn;

        let url = `https://discordapp.com/oauth2/authorize?response_type=token&client_id=${this.options.clientID}&scope=${this.options.scopes.join("+")}&redirect_uri=${this.options.redirect_url}`;

        let popout = window.open(url, "LWD-login", "width=400,height=600");
        if (popout === null) {
            return;
        }
        popout.focus();
        let waiter = setInterval(() => {
            if (popout === null) {
                return;
            }
            try {
                // tslint:disable-next-line:no-unused-expression
                popout.location.hash;
            } catch {
                return;
            }

            if (popout.location.hash && location.origin === popout.location.origin) {
                clearInterval(waiter);
                popout.close();
                let parsed = parseHash(popout);
                this.setAuth({
                    access_token: parsed.access_token,
                    atime: Date.now(),
                    expires_in: parseInt(parsed.expires_in, 10),
                    scopes: parsed.scope.split("+") as Scope[],
                    state: parsed.state,
                    token_type: parsed.token_type as "Bearer",
                });
                this.state = State.LoggedIn;
                if (this._onlogin) { this._onlogin(); }
                return;
            }
            if (popout.location.search && location.origin === popout.location.origin) {
                clearInterval(waiter);
                popout.close();
                this.state = State.LoggedOut;
                throw new AuthenticationInvalidError();
            }
        }, 100);
    }
    public logout() {
        if (this._onlogout) { this._onlogout(); }

        this.clearAuth();
    }

    /** Fetch the current user */
    public async fetchUser(): Promise<User> {
        if (!this.auth) {
            throw new AuthenticationRequiredError();
        }
        if (!(this.auth.scopes.includes(Scope.Identify) || this.auth.scopes.includes(Scope.Email))) {
            throw new MissingScopesError("Identify", "Email");
        }
        let response = await fetch(`https://discordapp.com/api/v6/users/@me`, {
            headers: {
                Authorization: `${this.auth.token_type} ${this.auth.access_token}`
            }
        });
        let user: IUser = await response.json();

        return new User(user);
    }

    /** Fetch the users connections */
    public async fetchConnections(): Promise<IConnection[]> {
        if (!this.auth) {
            throw new AuthenticationRequiredError();
        }
        if (!(this.auth.scopes.includes(Scope.Connections))) {
            throw new MissingScopesError("Connections");
        }
        let response = await fetch("https://discordapp.com/api/v6/users/@me/connections", {
            headers: {
                Authorization: `${this.auth.token_type} ${this.auth.access_token}`
            }
        });
        if (!response.ok) {
            throw new AuthenticationInvalidError();
        }
        return response.json();
    }

    /** Fetch the current users guilds */
    public async fetchGuilds(): Promise<Guild[]> {
        if (!this.auth) {
            throw new AuthenticationRequiredError();
        }
        if (!(this.auth.scopes.includes(Scope.Guilds))) {
            throw new MissingScopesError("Guilds");
        }
        let response = await fetch(`https://discordapp.com/api/v6/users/@me/guilds`, {
            headers: {
                Authorization: `${this.auth.token_type} ${this.auth.access_token}`
            }
        });
        if (!response.ok) {
            throw new AuthenticationInvalidError();
        }
        let guilds: IGuild[] = await response.json();
        return guilds.map(x => new Guild(x));
    }

    /** Join the user into a guild */
    public async joinGuild(inviteID: string): Promise<void> {
        if (!this.auth) {
            throw new AuthenticationRequiredError();
        }
        if (!(this.auth.scopes.includes(Scope.GuildsJoin))) {
            throw new MissingScopesError("GuildsJoin");
        }
        let response = await fetch(`https://discordapp.com/api/v6/invites/${inviteID}`, {
            headers: {
                Authorization: `${this.auth.token_type} ${this.auth.access_token}`
            },
            method: "POST"
        });
        if (!response.ok) {
            throw new GuildInviteExpiredError();
        }
        /*
        if (!response.ok) {
            throw new AuthenticationInvalidError();
        }
        */
    }

    private setAuth(auth: IAuth): void {
        this.auth = auth;
        if (this.options.cache) {
            window.localStorage.setItem("LWD", JSON.stringify(auth));
        }
    }
    private clearAuth(): void {
        this.auth = undefined;
        if (this.options.cache) {
            window.localStorage.removeItem("LWD");
        }
    }
    private getAuth(): IAuth | undefined {
        if (this.options.cache) {
            if (window.localStorage.getItem("LWD")) {
                return JSON.parse(window.localStorage.getItem("LWD") || "");
            }
            else {
                return undefined;
            }
        } else {
            return this.auth;
        }
    }
}