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

interface IUser {
    avatar: string;
    discriminator: string;
    id: string;
    mfa_enabled: boolean;
    username: string;
    email: string;
    avatarURL: string;
    avatarGIFURL: string;
    tag: string;
    mention: string;
}

interface IConnection {
    friend_sync: boolean;
    id: string;
    name: string;
    show_activity: boolean;
    type: string; // ENUM?
    verified: boolean;
    visibility: number;
}

interface IRawGuild {
    icon: string;
    id: string;
    name: string;
    owner: boolean;
    permissions: number;
}

interface IGuild {
    icon?: string;
    iconURL?: string;
    id: string;
    name: string;
    owner: boolean;
    permissions: Permissions;
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