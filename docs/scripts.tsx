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

import "./styles.scss";

// Create the discord instance
let discord = new LoginWithDiscord({
    // Cache the token
    cache: true,
    // The demo client id
    clientID: "393448325438898187",
    // Get all of the users information in order to display it
    scopes: [
        Scope.Identify, Scope.Connections, Scope.Email, Scope.Guilds
    ]
});

discord.onlogin = async () => {
    // Hide the login button and show the demo
    document.getElementById("login").style.display = "none";
    document.getElementById("loaded").style.display = null;

    try {
        // Fetch the user object
        let user = await discord.fetchUser();
        // Fetch the users connections
        let connections = await discord.fetchConnections();
        // Fetch the users guilds
        let guilds = await discord.fetchGuilds();

        // Display all of the user information
        document.getElementById("user").innerHTML = "";
        document.getElementById("user").appendChild(
            <div className="udata">
                <object className="userpfp" data={user.avatarGIFURL} type="image/gif">
                    <img src={user.avatarURL} alt="example"/>
                </object>
                <div className="uinfo">
                    <div className="usertag">
                        <span className="username">{user.username}</span>
                        <span className="desc">#{user.discriminator}</span>
                    </div>
                    <div className="extra">
                        <span id="userid">{user.id}</span>
                        <span id="useremail">{user.email}</span>
                    </div>
                    <div className={`usermfa${user.mfa_enabled ? " enabled" : " disabled"}`}>MFA {user.mfa_enabled ? "ENABLED" : "DISABLED"}</div>
                    <button id="logout" onclick={() => discord.logout()}>logout</button>
                </div>
            </div>
        );

        // Display the connections
        let connect = document.getElementById("connections");
        // Clear the old connections if any
        connect.innerHTML = "";
        for (let connection of connections) {
            connect.appendChild(
                <div className="connection">
                    <span className="type">{connection.type}</span>
                    <span className="name">{connection.name}</span>
                    {connection.verified ? <img src="./verified.svg"/> : ""}
                </div>
            );
        }

        // Display the guilds
        let g = document.getElementById("guilds");
        // Clear the old guilds if any
        g.innerHTML = "";
        for (let guild of guilds) {
            g.appendChild(
                <div className="guild">{
                    guild.icon ?
                        <img src={guild.iconURL} onmouseover={inspectGuildBuilder(guild)}/> :
                        <div className="img" onmouseover={inspectGuildBuilder(guild)}>
                            <span>{guild.name.split(" ").map(x => x[0]).join("")}</span>
                        </div>
                }</div>
            );
        }
    } catch (e) {
        console.log(e);
        discord.logout();
    }
};

const inspectGuildBuilder = (guild?: IGuild) => () => inspectGuild(guild);

// Show the current guild in the sidebar to the right
function inspectGuild(guild?: IGuild) {
    // Get the inspector part
    let inspector = document.getElementById("guildinspector");
    inspector.innerHTML = "";

    // Remove the guild if there is none
    if (guild === null || guild === undefined) {
        inspector.appendChild(
            <div>
                <div className="img"></div>
                <div className="name"></div>
            </div>
        );
        return;
    }

    inspector.appendChild(
        <div>{
                guild.icon ?
                    <img src={guild.iconURL}/> :
                    <div className="img">
                        <span>{
                            guild.name
                                .split(" ")
                                .map(x => x[0])
                                .join("")
                        }</span>
                    </div>
            }
            <div className="name">
                {guild.name}{guild.owner ? <img className="owner" src="./owner.svg"/> : ""}
            </div>
        </div>
    );
}

discord.onlogout = async () => {
    // Show the login button and hide the demo
    document.getElementById("login").style.display = null;
    document.getElementById("loaded").style.display = "none";
};

// Add event handlers to the buttons
window.addEventListener("load", () => {
    // Login button
    document.getElementById("login").onclick = async () => {
        await discord.login();
    };
});

function parseElement<K extends keyof HTMLElementTagNameMap>(elmname: K, props: { [x: string]: string | EventListener }, ...content: string[] | Element[]): HTMLElementTagNameMap[K] {
    let element = document.createElement(elmname);
    for (let prop in props) {
        let value = props[prop];
        if (prop.startsWith("on")) {
            if (typeof value === "function") {
                element.addEventListener(prop.replace("on", ""), value);
            } else {
                throw new TypeError("Event handlers must be functions");
            }
        } else {
            if (typeof value === "string") {
                element.setAttribute(prop === "className" ? "class" : prop, value);
            }
        }
    }

    element.append(...content);

    return element;
}