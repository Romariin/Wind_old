const path = require("path");
const Wind = require("./Wind");


module.exports = class Commands {
    constructor(client, {
        name = null,
        desc = null,
        usage = null,
        dirname = false,
        enabled = true,
        guildOnly = false,
        aliases = new Array(),
        botPerms = new Array(),
        memberPerms = new Array(),
        nsfw = false,
        ownerOnly = false,
        mainGuildOnly = false   /** Si true, aussi mettre guildOnly en true */
    })
    {
    const category = (dirname ? dirname.split(path.sep)[parseInt(dirname.split(path.sep).length-1, 10)] : "Other");
    /** @type {Wind} */
    this.client = client;
    this.conf = { enabled, guildOnly, memberPerms, botPerms, nsfw, ownerOnly, mainGuildOnly };
    this.help = { name, desc, usage, category, aliases };
    }
};