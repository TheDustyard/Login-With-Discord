class LoginWithDiscord {
    /** Options */
    private options: IOptions;

    /** Authorisation */
    private auth: IAuth;

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

        if (Object.keys(Util.parseHash(window)).includes("access_token")) {
            let parsed = Util.parseHash(window);
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
        return new Promise<void>((resolve, reject) => {
            if (this.getAuth()) {
                resolve();

                if (this._onlogin) { this._onlogin(); }
                return;
            }

            this.state = State.LoggingIn;

            let url = `https://discordapp.com/oauth2/authorize?response_type=token&client_id=${this.options.clientID}&scope=${this.options.scopes.join("+")}&redirect_uri=${this.options.redirect_url}`;

            let popout = window.open(url, "LWD-login", "width=400,height=600");
            popout.focus();
            let waiter = setInterval(() => {
                try {
                    // tslint:disable-next-line:no-unused-expression
                    popout.location.hash;
                } catch {
                    return;
                }

                if (popout.location.hash && location.origin === popout.location.origin) {
                    clearInterval(waiter);
                    popout.close();
                    let parsed = Util.parseHash(popout);
                    this.setAuth({
                        access_token: parsed.access_token,
                        atime: Date.now(),
                        expires_in: parseInt(parsed.expires_in, 10),
                        scopes: parsed.scope.split("+") as Scope[],
                        state: parsed.state,
                        token_type: parsed.token_type as "Bearer",
                    });
                    this.state = State.LoggedIn;
                    resolve();
                    if (this._onlogin) { this._onlogin(); }
                    return;
                }
                if (popout.location.search && location.origin === popout.location.origin) {
                    clearInterval(waiter);
                    popout.close();
                    this.state = State.LoggedOut;
                    reject("Access Denied: Could not log in user");
                    return;
                }
            }, 100);
        });
    }
    public logout() {
        if (this._onlogout) { this._onlogout(); }

        this.clearAuth();
    }

    public async fetchUser(): Promise<IUser> {
        return new Promise<IUser>((resolve, reject) => {
            if (!this.auth) {
                reject("You must login first");
                return;
            }
            if (!(this.auth.scopes.includes(Scope.Identify) || this.auth.scopes.includes(Scope.Email))) {
                reject(`You must have the scope 'Identify' or 'Email' to use 'fetchUser'`);
                return;
            }
            Util.requestJSON<IUser>("GET", `https://discordapp.com/api/v6/users/@me`, {
                Authorization: `${this.auth.token_type} ${this.auth.access_token}`
            }).then((user) => {
                resolve({
                    avatar: user.avatar,
                    avatarGIFURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.gif`,
                    avatarURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
                    discriminator: user.discriminator,
                    email: user.email,
                    id: user.id,
                    mention: `<@${user.id}>`,
                    mfa_enabled: user.mfa_enabled,
                    tag: `${user.username}#${user.discriminator}`,
                    username: user.username,
                });
            }).catch(reject);
        });
    }
    public async fetchConnections(): Promise<IConnection[]> {
        return new Promise<IConnection[]>((resolve, reject) => {
            if (!this.auth) {
                reject("You must login first");
                return;
            }
            if (!(this.auth.scopes.includes(Scope.Connections))) {
                reject(`You must have the scope 'Connections' to use 'fetchConnections'`);
                return;
            }
            Util.requestJSON<IConnection[]>("GET", `https://discordapp.com/api/v6/users/@me/connections`, {
                Authorization: `${this.auth.token_type} ${this.auth.access_token}`
            }).then((connections) => {
                resolve(connections);
            }).catch(reject);
        });
    }
    public async fetchGuilds(): Promise<IGuild[]> {
        return new Promise<IGuild[]>((resolve, reject) => {
            if (!this.auth) {
                reject("You must login first");
                return;
            }
            if (!(this.auth.scopes.includes(Scope.Guilds))) {
                reject(`You must have the scope 'Guilds' to use 'fetchGuilds'`);
                return;
            }
            Util.requestJSON<IRawGuild[]>("GET", `https://discordapp.com/api/v6/users/@me/guilds`, {
                Authorization: `${this.auth.token_type} ${this.auth.access_token}`
            }).then((guilds) => {
                resolve(guilds.map(x => {
                    return {
                        icon: x.icon,
                        iconURL: x.icon ? `https://cdn.discordapp.com/icons/${x.id}/${x.icon}.png` : null,
                        id: x.id,
                        name: x.name,
                        owner: x.owner,
                        permissions: new Permissions(x.permissions)
                    };
                }));
            }).catch(reject);
        });
    }
    public async joinGuild(inviteID: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!this.auth) {
                reject("You must login first");
                return;
            }
            if (!(this.auth.scopes.includes(Scope.GuildsJoin))) {
                reject(`You must have the scope 'GuildsJoin' to use 'joinGuild'`);
                return;
            }
            Util.requestJSON<null>("POST", `https://discordapp.com/api/v6/invites/${inviteID}`, {
                Authorization: `${this.auth.token_type} ${this.auth.access_token}`
            }).then(resolve).catch(() => reject("Invalid invite"));
        });
    }

    private setAuth(auth: IAuth): void {
        this.auth = auth;
        if (this.options.cache) {
            window.localStorage.setItem("LWD", JSON.stringify(auth));
        }
    }
    private clearAuth(): void {
        this.auth = null;
        if (this.options.cache) {
            window.localStorage.removeItem("LWD");
        }
    }
    private getAuth(): IAuth {
        if (this.options.cache) {
            if (window.localStorage.getItem("LWD")) {
                return JSON.parse(window.localStorage.getItem("LWD"));
            }
            else {
                return null;
            }
        } else {
            return this.auth;
        }
    }
}