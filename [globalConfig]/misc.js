const fs = require("fs");

module.exports = {
  getConfig: function(raw = false) {
        if (raw) return fs.readFileSync(`${__dirname}/globalConfig.json`);
        else return JSON.parse(fs.readFileSync(`${__dirname}/globalConfig.json`));
    },
}
