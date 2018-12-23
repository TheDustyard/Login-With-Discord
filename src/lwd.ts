/*!
 * Copyright (C) 2018  Zachary Kohnen (DusterTheFirst)
 */

import { EventEmitter } from "events";
import { Auth, IAuthResponse, IStorageAuth } from "./Auth";
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

export enum Scope {
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
    on(event: "login" | "logout", listener: () => void): this;

    removeAllListeners(event?: "login" | "logout"): this;

    emit(event: "login" | "logout"): boolean;

    eventNames(): ["login", "logout"];
}
export default class LoginWithDiscord extends EventEmitter {
    /** Options */
    private readonly options: IOptions;

    /** Authorisation */
    private auth?: Auth;

    /** Login state */
    private state: State = State.LoggedOut;

    /** Create a loginer */
    constructor(options: IOptions) {
        super();
        this.options = options;

        //  SET DEFAULTS
        this.options.cache = options.cache === undefined ? true : options.cache;
        this.options.redirect_url = options.redirect_url === undefined ? window.location.href : options.redirect_url;

        for (let scope of options.scopes) {
            if (!Object.values(Scope).includes(scope)) {
                throw new TypeError(`'${scope}' is not a supported scope`);
            }
        }

        this.auth = this.getAuth();

        let parsed = parseHash<IAuthResponse>(window);

        if (Object.keys(parsed).includes("access_token")) {
            this.setAuth(new Auth(parsed));
        }

        window.addEventListener("load", () => this.init());
    }

    private init() {
        if (this.auth !== undefined && this.auth.expired) {
            this.emit("logout");
            this.clearAuth();
        } else {
            this.emit("login");
        }
    }

    /** Login to the Discord API */
    public async login(): Promise<void> {
        // FIXME:
        if (this.getAuth() !== undefined) {
            this.emit("login");
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

            if (location.origin === popout.location.origin) {
                clearInterval(waiter);
                popout.close();
                let parsed = parseHash<IAuthResponse>(popout);
                this.setAuth(new Auth(parsed));
                this.state = State.LoggedIn;
                this.emit("login");
                return;
            }
            if (location.origin === popout.location.origin) {
                clearInterval(waiter);
                popout.close();
                this.state = State.LoggedOut;
                throw new AuthenticationInvalidError();
            }
        }, 100);
    }
    public logout() {
        this.emit("logout");

        this.clearAuth();
    }

    /** Fetch the current user */
    public async fetchUser(): Promise<User> {
        if (this.auth === undefined) {
            throw new AuthenticationRequiredError();
        }
        if (!(this.auth.scopes.includes(Scope.Identify) || this.auth.scopes.includes(Scope.Email))) {
            throw new MissingScopesError("Identify", "Email");
        }
        let response = await fetch(`https://discordapp.com/api/v6/users/@me`, {
            headers: {
                Authorization: `${this.auth.tokenType} ${this.auth.accessToken}`
            }
        });
        let user = await response.json() as IUser;

        return new User(user);
    }

    /** Fetch the users connections */
    public async fetchConnections(): Promise<IConnection[]> {
        if (this.auth === undefined) {
            throw new AuthenticationRequiredError();
        }
        if (!(this.auth.scopes.includes(Scope.Connections))) {
            throw new MissingScopesError("Connections");
        }
        let response = await fetch("https://discordapp.com/api/v6/users/@me/connections", {
            headers: {
                Authorization: `${this.auth.tokenType} ${this.auth.accessToken}`
            }
        });
        if (!response.ok) {
            throw new AuthenticationInvalidError();
        }
        return response.json();
    }

    /** Fetch the current users guilds */
    public async fetchGuilds(): Promise<Guild[]> {
        if (this.auth === undefined) {
            throw new AuthenticationRequiredError();
        }
        if (!(this.auth.scopes.includes(Scope.Guilds))) {
            throw new MissingScopesError("Guilds");
        }
        let response = await fetch(`https://discordapp.com/api/v6/users/@me/guilds`, {
            headers: {
                Authorization: `${this.auth.tokenType} ${this.auth.accessToken}`
            }
        });
        if (!response.ok) {
            throw new AuthenticationInvalidError();
        }
        let guilds = await response.json() as IGuild[];
        return guilds.map(x => new Guild(x));
    }

    /** Join the user into a guild */
    public async joinGuild(inviteID: string): Promise<void> {
        if (this.auth === undefined) {
            throw new AuthenticationRequiredError();
        }
        if (!(this.auth.scopes.includes(Scope.GuildsJoin))) {
            throw new MissingScopesError("GuildsJoin");
        }
        let response = await fetch(`https://discordapp.com/api/v6/invites/${inviteID}`, {
            headers: {
                Authorization: `${this.auth.tokenType} ${this.auth.accessToken}`
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

    private setAuth(auth: Auth): void {
        this.auth = auth;
        if (this.options.cache !== undefined && this.options.cache) {
            window.localStorage.setItem("LWD", auth.toJSON());
        }
    }
    private clearAuth(): void {
        this.auth = undefined;
        if (this.options.cache !== undefined && this.options.cache) {
            window.localStorage.removeItem("LWD");
        }
    }
    private getAuth(): Auth | undefined {
        if (this.options.cache !== undefined && this.options.cache) {
            let cache = window.localStorage.getItem("LWD");
            if (cache !== null) {
                return new Auth(JSON.parse(cache) as IStorageAuth);
            }
            else {
                return undefined;
            }
        } else {
            return this.auth;
        }
    }
}