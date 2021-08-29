const Command = require('../../[base]/Commands.js')

class Reload extends Command {

	constructor (client) {
		super(client, {
			name: "reload",
			dirname: __dirname,
			enabled: true,
			guildOnly: false,
			aliases: [ 'r' ],
			memberPerms: [],
			botPerms: [],
			nsfw: false,
			ownerOnly: true,
		});
    }
    async run (message, args) {
		const command = args[0];
		const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));
		if(!cmd){
			return message.reply('<:redTick:771802350452867113> **Error: **Command or aliases ' + '`' + command + '`' + ' not found')
		}
		await this.client.unloadCommand(cmd.conf.location, cmd.help.name);
		await this.client.loadCommand(cmd.conf.location, cmd.help.name);
        message.reply('<:greenTick:771802453535358977> ' + '`' + command + '`' + ' **Reloaded**')
	}
}

module.exports = Reload;