const { bgBlue, black, green, cyan, magenta, yellow, red} = require("chalk");
const Wind = require('../[base]/Wind');
const moment = require("moment");
require("moment-duration-format");
// const inviteNotifications = require('./guildMemberAdd')


module.exports = class {

	/** @param {Wind} client */
	constructor (client) {
		this.client = client;
	}

	async run (bot) {
		const client = this.client;
		console.log(`•──────────────────────────────•`);
		console.log(`${red(`► Loading ended for a total of ${client.commands.size} command(s).`)}`);

		client.guilds.cache.forEach(guild => {
			guild.fetchInvites().then(invites => this.client.inviteTracker.set(guild.id, invites))
		})

		client.user.setActivity(`🔁 ▸ Loading Data..`)

		const statusList = [
			`➥ w!help`,
		]

		setInterval(() => {
			const index = Math.floor(Math.random() * statusList.length);
			client.user.setActivity(statusList[index], { type: 'WATCHING' })
		}, 15000);

		if (client.config.exp.enabled)
		{
			// Ajoute les membres qui ont join le discord pendant que le bot était offline à la DB
			let users = (await client.mysql.query("SELECT * FROM `users`"))[0];
			let members = await client.guilds.cache.get(client.config.mainGuild).members.fetch();

			let insertCount = 0;

			for (let mem of members)
			{
				let member = mem[1];

				if (member.user.bot) continue;

				if (!users.find(r => r["user_id"] == member.id))
				{
					await client.mysql.query("INSERT INTO `users` VALUES (?, ?, ?)", [member.user.id, 0, 0]);

					insertCount++;
				}
			}

			if (insertCount > 0) 
				console.log(cyan(`► Inserted ${insertCount} missing user rows in DB.`));
		}
			
		console.log(`${yellow(`► ${client.user.tag} ready to serve\n∟ ${client.users.cache.size} users in ${client.guilds.cache.size} servers.`)}`);
	};
}
