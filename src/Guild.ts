/*!
 * Copyright (C) 2018  Zachary Kohnen (DusterTheFirst)
 */

import { Permissions } from "./Permissions";

export interface IGuild {
    /** guild id */
    id: string;
    /** guild name (2-100 characters) */
    name: string;
    /** icon hash */
    icon?: string;
    /** whether or not the user is the owner of the guild */
    owner: boolean;
    /** total permissions for the user in the guild (does not include channel overrides) */
    permissions: number;
}

export class Guild implements IGuild {
    public id: string;
    public name: string;
    public icon?: string;
    public owner: boolean;
    public permissions: number;
    public permissionsClass: Permissions;

    constructor(guild: IGuild) {
        this.id = guild.id;
        this.name = guild.name;
        this.icon = guild.icon;
        this.owner = guild.owner;
        this.permissions = guild.permissions;
        this.permissionsClass = new Permissions(this.permissions);
    }

    public get iconUrl() {
        if (this.icon) {
            return `https://cdn.discordapp.com/avatars/${this.id}/${this.icon}.png`;
        }
        return undefined;
    }
}
