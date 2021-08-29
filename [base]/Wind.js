const { bgBlue, black, green, cyan, magenta} = require("chalk");
const { Client, Collection } = require("discord.js");
const util = require("util"),
path = require("path");
const MySQL = require("mysql2/promise");
const Levels = require('../[helpers]/levels');

class Wind extends Client {
    constructor(options) {
        super(options);
        this.config = require('../[globalConfig]/globalConfig.json');
        this.commands = new Collection();
        this.aliases = new Collection();
        this.inviteTracker = new Map();
        this.customEmojis = require("../emojis.json");
        this.logger = require('../[helpers]/logger');
        this.mysql = MySQL.createPool({
            host: this.config.mysql.host,
            port: this.config.mysql.port,
            user: this.config.mysql.user,
            password: this.config.mysql.pass,
            database: this.config.mysql.db,
            waitForConnections: true,
            connectionLimit: 20
        });
        this.levelsHelper = new Levels(this);
    }

    loadCommand (commandPath, commandName) {
        try {
            const props = new (require(`.${commandPath}${path.sep}${commandName}`))(this);
            console.log(`${green(`∟ Loading Command: ${props.help.name} ${magenta(`(${commandPath})`)}`)}`);
            props.conf.location = commandPath;
            if (props.init){
                props.init(this);
            }
            this.commands.set(props.help.name, props);
            props.help.aliases.forEach((alias) => {
                this.aliases.set(alias, props.help.name);
            });
            return false;
        } catch (e) {
            return `Unable to load command ${commandName}: ${e}`;
        }
    }

    // This function is used to unload a command (you need to load them again)
	async unloadCommand (commandPath, commandName) {
		let command;
		if(this.commands.has(commandName)) {
			command = this.commands.get(commandName);
		} else if(this.aliases.has(commandName)){
			command = this.commands.get(this.aliases.get(commandName));
		}
		if(!command){
			return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
		}
		if(command.shutdown){
			await command.shutdown(this);
		}
		delete require.cache[require.resolve(`.${commandPath}${path.sep}${commandName}.js`)];
		return false;
	}
}

module.exports = Wind;
