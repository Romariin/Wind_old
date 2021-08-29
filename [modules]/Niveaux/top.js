const Command = require("../../[base]/Commands.js");
const Discord = require("discord.js");

function getFormattedLeader(rank, user, exp, messageCount, lvl) {
    let level = lvl.expToLevel(exp);
    let currLevelExp = lvl.levelToMinExp(level);
    let nextLevelExp = lvl.levelToMinExp(level + 1);

    return `**${rank}. ${user}** \n\`Niveau: ${level}\` \`Exp: ${exp-currLevelExp}/${nextLevelExp-currLevelExp}\`\n\`Messages: ${messageCount}\`\n\n`;
}

module.exports = class Level extends Command 
{
    constructor (client) 
    {
        super(client, {
            name: "top",
            dirname: __dirname,
            enabled: true,
            guildOnly: true,
            aliases: [ "leaderboard", "lb" ],
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
        let client = this.client;

        let data = (await client.mysql.query("SELECT * FROM `users` ORDER BY `exp` DESC"))[0];

        let userIdx = data.findIndex(r => r["user_id"] == message.member.user.id);
        let userRow = data[userIdx];
        let topLength = Math.min(5, data.length);
        let topRows = [...data];
        topRows.splice(topLength);

        let embed = new Discord.MessageEmbed()
            .setColor(0x2f3136)
            .setAuthor("Leaderboard");

        let topText = "";

        for (let [idx, row] of topRows.entries())
        {
            topText += getFormattedLeader(
                idx + 1, 
                `<@${row["user_id"]}>`, 
                row["exp"], 
                row["msg_count"], 
                this.client.levelsHelper
            );
        }

        embed.addField(`Top ${topLength}`, topLength > 0 ? topText : "Aucun utilisateur à afficher.");

        if (!topRows.includes(userRow))
        {
            embed.addField(
                "Vous", 
                getFormattedLeader(
                    userIdx + 1, 
                    message.member, 
                    userRow["exp"], 
                    userRow["msg_count"], 
                    this.client.levelsHelper
                )
            );
        }

        let img = await this.client.levelsHelper.genThumbnail(message.guild.member(topRows[0]["user_id"]), 1);

        if (img[0] == false) {
            embed.attachFiles([
                new Discord.MessageAttachment(img[1], "thumbnail.png"),
            ]);

            embed.setThumbnail("attachment://thumbnail.png");
        } else embed.setThumbnail(img[1]);

        message.channel.send(embed);
    }
}