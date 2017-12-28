class LoginWithDiscord {
    /** Options */
    options: LWDOptions;

    /** Authorisation */
    auth: Auth;

    /** Login state */
    state: State = State.LoggedOut;

    private _onlogin: Function = () => {};
    private _onlogout: Function = () => {};

    set onlogin(_: Function) {
        if (_ instanceof Function)
            this._onlogin = _;
        else throw "Event handlers must be callable";
    }
    set onlogout(_: Function) {
        if (_ instanceof Function)
            this._onlogout = _;
        else throw "Event handlers must be callable";
    }

    /** Create a loginer */
    constructor(options: LWDOptions) {
        this.options = options;

        //  SET DEFAULTS
        this.options.cache = options.cache || true;

        this.auth = this.getAuth();
    }

    public async init() {
        if (this.auth && ((this.auth.expires_in * 10e3) + Date.now()) > this.auth.atime) {
            this._onlogin();
        } else {
            this._onlogout();
            this.clearAuth();
        }
    }

    /** Login to the Discord API */
    public async login(clientID: string, ...scopes: Scope[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.getAuth()) {
                resolve();
                this._onlogin();
                return;
            }

            this.state = State.LoggingIn;

            for (let scope of scopes) {
                if (!Object.values(Scope).includes(scope)) {
                    reject(`Type Error: '${scope}' is not a supported scope`);
                    return;
                }
            }

            let url: string = `https://discordapp.com/oauth2/authorize?response_type=token&client_id=${clientID}&scope=${scopes.join('+')}&redirect_uri=${window.location.origin}${window.location.pathname}`;

            let popout = window.open(url, 'LWD-login', `width=400,height=600`);
            popout.focus();
            let waiter = setInterval(() => {
                try {
                    popout.location.hash;
                } catch (e) {
                    return;
                }

                if (popout.location.hash && location.origin === popout.location.origin) {
                    clearInterval(waiter);
                    popout.close();
                    let parsed = Util.parseHash(popout);
                    this.setAuth({
                        access_token: parsed.access_token,
                        expires_in: parseInt(parsed.expires_in),
                        scopes: parsed.scope.split('+') as Scope[],
                        state: parsed.state,
                        token_type: parsed.token_type as "Bearer",
                        atime: Date.now()
                    });
                    this.state = State.LoggedIn;
                    resolve();
                    this._onlogin();
                    return;       
                }
                if (popout.location.search && location.origin === popout.location.origin) {
                    clearInterval(waiter);
                    popout.close();
                    this.state = State.LoggedOut;
                    reject('Access Denied: Could not log in user');
                    return;
                }
            }, 100);
        });
    }
    public async logout(): Promise<void> {
        this._onlogout();
        return new Promise<void>(() => this.clearAuth());
    }

    public async fetchUser(): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            if (!this.auth) {
                reject('You must login first');
                return;
            }
            if (!(this.auth.scopes.includes(Scope.Identify) || this.auth.scopes.includes(Scope.Email))) {
                reject(`You must have the scope 'Identify' or 'Email' to use 'fetchUser'`);
                return;
            }
            Util.requestJSON<User>('GET', `https://discordapp.com/api/v6/users/@me`, {
                Authorization: `${this.auth.token_type} ${this.auth.access_token}`
            }).then((user) => {
                resolve({
                    avatar: user.avatar,
                    avatarURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
                    discriminator: user.discriminator,
                    email: user.email,
                    id: user.id,
                    mfa_enabled: user.mfa_enabled,
                    username: user.username,
                    tag: `${user.username}#${user.discriminator}`,
                    mention: `<@${user.id}>`
                });
            }).catch(reject);
        });
    }
    public async fetchConnections(): Promise<Connection[]> {
        return new Promise<Connection[]>((resolve, reject) => {
            if (!this.auth) {
                reject('You must login first');
                return;
            }
            if (!(this.auth.scopes.includes(Scope.Connections))) {
                reject(`You must have the scope 'Connections' to use 'fetchConnections'`);
                return;
            }
            Util.requestJSON<Connection[]>('GET', `https://discordapp.com/api/v6/users/@me/connections`, {
                Authorization: `${this.auth.token_type} ${this.auth.access_token}`
            }).then((connections) => {
                resolve(connections);
            }).catch(reject);
        });
    }
    public async fetchGuilds(): Promise<Guild[]> {
        return new Promise<Guild[]>((resolve, reject) => {
            if (!this.auth) {
                reject('You must login first');
                return;
            }
            if (!(this.auth.scopes.includes(Scope.Guilds))) {
                reject(`You must have the scope 'Guilds' to use 'fetchGuilds'`);
                return;
            }
            Util.requestJSON<any[]>('GET', `https://discordapp.com/api/v6/users/@me/guilds`, {
                Authorization: `${this.auth.token_type} ${this.auth.access_token}`
            }).then((guilds) => {
                resolve(guilds.map(x => {
                    return {
                        icon: x.icon,
                        iconURL: `https://cdn.discordapp.com/icons/${x.id}/${x.icon}.png`,
                        id: x.id,
                        name: x.name,
                        owner: x.owner,
                        permissions: new Permissions(x.permissions)
                    } as Guild;
                }));
            }).catch(reject);
        });
    }
    public async joinGuild(inviteID: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!this.auth) {
                reject('You must login first');
                return;
            }
            if (!(this.auth.scopes.includes(Scope.GuildsJoin))) {
                reject(`You must have the scope 'GuildsJoin' to use 'joinGuild'`);
                return;
            }
            Util.requestJSON<any>('POST', `https://discordapp.com/api/v6/invites/${inviteID}`, {
                Authorization: `${this.auth.token_type} ${this.auth.access_token}`
            }).then((data) => {
                resolve();
            }).catch(() => reject('Invalid invite'));
        });
    }

    private setAuth(auth: Auth): void {
        this.auth = auth;
        if (this.options.cache)
            window.localStorage.setItem('LWD', JSON.stringify(auth));
    }
    private clearAuth(): void {
        this.auth = null;
        if (this.options.cache)
            window.localStorage.removeItem('LWD');
    }
    private getAuth(): Auth {
        if (this.options.cache) {
            if (window.localStorage.getItem('LWD'))
                return JSON.parse(window.localStorage.getItem('LWD'));
            else
                return null;
        } else {
            return this.auth;
        }
    }
}