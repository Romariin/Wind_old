const Command = require('../../[base]/Commands.js')

class clearMessage extends Command {
	constructor (client) {
		super(client, {
			name: "clear",
			dirname: __dirname,
			enabled: true,
			guildOnly: false,
			aliases: ['purge'],
			memberPerms: ['MANAGE_MESSAGES'],
			botPerms: [],
			nsfw: false,
			ownerOnly: false,
		});
    }
    async run (message, args) {
      if (!args[0] || !parseInt(args[0]))
            return message.channel.send("<:redTick:771802350452867113> Nombre de message à supprimer non spécifié ou incorrect.");

        let limit = parseInt(args[0]);
        if (limit > 100) limit = 100;
        if (limit < 1) limit = 1;

        let messages = await message.channel.messages.fetch({limit: limit < 100 ? limit + 1 : limit});
        message.channel.bulkDelete(messages, true).catch(e => {
            message.channel.send("<:redTick:771802350452867113> Je ne peux pas supprimer certains de ces messages.");
            console.log(`Purge failed because of ${e}`);
        }).then(async () => {
            let notif = await message.channel.send(`<:greenTick:771802453535358977> ${limit} messages supprimés.`);
            setTimeout(() => {
                try { notif.delete() }
                catch (e) {}
            }, 3000);
        });
			}
		}

module.exports = clearMessage;
