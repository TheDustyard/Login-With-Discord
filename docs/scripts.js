/**
 * DO NOT USE THIS CODE AS AN EXAMPLE, THE ONLY EXEMPLARY PART OF
 * IT IS THE INTERFACE AND SHOWING USERS WHAT CAN BE ACCOMPLISHED
 * THIS CODE IS PROVIDED WITH NO WARENTEE AND I (DusterTheFirst)
 * AM NOT OBLIGED TO HELP YOU FIX ANY BUGS CAUSED BY THIS CODE
 * IF IT IS IN YOUR CODE.
 *
 * PLEASE CREATE YOUR OWN CODE FROM THE DOCUMENTAION PROVIDED
 */
// tslint:disable-next-line:no-reference
/// <reference path="../dist/lwd.d.ts" />
let discord = new LoginWithDiscord({
    cache: true,
    clientID: "393448325438898187",
    scopes: [
        Scope.Identify, Scope.Connections, Scope.Email, Scope.Guilds
    ]
});
let guilds;
discord.onlogin = async () => {
    document.getElementById("login").style.display = "none";
    document.getElementById("loaded").style.display = null;
    let user = await discord.fetchUser();
    let connections = await discord.fetchConnections();
    guilds = await discord.fetchGuilds();
    document.getElementById("userpfp").src = user.avatarURL;
    document.getElementById("userid").innerHTML = user.id;
    document.getElementById("usertag").innerHTML = `<span class="username">${user.username}</span><span class="desc">${user.discriminator}</span>`;
    document.getElementById("useremail").innerHTML = user.email;
    document.getElementById("usermfa").classList.add(user.mfa_enabled ? "enabled" : "disabled");
    document.getElementById("usermfa").innerHTML = `MFA ${user.mfa_enabled ? "ENABLED" : "DISABLED"}`;
    let connect = document.getElementById("connections");
    connect.innerHTML = "";
    for (let connection of connections) {
        let child = document.createElement("div");
        child.classList.add("connection");
        child.innerHTML = `<span class="type">${connection.type}</span><span class="name">${connection.name}</span>${connection.verified ? "<img src='./verified.svg'/>" : ""}`;
        connect.appendChild(child);
    }
    let g = document.getElementById("guilds");
    g.innerHTML = "";
    for (let guild of guilds) {
        let child = document.createElement("div");
        child.classList.add("guild");
        child.innerHTML = guild.icon
            ? `<img src="${guild.iconURL}" onmouseover="inspectGuild('${guild.id}')" onmouseout="inspectGuild()"/>`
            : `<div class="img" onmouseover="inspectGuild('${guild.id}')"><span>${guild.name.split(" ").map(x => x[0]).join("")}</span></div>`;
        g.appendChild(child);
    }
};
function inspectGuild(guildid) {
    let inspector = document.getElementById("guildinspector");
    if (guildid == null) {
        inspector.innerHTML = `<div class="img"></div><div class="name"></div>`;
        return;
    }
    let guild = guilds.find(x => x.id === guildid);
    inspector.innerHTML = guild.icon
        ? `<img src="${guild.iconURL}"/><div class="name">${guild.name} ${guild.owner ? "<img class='owner' src='./owner.svg'/>" : ""}</span></div>`
        : `<div class="img"><span>${guild.name.split(" ").map(x => x[0]).join("")}</span></div><div class="name">${guild.name} ${guild.owner ? "<img class='owner' src='./owner.svg'/>" : ""}</span>`;
}
discord.onlogout = async () => {
    document.getElementById("login").style.display = null;
    document.getElementById("loaded").style.display = "none";
};
async function login() {
    await discord.login();
}
async function logout() {
    await discord.logout();
}
