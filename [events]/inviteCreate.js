const Discord = require('discord.js');
const config = require('../[globalConfig]/globalConfig.json');
const Wind = require('../[base]/Wind');

module.exports = class {

	/** @param {Wind} client */
	constructor (client) {
		this.client = client;
	}

	async run (client) {
        try {
            this.client.inviteTracker.set(client.guild.id, await client.guild.fetchInvites());
        }
        catch(err) {
            console.log(err);
        }

    }
}