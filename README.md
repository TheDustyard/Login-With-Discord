<img src="https://discordapp.com/assets/f8389ca1a741a115313bede9ac02e2c0.svg" height=100 align="right">

# Login With Discord

### Simple Promise-based Discord login API
[![](https://data.jsdelivr.com/v1/package/gh/dusterthefirst/Login-With-Discord/badge?style=rounded)](https://www.jsdelivr.com/package/gh/dusterthefirst/Login-With-Discord)
![](https://img.shields.io/github/downloads/DusterTheFirst/Login-With-Discord/total.svg)
![](https://img.shields.io/github/size/DusterTheFirst/Login-With-Discord/dist/lwd.js.svg)
<br>
![](https://img.shields.io/github/issues/DusterTheFirst/Login-With-Discord.svg)
![](https://img.shields.io/github/release/DusterTheFirst/Login-With-Discord.svg)
![](https://img.shields.io/github/release-date/DusterTheFirst/Login-With-Discord.svg)
<br>
![](https://img.shields.io/github/languages/top/DusterTheFirst/Login-With-Discord.svg)
![](https://img.shields.io/github/license/DusterTheFirst/Login-With-Discord.svg)

* [Live Example](https://lwd.js.org/)
* [Download](https://github.com/DusterTheFirst/Login-With-Discord/releases)

# Installation
Either download the latest version from the [GitHub releases](https://github.com/DusterTheFirst/Login-With-Discord/releases)
or to ensure your site always has the latest version, include it using [jsdelivr](https://www.jsdelivr.com/) with the below url
```
https://cdn.jsdelivr.net/gh/dusterthefirst/Login-With-Discord/dist/lwd.js
```

# Using
Download [lwd.d.ts](https://cdn.jsdelivr.net/gh/dusterthefirst/Login-With-Discord/dist/lwd.d.ts) if you use typescript or want the extra typings

To start you must create an instance of the class
```js
let discord = new LoginWithDiscord({
    clientID: '<client id>',
    scopes: [
        Scope.Identify
    ]
});
```
You must pass it the `clientID` and [scopes](#Supported Scopes) and can optionally pass a `redirect_url`, by default the redirect url is the current one, and you can also disable caching using the `cache` option which is defaulted to true

Once you have the discord object you have access to many functions and event handlers

# Documentaion

## `discord.onlogin`
Event handler called whenever discord.login() completes or the page is loaded with the user already logged in

## `discord.onlogout`
Event handler called whenever discord.logout() completes or the page is loaded without the user logged in

## `await discord.login()`
Asynchronous funtion that opens the login dialog for your application
(Throws an error if the authentication does not complete successfully)

## `discord.logout()`
Synchronus function that will clear the login cache and log the user out

## `await discord.fetchUser()`
**(requires scope `Identify` or `Email`)**<br/>
Asynchronus function that will get the [user object](https://discordapp.com/developers/docs/resources/user#user-object)

## `await discord.fetchConnections()`
**(requires scope `Connections`)**<br/>
Asynchronus function that will get the user's [connections](https://discordapp.com/developers/docs/resources/user#connection-object)

## `await discord.fetchGuilds()`
**(requires scope `Guilds`)**<br/>
Asynchronus function that will get the user's [guilds](https://discordapp.com/developers/docs/resources/user#get-current-user-guilds)

## `await discord.joinGuild('guildid')`
**(requires scope `GuildsJoin`)**<br/>
Asynchronus function that will join a guild

## `discord.state`
The current [state](#States) of the login process

## Supported Scopes

| Name              | Scope         | Description                                         |
| ----------------- | ------------- | --------------------------------------------------- |
| Scope.Connections | `connections` | Allows access to linked third-party accounts        |
| Scope.Email       | `email`       | Allows you to fetch the user ***with*** an email    |
| Scope.Identify    | `identify`    | Allows you to fetch the user ***without*** an email |
| Scope.Guilds      | `guilds`      | Allows you to fetch the user's guilds               |
| Scope.GuildsJoin  | `guilds.join` | Allows your app to add users to a guild             |

**`GuildsJoin` requires you to have a bot account linked to your application. Also, in order to add a user to a guild, your bot has to already belong to that guild.**

## States

| Value | Name              | Description          |
| ----- | ----------------- | -------------------- |
| `0`   | `State.LoggedOut` | No auth token stored |
| `1`   | `State.LoggedIn`  | Auth token is stored |
| `2`   | `State.LoggingIn` | Authorising          |
