const Command = require("../../[base]/Commands.js");
const Discord = require("discord.js");
const parser  = require("../../[helpers]/parser");

module.exports = class Level extends Command 
{
    constructor (client) 
    {
        super(client, {
            name: "level",
            dirname: __dirname,
            enabled: true,
            guildOnly: true,
            aliases: [ "rank", "lvl" ],
            memberPerms: [],
            botPerms: [ "SEND_MESSAGES" ],
            nsfw: false,
            ownerOnly: false,
            mainGuildOnly: true
        });
    }

    /** 
     * @param {Discord.Message} message
     * @param {string[]} args
    */
    async run (message, args) 
    {
        const client = this.client;

        let member = message.member;
    
        if (args[0] && parser.parseMember(message.guild, args[0])) {
            member = parser.parseMember(message.guild, args[0]);
        }
    
        if (member.user.bot) {
            message.channel.send("\\❌ Les bots n'ont pas de niveaux.");
            return;
        }
    
        let data = (await client.mysql.query("SELECT * FROM `users` ORDER BY `exp` DESC"))[0];
    
        let userIdx = data.findIndex(r => r["user_id"] == member.user.id);
        let userRow = data[userIdx];
    
        if (!userRow)
        {
            message.channel.send("\\❌ L'utilisateur n'a pas encore de données d'expérience.");
            return;
        }
    
        let userLvl = client.levelsHelper.expToLevel(userRow["exp"]);
    
        let embed = new Discord.MessageEmbed()
            .setColor("#738dcd")
            .setTitle(member.user.tag)
            .addField("Rank", "#" + (userIdx + 1), true)
            .addField("Level", userLvl, true)
            .addField(
                "Expérience",
                (userRow["exp"] - client.levelsHelper.levelToMinExp(userLvl)).toString() 
                + "/" + 
                (client.levelsHelper.levelToMinExp(userLvl + 1) - client.levelsHelper.levelToMinExp(userLvl)).toString(),
                true
            )
            .addField("Messages", userRow["msg_count"], true);
    
        let img = await client.levelsHelper.genThumbnail(member, userIdx + 1);

        if (img[0] == false) {
            embed.attachFiles([
                new Discord.MessageAttachment(img[1], "thumbnail.png"),
            ]);

            embed.setThumbnail("attachment://thumbnail.png");
        } else embed.setThumbnail(img[1]);

        message.channel.send(embed);
    }
}