const Command = require("../../[base]/Commands.js");
const Pinged = require('ping-lite');

class Ping extends Command {
    constructor (client) {
        super(client, {
            name: "ping",
            dirname: __dirname,
            enabled: false,
            guildOnly: false,
            aliases: [ "pong", "latency" ],
            memberPerms: [],
            botPerms: [ "SEND_MESSAGES" ],
            nsfw: false,
            ownerOnly: true
        });
    }

    async run (message) {
        const client = this.client;
        var ping = new Pinged('1.1.1.1');
        var api = client.ws.ping;
        var lat = Date.now() - message.createdTimestamp;

        let finalDesc = "";

        ping.send(function(err, ms) {
            // Latence Bot
            if (ms < 50) finalDesc += '<:clean:771808093902209054> › Wind BOT Latency: `' + Math.round(ms) + ' ms`\n'
            else if (ms >= 50 && ms < 120) finalDesc += '<:outrage:771808167755382824> › Wind BOT Latency: `' + Math.round(ms) + ' ms`\n'
            else finalDesc += '<:cringe:771808273136353300> › Wind BOT Latency: ``' + Math.round(ms) + ' ms``\n'

            if (api < 150) finalDesc += '<:clean:771808093902209054> › Discord API Latency: `' + api + ' ms`\n'
            else if (api >= 150 && api < 300) finalDesc += '<:outrage:771808167755382824> › Discord API Latency: `' + api + ' ms`\n'
            else finalDesc += '<:cringe:771808273136353300> › Discord API Latency: `' + api + ' ms`\n'

            message.channel.send(`🏓 Pong!\n\n${finalDesc}`);
        });
		}
    }
module.exports = Ping;
