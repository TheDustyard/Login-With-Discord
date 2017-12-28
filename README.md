## Using
(HTML)
```html
<script src="https://lwd.js.org/lwd.js"></script>
```
(JS)
```js
/// <reference path="https://lwd.js.org/lwd.d.ts" />
let discord = new LoginWithDiscord({
    cache: true; //Default TRUE (Reccomended to cache the token)
});

// Fired when there is an auth token
discord.onlogin = async () => {
    // Get the user (requires scope `Identify` or `Email`)
    let user = await discord.fetchUser().catch(console.log);
    // Get the user's connections (requires scope `Connections`)
    let connections = await discord.fetchConnections().catch(console.log);
    // Get the user's guilds (requires scope `Guilds`)
    let guilds = await discord.fetchGuilds().catch(console.log);
    // Add the user to a guild (requires scope `GuildsJoin`)
    await discord.joinGuild('5h293Fy');
}

// Fires when there is no auth token
discord.onlogout = async () => {
    console.log('You have been logged out');
}

window.onload = async () => {
    await discord.init(); // Loads auth token, only once the window has loaded
}
```



## Avaliable scopes

| Name              | Scope         | Description                                         |
| ----------------- | ------------- | --------------------------------------------------- |
| Scope.Connections | `connections` | Allows access to linked third-party accounts        |
| Scope.Email       | `email`       | Allows you to fetch the user ***with*** an email    |
| Scope.Identify    | `identify`    | Allows you to fetch the user ***without*** an email |
| Scope.Guilds      | `guilds`      | Allows you to fetch the user's guilds               |
| Scope.GuildsJoin  | `guilds.join` | Allows your app to add users to a guild             |

#### `GuildsJoin` requires you to have a bot account linked to your application. Also, in order to add a user to a guild, your bot has to already belong to that guild.

## States

| Value | Name              | Description          |
| ----- | ----------------- | -------------------- |
| `0`   | `State.LoggedOut` | No auth token stored |
| `1`   | `State.LoggedIn`  | Auth token is stored |
| `2`   | `State.LoggingIn` | Authorising          |