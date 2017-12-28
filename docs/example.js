/// <reference path="./lwd.d.ts" />

let discord = new LoginWithDiscord({
    cache: true
});

discord.onlogin = async () => {
    Array.from(document.getElementsByClassName('out')).forEach(x => {
        x.style.display = "none";
    });
    Array.from(document.getElementsByClassName('in')).forEach(x => {
        x.style.display = '';
    });
    let user = await discord.fetchUser().catch(console.log);
    let connections = await discord.fetchConnections().catch(console.log);
    let guilds = await discord.fetchGuilds().catch(console.log);

    document.getElementById('userpfp').src = user.avatarURL;
    document.getElementById('userid').innerHTML = user.id;
    document.getElementById('usertag').innerHTML = user.tag;
    document.getElementById('useremail').innerHTML = user.email;
    document.getElementById('usermfa').innerHTML = user.mfa_enabled;
    let connect = document.getElementById('connections');
    for (let connection of connections) {
        let child = document.createElement('div');
        child.classList.add('connection');
        child.innerHTML = `<span class="type">${connection.type}</span>:<span class="name">${connection.name}</span>${connection.verified ? "<span class='verif'>✓</span>" : ""}`
        connect.appendChild(child);
    }
    let g = document.getElementById('guilds');
    for (let guild of guilds) {
        let child = document.createElement('div');
        child.classList.add('guild');
        child.innerHTML = `<img src="${guild.iconURL}"><span class="name">${guild.name}</span>${guild.owner ? "<span class='own'>👑</span>" : ""}`;
        connect.appendChild(child);
    }
    document.getElementById('loady').style.display = 'none';
    //wait discord.joinGuild('5h293Fy');
    //await discord.joinDM('395807434473472001', user.id);
}

discord.onlogout = async () => {
    Array.from(document.getElementsByClassName('in')).forEach(x => {
        x.style.display = "none";
    });
    Array.from(document.getElementsByClassName('out')).forEach(x => {
        x.style.display = '';
    });
    document.getElementById('connections').innerHTML = '';
    document.getElementById('guilds').innerHTML = '';
}

window.onload = () => {
    discord.init();
}

async function login() {
    await discord.login('393448325438898187', Scope.Identify, Scope.Connections, Scope.Email, Scope.Guilds, Scope.GuildsJoin);
}

async function logout() {
    await discord.logout();
}
