# Login With Discord


# DOC LAYOUT

###### OAuth2 Scopes

| Name | Description |
|------|-------------|
| connections | allows [/users/@me/connections](#DOCS_USER/get-user-connections) to return linked third-party accounts |
| email | enables [/users/@me](#DOCS_USER/get-current-user) to return an `email` |
| identify | allows [/users/@me](#DOCS_USER/get-current-user) without `email` |
| guilds | allows [/users/@me/guilds](#DOCS_USER/get-current-user-guilds) to return basic information about all of a user's guilds |
| guilds.join | allows [/invites/{invite.id}](#DOCS_INVITE/accept-invite) to be used for joining users to a guild |
| gdm.join | allows your app to [join users to a group dm](#DOCS_CHANNEL/group-dm-add-recipient) |
| messages.read | for local rpc server api access, this allows you to read messages from all client channels (otherwise restricted to channels/guilds your app creates) |
| rpc | for local rpc server access, this allows you to control a user's local Discord client |
| rpc.api | for local rpc server api access, this allows you to access the API as the local user |
| rpc.notifications.read | for local rpc server api access, this allows you to receive notifications pushed out to the user |
| webhook.incoming | this generates a webhook that is returned in the oauth token response for authorization code grants |

guilds.join and bot require you to have a bot account linked to your application. Also, in order to add a user to a guild, your bot has to already belong to that guild.