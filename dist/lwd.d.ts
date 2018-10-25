declare class LoginWithDiscord {
    /** Options */
    private options;
    /** Authorisation */
    private auth;
    /** Login state */
    private state;
    private _onlogin;
    private _onlogout;
    onlogin: Function;
    onlogout: Function;
    /** Create a loginer */
    constructor(options: IOptions);
    private init;
    /** Login to the Discord API */
    login(): Promise<void>;
    logout(): void;
    fetchUser(): Promise<IUser>;
    fetchConnections(): Promise<IConnection[]>;
    fetchGuilds(): Promise<IGuild[]>;
    joinGuild(inviteID: string): Promise<void>;
    private setAuth;
    private clearAuth;
    private getAuth;
}
/** Numeric permission flags. */
declare enum Permission {
    /** Create invitations to the guild */
    CREATE_INSTANT_INVITE = 1,
    KICK_MEMBERS = 2,
    BAN_MEMBERS = 4,
    /** Implicitly has *all* permissions, and bypasses all channel overwrites */
    ADMINISTRATOR = 8,
    /** Edit and reorder channels */
    MANAGE_CHANNELS = 16,
    /** Edit the guild information, region, etc. */
    MANAGE_GUILD = 32,
    /** Add new reactions to messages */
    ADD_REACTIONS = 64,
    VIEW_AUDIT_LOG = 128,
    VIEW_CHANNEL = 1024,
    SEND_MESSAGES = 2048,
    SEND_TTS_MESSAGES = 4096,
    /** Delete messages and reactions */
    MANAGE_MESSAGES = 8192,
    /** Links posted will have a preview embedded */
    EMBED_LINKS = 16384,
    ATTACH_FILES = 32768,
    /** View messages that were posted prior to opening Discord */
    READ_MESSAGE_HISTORY = 65536,
    MENTION_EVERYONE = 131072,
    /** Use emojis from different guilds */
    USE_EXTERNAL_EMOJIS = 262144,
    /** Connect to a voice channel */
    CONNECT = 1048576,
    /** Speak in a voice channel */
    SPEAK = 2097152,
    /** Mute members across all voice channels */
    MUTE_MEMBERS = 4194304,
    /** Deafen members across all voice channels */
    DEAFEN_MEMBERS = 8388608,
    /** Move members between voice channels */
    MOVE_MEMBERS = 16777216,
    /** Use voice activity detection */
    USE_VAD = 33554432,
    CHANGE_NICKNAME = 67108864,
    /** Change other members' nicknames */
    MANAGE_NICKNAMES = 134217728,
    MANAGE_ROLES = 268435456,
    MANAGE_WEBHOOKS = 536870912,
    MANAGE_EMOJIS = 1073741824
}
/**
 * Data that can be resolved to give a permission number. This can be:
 * * A string
 * * A permission number
 * * An instance of Permissions
 */
declare type PermissionResolvable = string | number | Permission;
declare class Permissions {
    /**
     * Bitfield of the packed permissions
     */
    bitfield: number;
    constructor(permissions: number);
    /**
     * Checks whether the bitfield has a permission, or multiple permissions.
     * @param permission Permission(s) to check for
     * @param checkAdmin Whether to allow the administrator permission to override
     */
    has(permission: PermissionResolvable | PermissionResolvable[], checkAdmin?: boolean): boolean;
    /**
     * Resolves permissions to their numeric form.
     * @param  permission - Permission(s) to resolve
     */
    static resolve(permission: unknown | PermissionResolvable): number;
    /**
     * Bitfield representing the default permissions for users
     */
    static DEFAULT: number;
}
interface INameToValueMap<T> {
    [key: string]: T;
}
declare namespace Util {
    interface IStringObject {
        [x: string]: string;
    }
    /**
     * parse GET params from url hash
     */
    function parseHash(w?: Window): IStringObject;
    type Method = "GET" | "POST" | "PUT";
    function request(method: Method, url: string, headers?: IStringObject): Promise<string>;
    function requestJSON<T>(method: Method, url: string, headers?: IStringObject): Promise<T>;
}
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
    type: string;
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
declare enum Scope {
    /** Allows access to linked third-party accounts */
    Connections = "connections",
    /** Allows you to fetch the user ***with*** an email */
    Email = "email",
    /** Allows you to fetch the user ***without*** an email */
    Identify = "identify",
    /** Allows you to fetch the user's guilds */
    Guilds = "guilds",
    /** Allows your app to add users to a guild */
    GuildsJoin = "guilds.join"
}
declare enum State {
    /** No auth token stored */
    LoggedOut = 0,
    /** Auth token is stored */
    LoggedIn = 1,
    /** Authorising */
    LoggingIn = 2
}
