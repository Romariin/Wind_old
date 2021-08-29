const Command = require('../../[base]/Commands.js');
const Discord = require("discord.js");

class Help extends Command {
	constructor (client) {
		super(client, {
			name: "help",
			dirname: __dirname,
			enabled: true,
			guildOnly: false,
			aliases: ['aide', 'h', 'commands'],
			memberPerms: [],
			botPerms: [],
			nsfw: false,
			ownerOnly: false,
		});
    }
	async run (message, args, data) {
		const categories = [];
		const commands = this.client.commands;

		commands.forEach((command) => {
			if(!categories.includes(command.help.category)){
				if(command.help.category === "Owner" && !this.client.config.ownerID.includes(message.author.id)) {
					return;
				}
				categories.push(command.help.category);
			}
		});

		const emojis = this.client.customEmojis;

		const embed = new Discord.MessageEmbed()
			.setDescription(`\\⚠️ **Pas encore implémenter** ▸ Pour avoir des informations sur une commande spécifique: \`m!help <command>\``)
			.setColor('#2f3136')
		categories.sort().forEach((cat) => {
			const tCommands = commands.filter((cmd) => cmd.help.category === cat);
			embed.addField(`\\${emojis.categories[cat.toLowerCase()]}・`+" "+cat+" ("+tCommands.size+")", tCommands.map((cmd) => "`"+cmd.help.name+"`").join(", "));
		});

		embed.setAuthor(`${this.client.user.username} ・ Help`, this.client.user.displayAvatarURL());
		return message.channel.send(embed);
	}

}

module.exports = Help;