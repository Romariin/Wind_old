const Discord = require('discord.js');
const config = require('../[globalConfig]/globalConfig.json');
const moment = require("moment");
const Wind = require('../[base]/Wind');

require("moment-duration-format");

module.exports = class {
	/** @param {Wind} client*/
	constructor (client) {
		this.client = client;
	}

	/** @param {Discord.Message} message */
	async run (message) {

		const data = {};

		// If the messagr author is a bot
		if (message.author.bot) {
			return;
		}

		const client = this.client;
		data.config = client.config;

		let prefix = config.defaultPrefix;

		if (message.content.match(new RegExp(`^<@!?${client.user.id}>( |)$`))) {
			if (message.guild) {
				message.channel.send('👋 Hey <@' + message.author + '>, mon prefix est: `' + prefix + '`')
			}
		}

		if (message.guild.id == client.config.mainGuild && client.config.exp.enabled)
		{
			client.levelsHelper.handleGain(message);
		}

		const args = message.content.slice((typeof prefix === "string" ? prefix.length : 0)).trim().split(/ +/g);
		const command = args.shift().toLowerCase();
		const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

		if (!cmd) {
			return;
		}

		if (!message.content.startsWith(prefix)) {
			return;
		}

		if(cmd.conf.guildOnly && !message.guild ) {
			return message.error("misc:GUILD_ONLY");
		}

		if (cmd.conf.mainGuildOnly && message.guild.id != client.config.mainGuild)
		{
			let guildName = client.guilds.cache.get(client.config.mainGuild).name;
			return message.reply(`<:greyTick:789541801019047936> Cette commande est réservée au Discord **${guildName}**.`);
		}

		const bypassMode = '--bypass'

		if(!cmd.conf.enabled){
			if (message.content.includes(bypassMode) && client.config.ownerID.includes(message.author.id)) {
			}
			else {
			return message.reply('<:greyTick:789541801019047936> This command is disabled for the moment.');
			}
		}

		let perms = message.member.permissions;

		if (!perms.has(cmd.conf.memberPerms)) {
			return message.channel.send(`<:redTick:771802350452867113> ${message.author}, you don't have permission to use this command: \`${cmd.help.name}\`
⠀⠀⠀⠀⠀**∟Needed Perms: \`${cmd.conf.memberPerms}\`**`)
		}

		if(cmd.conf.ownerOnly && !client.config.ownerID.includes(message.author.id)) {
			return;
		}

		try {
			cmd.run(message, args, data);
		} catch(e) {
			console.error(e);
			return message.reply('<:redTick:771802350452867113> Error ' + '`' + e + '`');
		}
    }
};
