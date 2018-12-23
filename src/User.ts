/*!
 * Copyright (C) 2018  Zachary Kohnen (DusterTheFirst)
 */

export interface IUser {
    /** the user's id */
    id: string;
    /** the user's username, not unique across the platform */
    username: string;
    /** the user's 4-digit discord-tag */
    discriminator: string;
    /** the user's avatar hash */
    avatar: string;
    /** whether the user has two factor enabled on their account */
    mfa_enabled: boolean;
    /** the user's chosen language option */
    locale?: string;
    /** whether the email on this account has been verified */
    verified?: boolean;
    /** the user's email */
    email?: string;
    /** the flags on a user's account */
    flags: number;
    /** the type of Nitro subscription on a user's account */
    premium_type?: number;
}

export class User implements IUser {
    public id: string;
    public username: string;
    public discriminator: string;
    public avatar: string;
    // tslint:disable-next-line:variable-name
    public mfa_enabled: boolean;
    public locale?: string;
    public verified?: boolean;
    public email?: string;
    public flags: number;
    // tslint:disable-next-line:variable-name
    public premium_type?: number;

    constructor(user: IUser) {
        this.id = user.id;
        this.username = user.username;
        this.discriminator = user.discriminator;
        this.avatar = user.avatar;
        this.mfa_enabled = user.mfa_enabled;
        this.locale = user.locale;
        this.verified = user.verified;
        this.email = user.email;
        this.flags = user.flags;
        this.premium_type = user.premium_type;
    }

    /** Fetch the users image, given the preffered extention */
    public async getImage(extention: "jpg" | "jpeg" | "png" | "webp"): Promise<string> {
        if (this.premium_type !== undefined) {
            // Try to get the gif avatar
            let gif = await fetch(`https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.gif`);
            if (gif.ok) {
                return `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.gif`;
            }
        }

        return `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.${extention}`;
    }

    /** The users mention */
    public get mention() {
        return `<@${this.id}>`;
    }

    /** The users tag */
    public get tag() {
        return `@${this.username}#${this.discriminator}`;
    }
}
