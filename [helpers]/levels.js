const Discord = require('discord.js');
const Wind = require('../[base]/Wind');
const childProc = require("child_process");

/**
 * Vérifie si le string est un URL valide.
 */
function isURL(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;  
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

/**
 * Retourne un int aléatoire entre deux valeurs. (Valeurs comprises)
 */
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * String.prototype.startsWith() mais avec plusieurs éléments
 * @param {string} string
 * @param {string[]} searchStrings
 */
function startsWithAny(string, searchStrings)
{
    for (let searchString of searchStrings)
    {
        if (string.startsWith(searchString))
            return true;
    }

    return false;
}

module.exports = class Levels {
    /** @param {Wind} client */
    constructor(client)
    {
        this.client = client;
        this.config = client.config.exp;
        this.gainLocked = [];
    }

    /**
     * Ajoute l'exp à l'utilisateur en fonction de son message.
     * @param {Discord.Message} message 
     */
    async handleGain(message)
    {
        // Sépare les messages aux espaces en mots
        let splitMsg = message.content.split(/\s+/);

        let expGain = 0;

        if (startsWithAny(message.content, ["!", "$", "?", ".", ";", "%", "-"])) {
            // Quelques points pour les commandes de bot
            let exp = this.config.cmdMsgExp;
            expGain = randInt(exp[0], exp[1]);
        } else {
            if (message.cleanContent.length < 7 || splitMsg.length <= 1 || isURL(splitMsg[0]))
            {
                // Points pour un message courts, d'un seul mot, ou un lien
                let exp = this.config.shortMsgExp;
                expGain = randInt(exp[0], exp[1]);
            }
            // Points pour un long message, avec un léger multiplicateur lié à la longueur du message (jusqu'à un max)
            else
            {
                let exp = this.config.longMsgExp;
                expGain = exp[0] + (message.cleanContent.length <= 100 ? Math.round(message.cleanContent.length * 0.1) : exp[1]);
            }
        }

        if (!this.gainLocked.includes(message.author.id))
        {
            // Ajoute le timeout pour que l'utilisateur ne regagne pas d'xp en X temps
            this.gainLocked.push(message.author.id);

            this.client.mysql.query("SELECT * FROM `users` WHERE `user_id`=?", [message.author.id]).then(res => {
                let row = res[0][0];
                
                let oldLevel = this.expToLevel(row["exp"]);
                let newLevel = this.expToLevel(row["exp"] + expGain);

                // Effectue les actions nécessaires si l'utilisateur level up
                if (newLevel > oldLevel)
                {
                    this.manageLvlUp(message.member, message.channel, oldLevel, newLevel);
                }

                this.client.mysql.query(
                    "UPDATE `users` SET `exp`=`exp`+?,`msg_count`=`msg_count`+? WHERE `user_id`=?", 
                    [expGain, 1, message.author.id]
                );
            });
            
            setTimeout(() => {
                this.gainLocked.splice(this.gainLocked.indexOf(message.author.id), 1);
            }, this.config.gainTimeout * 1000);
        }
        else
        {
            // Ajoute juste le message, pas l'exp
            this.client.mysql.query(
                "UPDATE `users` SET `msg_count`=`msg_count`+? WHERE `user_id`=?",
                [1, message.author.id]
            );
        }
    }

    /**
     * Traduit le nombre d'xp en son niveau correspondant
     */
    expToLevel(exp)
    {
        let c = this.config.formulaCoeff;

        let level = (c + Math.sqrt((c*c) - (c*4) * -exp)) / (c*2);

        return Math.floor(level);
    }

    /**
     * Traduit un niveau en l'xp requis pour l'atteindre
     */
    levelToMinExp(level)
    {
        let c = this.config.formulaCoeff;

        let x = level;

        return (c * x * x) - (c * x);
    }

    /**
     * S'exécute lordqu'un utilisateur levelup
     * @param {Discord.GuildMember} member 
     * @param {Discord.TextChannel} channel 
     */
    async manageLvlUp(member, channel, oldLevel, newLevel)
    {
        let lvlActions = (await this.client.mysql.query("SELECT * FROM `level_actions`"))[0];
    
        lvlActions.forEach((lvlAction) => {
            if (lvlAction["level"] == newLevel || lvlAction["level"] == 0) {
                switch (lvlAction["action"]) {
                    case "message":
                        // Envoie un message dans le channel où l'utilisateur a levelup
                        channel.send(
                            lvlAction["data"]
                                .replace("$DISPLAY_NAME", member.displayName)
                                .replace("$USERNAME", member.user.username)
                                .replace("$MENTION", member)
                                .replace("$OLD_LEVEL", oldLevel)
                                .replace("$NEW_LEVEL", newLevel)
                                .replace("$SERVER", member.guild.name)
                        );
                        break;
    
                    case "dm":
                        // Envoie un message privé à l'utilisateur
                        member.send(
                            lvlAction["data"]
                                .replace("$DISPLAY_NAME", member.displayName)
                                .replace("$USERNAME", member.user.username)
                                .replace("$MENTION", member)
                                .replace("$OLD_LEVEL", oldLevel)
                                .replace("$NEW_LEVEL", newLevel)
                                .replace("$SERVER", member.guild.name)
                        );
                        break;
    
                    case "addRole":
                        // Donne un rôle à l'utilisateur
                        let role2A = member.guild.roles.cache.get(
                            lvlAction["data"]
                        );
    
                        if (role2A) {
                            member.roles.add(role2A);
                        }
    
                        break;
    
                    case "remRole":
                        // Retire un rôle à l'utilisateur
                        let role2R = member.guild.roles.cache.get(
                            lvlAction["data"]
                        );
    
                        if (role2R && member.roles.cache.has(role2R.id)) {
                            member.roles.remove(role2R);
                        }
    
                        break;
                }
            }
        });
    }

    /**
     * Génère l'image de s!top de l'utilisateur et la mets en cache pour réutilisation
     * (Parce que opération coûteuse en resources et lente)
     * @param {Discord.GuildMember} member 
     * @returns {Promise<[boolean, string|Buffer]>} [`true si cache | false si buffer`, `lien si cache | Buffer si fraîchement générée`]
     */
    genThumbnail (member, rank, color = "default") 
    {
        return new Promise(async (resolve) => {
            let avatarUrl = member.user.displayAvatarURL({ format: "png" });
            let splitAvUrl = avatarUrl.split("/");

            let cachedUser = (await this.client.mysql.query("SELECT * FROM `cache` WHERE `user_id`=?", [member.id]))[0][0];

            if (cachedUser && 
                cachedUser["top_img_url"] && 

                // Format du nom de l'image : ProfilePicID-RankNumber-Color
                // En gros, vérifie juste si l'utilisateur a déjà sa pfp générée dans le cache
                cachedUser["top_img_url"].endsWith(`${splitAvUrl[splitAvUrl.length-1].split(".")[0]}-${rank.toString()}-${color}.png`)) {

                resolve([true, cachedUser["top_img_url"]]);
                return;
            }

            // Node-canvas n'est pas compatible avec les worker_threads...
            // Done on utilise un child process
            const worker = childProc.fork(
                __dirname + "/../[workers]/topavatar.js",
                [avatarUrl, rank],

                // On ignore les logs normaux, y'a un warning de merde avec canvas
                { stdio: ["pipe", "ignore", "pipe", "ipc"] }
            );

            worker.on("message", (buffer) => {
                resolve([false, Buffer.from(buffer)]);

                /** @type {Discord.TextChannel} */
                let cacheChannel = this.client.channels.cache.get(
                    "821243867042021387"
                );

                cacheChannel
                    // Voir au dessus pour le format du nom de l'image
                    .send(
                        new Discord.MessageAttachment(
                            Buffer.from(buffer), 
                            `${splitAvUrl[splitAvUrl.length-1].split(".")[0]}-${rank.toString()}-${color}.png`
                        )
                    )
                    .then((msg) => {
                        if (msg.attachments.size > 0) // msg.attachments.first().url
                        {
                            if (cachedUser)
                            {
                                this.client.mysql.query(
                                    "UPDATE `cache` SET `top_img_url`=? WHERE `user_id`=?", 
                                    [msg.attachments.first().url, member.id]
                                );
                            }
                            else
                            {
                                this.client.mysql.query(
                                    "INSERT INTO `cache` VALUES (?, ?)", 
                                    [member.id, msg.attachments.first().url]
                                );
                            }
                        }
                    });
            });
        });
    }
}