const Discord = require('discord.js');
const config = require('../[globalConfig]/globalConfig.json');
const Wind = require('../[base]/Wind');


module.exports = class {
    /** @param {Wind} client */
    constructor (client) {
        this.client = client;
    }

    /** @param {Discord.GuildMember} guildMember */
    async run (guildMember) {

        const cachedInvites = this.client.inviteTracker.get(guildMember.guild.id)
        const newInvites = await guildMember.guild.fetchInvites()
        this.client.inviteTracker.set(guildMember.guild.id, newInvites)
        try {
            const usedInvite = newInvites.find(inv => cachedInvites.get(inv.code).uses < inv.uses);
            const logEmbed = new Discord.MessageEmbed()
            .setColor('#738dcd')
            .setThumbnail(guildMember.user.avatarURL())
            .setAuthor(`Join Log`, 'https://cdn.discordapp.com/emojis/663037912442732565.png?v=1')
            .setDescription(`<:user:795339614432002069> ▸ **Utilisateur:** <@${guildMember.user.id}>\n<:id:813426591085363260> ▸ **ID:** \`${guildMember.user.id}\`\n\n<:join:798297305215926302> ▸ **Inviter par:** <@${usedInvite.inviter.id}>\n<:about:798292724955611186> ▸ **Invitation / Utilisation(s):** \`${usedInvite.code} - ${usedInvite.uses} use(s)\``)
            this.client.channels.cache.get(`815349506358509617`).send(logEmbed)
        }
        catch(err) {
            const logErrEmbed = new Discord.MessageEmbed()
            .setColor('#738dcd')
            .setThumbnail(guildMember.user.avatarURL())
            .setAuthor(`Join Log`, 'https://cdn.discordapp.com/emojis/663037912442732565.png?v=1')
            .setDescription(`<:user:795339614432002069> ▸ **Utilisateur:** <@${guildMember.user.id}>\n<:id:813426591085363260> ▸ **ID:** \`${guildMember.user.id}\`\n\n<:exclamation:813426548409237535> *Unable to fetch invite data (one use invite maybe?)*`)
            this.client.channels.cache.get(`815349506358509617`).send(logErrEmbed)
        }




        // Ajoute l'utilisateur dans la db pour les niveaux
        if (guildMember.guild.id == this.client.config.mainGuild && this.client.config.exp.enabled)
        {
            try {
                this.client.mysql.query("INSERT INTO `users` VALUES (?, ?, ?)", [guildMember.id, 0, 0]);
            }
            catch (e) {
                
            }
        }
    }
}