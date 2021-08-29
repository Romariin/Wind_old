const Discord = require('discord.js');
const misc = require("../[globalConfig]/misc.js");
const config = require('../[globalConfig]/globalConfig.json');
module.exports = class {
  constructor (client) {
    this.client = client;
  }
  async run (event, message) {

    switch (event.t) {
    case "MESSAGE_REACTION_ADD":

    misc.getConfig().messageListeners.forEach(l => {
      let listener = l.split(";");
      if (event.d.message_id == listener[0] && event.d.emoji.name == listener[1]) {
        this.client.guilds.fetch(event.d.guild_id).then((fetchedData) => {
          fetchedData.members.fetch(event.d.user_id).then((member) => {
            member.roles.add(listener[2]);
            if (event.d.emoji.name === '✅') {
              this.client.channels.cache.get(`815349506832990230`).send(`<:user:795339614432002069> ▸ Bienvenue à <@${event.d.user_id}> sur **Mistral-Servers.co**`)
            }
            const logEmbed = new Discord.MessageEmbed()
            .setColor('#738dcd')
            .setDescription(`<:about:798292724955611186> Rôles: <@${event.d.user_id}> \`➕\` <@&${listener[2]}>`)
            this.client.channels.cache.get(`815349506358509617`).send(logEmbed)
          });
        })}
    });
    break;

    case "MESSAGE_REACTION_REMOVE":
    misc.getConfig().messageListeners.forEach(l => {
      let listener = l.split(";");
      if (event.d.message_id == listener[0] && event.d.emoji.name == listener[1]) {
        this.client.guilds.fetch(event.d.guild_id).then((fetchedData) => {
          fetchedData.members.fetch(event.d.user_id).then((member) => {
            member.roles.remove(listener[2]);
            if (event.d.emoji.name === '✅') return;
            const logsEmbed = new Discord.MessageEmbed()
            .setColor('#738dcd')
            .setDescription(`<:about:798292724955611186> Rôles: <@${event.d.user_id}> \`➖\` <@&${listener[2]}>`)
            this.client.channels.cache.get(`815349506358509617`).send(logsEmbed)
          });
        })}
    });
    break;
}}}
