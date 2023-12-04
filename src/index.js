const app = require('express')()
const Discord = require('discord.js')
require('dotenv').config('./.env')
const axios = require('axios')
const config = require('./config/bot.js')

console.clear()

app.listen(3000, () => console.log("running on port 3000"))
require("./vaporBot")

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
    if (error) if (error.length > 950) error = error.slice(0, 950) + '... view console for details';
    if (error.stack) if (error.stack.length > 950) error.stack = error.stack.slice(0, 950) + '... view console for details';
    if (!error.stack) return

    // for future webhooks hihi
    const embed = new Discord.EmbedBuilder()
        .setTitle(`Unhandled promise rejection`)
        .addFields([
            {
                name: "Error",
                value: error ? Discord.codeBlock(error) : "No error"
            }
        ])
})


process.on('warning', warn => {
    console.warn("Warning:", warn);
    // embed webhooks later
})