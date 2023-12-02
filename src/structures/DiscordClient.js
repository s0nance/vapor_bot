const {
    Client,
    Collection,
    GatewayIntentBits,
    Partials,
} = require("discord.js")

module.exports = class DiscordClient extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds
            ],
            partials: [
                Partials.User, Partials.Message, Partials.Reaction
            ],
            allowedMentions: {
                repliedUser: false,
            },
        });

        this.config = require("@root/config")

        this.commands = []
        this.commandIndex = new Collection()
    }
}