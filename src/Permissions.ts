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
enum Permission {
    /** Create invitations to the guild */
    CREATE_INSTANT_INVITE = 1 << 0,
    KICK_MEMBERS = 1 << 1,
    BAN_MEMBERS = 1 << 2,
    /** Implicitly has *all* permissions, and bypasses all channel overwrites */
    ADMINISTRATOR = 1 << 3,
    /** Edit and reorder channels */
    MANAGE_CHANNELS = 1 << 4,
    /** Edit the guild information, region, etc. */
    MANAGE_GUILD = 1 << 5,
    /** Add new reactions to messages */
    ADD_REACTIONS = 1 << 6,
    VIEW_AUDIT_LOG = 1 << 7,

    VIEW_CHANNEL = 1 << 10,
    SEND_MESSAGES = 1 << 11,
    SEND_TTS_MESSAGES = 1 << 12,
    /** Delete messages and reactions */
    MANAGE_MESSAGES = 1 << 13,
    /** Links posted will have a preview embedded */
    EMBED_LINKS = 1 << 14,
    ATTACH_FILES = 1 << 15,
    /** View messages that were posted prior to opening Discord */
    READ_MESSAGE_HISTORY = 1 << 16,
    MENTION_EVERYONE = 1 << 17,
    /** Use emojis from different guilds */
    USE_EXTERNAL_EMOJIS = 1 << 18,

    /** Connect to a voice channel */
    CONNECT = 1 << 20,
    /** Speak in a voice channel */
    SPEAK = 1 << 21,
    /** Mute members across all voice channels */
    MUTE_MEMBERS = 1 << 22,
    /** Deafen members across all voice channels */
    DEAFEN_MEMBERS = 1 << 23,
    /** Move members between voice channels */
    MOVE_MEMBERS = 1 << 24,
    /** Use voice activity detection */
    USE_VAD = 1 << 25,

    CHANGE_NICKNAME = 1 << 26,
    /** Change other members' nicknames */
    MANAGE_NICKNAMES = 1 << 27,
    MANAGE_ROLES = 1 << 28,
    MANAGE_WEBHOOKS = 1 << 29,
    MANAGE_EMOJIS = 1 << 30,
}

/**
 * Data that can be resolved to give a permission number. This can be:
 * * A string
 * * A permission number
 * * An instance of Permissions
 */
type PermissionResolvable = string | number | Permission;

class Permissions {
    /**
     * Bitfield of the packed permissions
     */
    bitfield: number;

    constructor(permissions: number) {
        this.bitfield = permissions;
    }

    /**
     * Checks whether the bitfield has a permission, or multiple permissions.
     * @param permission Permission(s) to check for
     * @param checkAdmin Whether to allow the administrator permission to override
     */
    has(permission: PermissionResolvable | PermissionResolvable[], checkAdmin = true): boolean {
        if (permission instanceof Array) return permission.every(p => this.has(p, checkAdmin));
        permission = Permissions.resolve(permission);
        if (checkAdmin && (this.bitfield & Permission.ADMINISTRATOR) > 0) return true;
        return (this.bitfield & permission) === permission;
    }

    /**
     * Resolves permissions to their numeric form.
     * @param  permission - Permission(s) to resolve
     */
    static resolve(permission: PermissionResolvable): number {
        if (typeof permission === 'number' && permission >= 0) 
            return permission;

        if (permission instanceof Permissions) 
            return permission.bitfield;

        if (permission instanceof Array) 
            return permission.map(p => this.resolve(p)).reduce((prev, p) => prev | p, 0);

        if (typeof permission === 'string') 
            return <any> Permission[(<any> permission)];

        throw new RangeError('PERMISSIONS_INVALID');
    }

    /**
     * Bitfield representing the default permissions for users
     * @type {number}
     */
    static DEFAULT = 104324097;
}