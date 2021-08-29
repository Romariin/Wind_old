const Discord = require("discord.js");

let second = 1000;
let minute = 60 * second;
let hour = 60 * minute;
let day = 24 * hour;
let week = 7 * day;
let month = 30 * day;
let year = 364 * day;

module.exports = class Parser {
    /**
     * @param {Discord.Guild} guild
     * @param {string} text
     * @returns undefined si impossible de trouver, GuildMember sinon
     */
    static parseMember (guild, text) 
    {
        // Mention avec nickname (d'où le '!')
        if (text.startsWith("<@!") && text.endsWith(">")) {
            return guild.member(text.slice(3, text.length - 1));
        }

        // Mention sans nickname
        if (text.startsWith("<@") && text.endsWith(">")) {
            return guild.member(text.slice(2, text.length - 1));
        }

        // Parsing user id
        if ((text.length == 18 || text.length == 17) && guild.member(text))
        {
            return guild.member(text);
        }

        for (let memberCombo of guild.members.cache) {
            let mem = memberCombo[1];

            if (mem.user.id == text) return mem;

            if (mem.user.tag.toLowerCase() == text.toLowerCase()) return mem;

            if (mem.displayName.toLowerCase() == text.toLowerCase()) return mem;

            if (
                mem.displayName.toLowerCase().startsWith(text.toLowerCase()) &&
                text.length >= Math.max(3, mem.displayName.length / 3)
            )
                return mem;
        }

        return undefined;
    }

    /**
     * @param {string} text Au format 1y2mo3w4d5h6m5s
     * @returns null si échec du parsing, durée en ms si succès
     */
    static parseTimespan (text) 
    {
        // Regex d'essentials
        // https://github.com/EssentialsX/Essentials/blob/baab65d776be713b5fa2cf1ef492739edb75aaa7/Essentials/src/com/earth2me/essentials/utils/DateUtil.java

        // Durée en ms
        let timespan = 0;

        let timeRegex = new RegExp(
            "(?:([0-9]+)\\s*y[a-z]*[,\\s]*)?" + // Années
            "(?:([0-9]+)\\s*mo[a-z]*[,\\s]*)?" + // Mois
            "(?:([0-9]+)\\s*w[a-z]*[,\\s]*)?" + // Semaines
            "(?:([0-9]+)\\s*d[a-z]*[,\\s]*)?" + // Jours
            "(?:([0-9]+)\\s*h[a-z]*[,\\s]*)?" + // Heures
            "(?:([0-9]+)\\s*m[a-z]*[,\\s]*)?" + // Minutes
                "(?:([0-9]+)\\s*(?:s[a-z]*)?)?", // Secondes
            "i"
        );

        let matches = timeRegex.exec(text);

        let validTime = false;

        // On commence à 1 pour sauter le résultat complet
        for (let i = 1; i < matches.length; i++) {
            let match = matches[i];

            if (match == undefined) continue;

            validTime = true;

            let coeff = parseInt(match);

            switch (i) {
                case 1:
                    timespan += coeff * year;
                    break;

                case 2:
                    timespan += coeff * month;
                    break;

                case 3:
                    timespan += coeff * week;
                    break;

                case 4:
                    timespan += coeff * day;
                    break;

                case 5:
                    timespan += coeff * hour;
                    break;

                case 6:
                    timespan += coeff * minute;
                    break;

                case 7:
                    timespan += coeff * second;
                    break;
            }
        }

        if (!validTime) return null;

        return timespan;
    }
}