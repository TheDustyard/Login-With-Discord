interface LWDOptions {
    /** Should the user's auth information be cached? (default: true) */
    cache?: boolean;
}

interface User {
    avatar: string;
    discriminator: string;
    id: string;
    mfa_enabled: boolean;
    username: string;
    email: string;
    avatarURL: string;
    tag: string;
    mention: string;
}

interface Connection {
    friend_sync: boolean;
    id: string;
    name: string;
    show_activity: boolean;
    type: string; //ENUM?
    verified: boolean;
    visibility: number;
}

interface Guild {
    icon: string;
    iconURL: string;
    id: string;
    name: string;
    owner: boolean;
    permissions: Permissions;
}

interface Auth {
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
}

enum State {
    /** No auth token stored */
    LoggedOut,
    /** Auth token is stored */
    LoggedIn,
    /** Authorising */
    LoggingIn
}