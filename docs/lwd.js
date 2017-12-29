class LoginWithDiscord {
    /** Create a loginer */
    constructor(options) {
        /** Login state */
        this.state = State.LoggedOut;
        this._onlogin = () => { };
        this._onlogout = () => { };
        this.options = options;
        //  SET DEFAULTS
        this.options.cache = options.cache || true;
        this.auth = this.getAuth();
        if (Object.keys(Util.parseHash(window)).includes('access_token')) {
            let parsed = Util.parseHash(window);
            this.setAuth({
                access_token: parsed.access_token,
                expires_in: parseInt(parsed.expires_in),
                scopes: parsed.scope.split('+'),
                state: parsed.state,
                token_type: parsed.token_type,
                atime: Date.now()
            });
        }
    }
    set onlogin(_) {
        if (_ instanceof Function)
            this._onlogin = _;
        else
            throw "Event handlers must be callable";
    }
    set onlogout(_) {
        if (_ instanceof Function)
            this._onlogout = _;
        else
            throw "Event handlers must be callable";
    }
    async init() {
        if (this.auth && ((this.auth.expires_in * 10e3) + Date.now()) > this.auth.atime) {
            this._onlogin();
        }
        else {
            this._onlogout();
            this.clearAuth();
        }
    }
    /** Login to the Discord API */
    async login(clientID, ...scopes) {
        return new Promise((resolve, reject) => {
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
            let url = `https://discordapp.com/oauth2/authorize?response_type=token&client_id=${clientID}&scope=${scopes.join('+')}&redirect_uri=${window.location.origin}${window.location.pathname}`;
            let popout = window.open(url, 'LWD-login', `width=400,height=600`);
            popout.focus();
            let waiter = setInterval(() => {
                try {
                    popout.location.hash;
                }
                catch (e) {
                    return;
                }
                if (popout.location.hash && location.origin === popout.location.origin) {
                    clearInterval(waiter);
                    popout.close();
                    let parsed = Util.parseHash(popout);
                    this.setAuth({
                        access_token: parsed.access_token,
                        expires_in: parseInt(parsed.expires_in),
                        scopes: parsed.scope.split('+'),
                        state: parsed.state,
                        token_type: parsed.token_type,
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
    async logout() {
        this._onlogout();
        return new Promise(() => this.clearAuth());
    }
    async fetchUser() {
        return new Promise((resolve, reject) => {
            if (!this.auth) {
                reject('You must login first');
                return;
            }
            if (!(this.auth.scopes.includes(Scope.Identify) || this.auth.scopes.includes(Scope.Email))) {
                reject(`You must have the scope 'Identify' or 'Email' to use 'fetchUser'`);
                return;
            }
            Util.requestJSON('GET', `https://discordapp.com/api/v6/users/@me`, {
                Authorization: `${this.auth.token_type} ${this.auth.access_token}`
            }).then((user) => {
                resolve({
                    avatar: user.avatar,
                    avatarURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
                    avatarGIFURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.gif`,
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
    async fetchConnections() {
        return new Promise((resolve, reject) => {
            if (!this.auth) {
                reject('You must login first');
                return;
            }
            if (!(this.auth.scopes.includes(Scope.Connections))) {
                reject(`You must have the scope 'Connections' to use 'fetchConnections'`);
                return;
            }
            Util.requestJSON('GET', `https://discordapp.com/api/v6/users/@me/connections`, {
                Authorization: `${this.auth.token_type} ${this.auth.access_token}`
            }).then((connections) => {
                resolve(connections);
            }).catch(reject);
        });
    }
    async fetchGuilds() {
        return new Promise((resolve, reject) => {
            if (!this.auth) {
                reject('You must login first');
                return;
            }
            if (!(this.auth.scopes.includes(Scope.Guilds))) {
                reject(`You must have the scope 'Guilds' to use 'fetchGuilds'`);
                return;
            }
            Util.requestJSON('GET', `https://discordapp.com/api/v6/users/@me/guilds`, {
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
                    };
                }));
            }).catch(reject);
        });
    }
    async joinGuild(inviteID) {
        return new Promise((resolve, reject) => {
            if (!this.auth) {
                reject('You must login first');
                return;
            }
            if (!(this.auth.scopes.includes(Scope.GuildsJoin))) {
                reject(`You must have the scope 'GuildsJoin' to use 'joinGuild'`);
                return;
            }
            Util.requestJSON('POST', `https://discordapp.com/api/v6/invites/${inviteID}`, {
                Authorization: `${this.auth.token_type} ${this.auth.access_token}`
            }).then((data) => {
                resolve();
            }).catch(() => reject('Invalid invite'));
        });
    }
    setAuth(auth) {
        this.auth = auth;
        if (this.options.cache)
            window.localStorage.setItem('LWD', JSON.stringify(auth));
    }
    clearAuth() {
        this.auth = null;
        if (this.options.cache)
            window.localStorage.removeItem('LWD');
    }
    getAuth() {
        if (this.options.cache) {
            if (window.localStorage.getItem('LWD'))
                return JSON.parse(window.localStorage.getItem('LWD'));
            else
                return null;
        }
        else {
            return this.auth;
        }
    }
}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                 ADAPTED FROM                                *
 * https://github.com/hydrabolt/discord.js/blob/master/src/util/Permissions.js *
 *                                                                             *
 *          THANK YOU TO HYDRABOLT AND THE CONTRIBUTORS OF DISCORD.JS          *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                Apache License                               *
 *                          Version 2.0, January 2004                          *
 *                       http://www.apache.org/licenses/                       *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/** Numeric permission flags. */
var Permission;
(function (Permission) {
    /** Create invitations to the guild */
    Permission[Permission["CREATE_INSTANT_INVITE"] = 1] = "CREATE_INSTANT_INVITE";
    Permission[Permission["KICK_MEMBERS"] = 2] = "KICK_MEMBERS";
    Permission[Permission["BAN_MEMBERS"] = 4] = "BAN_MEMBERS";
    /** Implicitly has *all* permissions, and bypasses all channel overwrites */
    Permission[Permission["ADMINISTRATOR"] = 8] = "ADMINISTRATOR";
    /** Edit and reorder channels */
    Permission[Permission["MANAGE_CHANNELS"] = 16] = "MANAGE_CHANNELS";
    /** Edit the guild information, region, etc. */
    Permission[Permission["MANAGE_GUILD"] = 32] = "MANAGE_GUILD";
    /** Add new reactions to messages */
    Permission[Permission["ADD_REACTIONS"] = 64] = "ADD_REACTIONS";
    Permission[Permission["VIEW_AUDIT_LOG"] = 128] = "VIEW_AUDIT_LOG";
    Permission[Permission["VIEW_CHANNEL"] = 1024] = "VIEW_CHANNEL";
    Permission[Permission["SEND_MESSAGES"] = 2048] = "SEND_MESSAGES";
    Permission[Permission["SEND_TTS_MESSAGES"] = 4096] = "SEND_TTS_MESSAGES";
    /** Delete messages and reactions */
    Permission[Permission["MANAGE_MESSAGES"] = 8192] = "MANAGE_MESSAGES";
    /** Links posted will have a preview embedded */
    Permission[Permission["EMBED_LINKS"] = 16384] = "EMBED_LINKS";
    Permission[Permission["ATTACH_FILES"] = 32768] = "ATTACH_FILES";
    /** View messages that were posted prior to opening Discord */
    Permission[Permission["READ_MESSAGE_HISTORY"] = 65536] = "READ_MESSAGE_HISTORY";
    Permission[Permission["MENTION_EVERYONE"] = 131072] = "MENTION_EVERYONE";
    /** Use emojis from different guilds */
    Permission[Permission["USE_EXTERNAL_EMOJIS"] = 262144] = "USE_EXTERNAL_EMOJIS";
    /** Connect to a voice channel */
    Permission[Permission["CONNECT"] = 1048576] = "CONNECT";
    /** Speak in a voice channel */
    Permission[Permission["SPEAK"] = 2097152] = "SPEAK";
    /** Mute members across all voice channels */
    Permission[Permission["MUTE_MEMBERS"] = 4194304] = "MUTE_MEMBERS";
    /** Deafen members across all voice channels */
    Permission[Permission["DEAFEN_MEMBERS"] = 8388608] = "DEAFEN_MEMBERS";
    /** Move members between voice channels */
    Permission[Permission["MOVE_MEMBERS"] = 16777216] = "MOVE_MEMBERS";
    /** Use voice activity detection */
    Permission[Permission["USE_VAD"] = 33554432] = "USE_VAD";
    Permission[Permission["CHANGE_NICKNAME"] = 67108864] = "CHANGE_NICKNAME";
    /** Change other members' nicknames */
    Permission[Permission["MANAGE_NICKNAMES"] = 134217728] = "MANAGE_NICKNAMES";
    Permission[Permission["MANAGE_ROLES"] = 268435456] = "MANAGE_ROLES";
    Permission[Permission["MANAGE_WEBHOOKS"] = 536870912] = "MANAGE_WEBHOOKS";
    Permission[Permission["MANAGE_EMOJIS"] = 1073741824] = "MANAGE_EMOJIS";
})(Permission || (Permission = {}));
class Permissions {
    constructor(permissions) {
        this.bitfield = permissions;
    }
    /**
     * Checks whether the bitfield has a permission, or multiple permissions.
     * @param permission Permission(s) to check for
     * @param checkAdmin Whether to allow the administrator permission to override
     */
    has(permission, checkAdmin = true) {
        if (permission instanceof Array)
            return permission.every(p => this.has(p, checkAdmin));
        permission = Permissions.resolve(permission);
        if (checkAdmin && (this.bitfield & Permission.ADMINISTRATOR) > 0)
            return true;
        return (this.bitfield & permission) === permission;
    }
    /**
     * Resolves permissions to their numeric form.
     * @param  permission - Permission(s) to resolve
     */
    static resolve(permission) {
        if (typeof permission === 'number' && permission >= 0)
            return permission;
        if (permission instanceof Permissions)
            return permission.bitfield;
        if (permission instanceof Array)
            return permission.map((p) => this.resolve(p)).reduce((prev, p) => prev | p, 0);
        if (typeof permission === 'string')
            return Permission[permission];
        throw new RangeError('PERMISSIONS_INVALID');
    }
}
/**
 * Bitfield representing the default permissions for users
 * @type {number}
 */
Permissions.DEFAULT = 104324097;
var Scope;
(function (Scope) {
    /** Allows access to linked third-party accounts */
    Scope["Connections"] = "connections";
    /** Allows you to fetch the user ***with*** an email */
    Scope["Email"] = "email";
    /** Allows you to fetch the user ***without*** an email */
    Scope["Identify"] = "identify";
    /** Allows you to fetch the user's guilds */
    Scope["Guilds"] = "guilds";
    /** Allows your app to add users to a guild */
    Scope["GuildsJoin"] = "guilds.join";
    //#region OUT OF SCOPE
    // /** Allows your app to add users to a group dm */
    // GdmJoin = "gdm.join",
    // /** For local rpc server api access, this allows you to read messages from all client channels (otherwise restricted to channels/guilds your app creates) */
    // MessagesRead = "messages.read",
    // /** For local rpc server access, this allows you to control a user's local Discord client */
    // RPC = "rpc",
    // /** For local rpc server api access, this allows you to access the API as the local user */
    // RPCAPI = "rpc.api",
    // /** For local rpc server api access, this allows you to receive notifications pushed out to the user */
    // RPCNotificationsRead = "rpc.notifications.read" 
    //#endregion
})(Scope || (Scope = {}));
var State;
(function (State) {
    /** No auth token stored */
    State[State["LoggedOut"] = 0] = "LoggedOut";
    /** Auth token is stored */
    State[State["LoggedIn"] = 1] = "LoggedIn";
    /** Authorising */
    State[State["LoggingIn"] = 2] = "LoggingIn";
})(State || (State = {}));
var Util;
(function (Util) {
    /**
     * parse GET params from url
     */
    function parseHash(w = window) {
        var query = w.location.hash.substr(1);
        var result = {};
        query.split("&").forEach((part) => {
            var item = part.split("=");
            result[item[0]] = decodeURIComponent(item[1]);
        });
        return result;
    }
    Util.parseHash = parseHash;
    function request(method, url, headers = {}) {
        return new Promise((resolve, reject) => {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = () => {
                if (xmlHttp.readyState == 4)
                    if (xmlHttp.status == 200)
                        resolve(xmlHttp.responseText);
                    else
                        reject(`${xmlHttp.status}: ${xmlHttp.statusText}`);
            };
            xmlHttp.open(method, url, true);
            for (let header in headers) {
                xmlHttp.setRequestHeader(header, headers[header]);
            }
            xmlHttp.send();
        });
    }
    Util.request = request;
    function requestJSON(method, url, headers) {
        return new Promise((resolve, reject) => {
            request(method, url, headers).then((data) => {
                resolve(JSON.parse(data));
            }).catch(reject);
        });
    }
    Util.requestJSON = requestJSON;
})(Util || (Util = {}));
