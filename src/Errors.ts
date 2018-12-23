/*!
 * Copyright (C) 2018  Zachary Kohnen (DusterTheFirst)
 */

export class AuthenticationRequiredError extends Error {
    public name: "AuthenticationRequiredError";

    constructor() {
        super("You must be authenticated to make this request");
        this.name = "AuthenticationRequiredError";
    }
}

export class AuthenticationInvalidError extends Error {
    public name: "AuthenticationInvalidError";

    constructor() {
        super("The provided authentication was invalid");
        this.name = "AuthenticationInvalidError";
    }
}

export class MissingScopesError extends Error {
    public name: "MissingScopesError";

    constructor(...scopes: string[]) {
        super(`You must be authenticated with the scopes "${scopes.join(", ")}" to make this request`);
        this.name = "MissingScopesError";
    }
}

export class GuildInviteExpiredError extends Error {
    public name: "GuildInviteExpiredError";

    constructor() {
        super("The given invite has expired");
        this.name = "GuildInviteExpiredError";
    }
}