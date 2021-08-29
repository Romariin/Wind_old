const { bgBlue, black, green, cyan } = require("chalk");

// Load Wind class
const Wind = require("./[base]/Wind"),
    client = new Wind();


util = require("util"),
    fs = require("fs"),
    readdir = util.promisify(fs.readdir);

// Load Commands [modules]
const init = async () => {
    console.clear();
    const directories = await readdir("./[modules]")
    console.log(`${green(`► Loading a total of ${directories.length} module(s)`)}`);
    directories.forEach(async (dir) => {
        const commands = await readdir("./[modules]/" + dir + "/");
        commands.filter((cmd) => cmd.split(".").pop() === "js").forEach((cmd) => {
            const response = client.loadCommand("./[modules]/" + dir, cmd);
            if (response) {
                client.logger.log(response, "error");
            }
        })
    })

    // Then we load events, which will include our message and ready event.
    const evtFiles = await readdir("./[events]/");
    console.log(`•──────────────────────────────•`);
    console.log(`${cyan(`► Loading a total of ${evtFiles.length} event(s).`)}`);
    evtFiles.forEach((file) => {
        const eventName = file.split(".")[0];
        console.log(`${cyan(`∟ Loading Event: ${eventName}`)}`);
        const event = new (require(`./[events]/${file}`))(client);
        client.on(eventName, (...args) => event.run(...args));
        delete require.cache[require.resolve(`./[events]/${file}`)];
    });

    client.login(client.config.token)
}



init();

process.on("unhandledRejection", (err) => {
	console.error(err);
});
