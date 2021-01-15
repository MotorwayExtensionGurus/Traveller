const Discord = require('discord.js');
require('dotenv').config()
const bot = new Discord.Client();
//const fetch = require('node-fetch');
//const querystring = require('querystring');
//const trim = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);
//const date = Date.now()

const botversion = '0.0.1';
const prefix = '?';

//Imports
var version = require('./cmds/version.js');

bot.on("ready", () => {
    console.log(`\n------------\nMotorway Bot v${botversion}\nRunning as ${bot.user.tag}\nMade by ToxicAven#3678\nLicensed under GNU GPL-3.0\n------------\n`)
});

bot.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();


    //Version Command
    if (command === 'version') {
        console.log(`Version Command Issued`)
        version.custom(botversion, message);
    }
});

bot.on("ready", async() => {
    bot.user.setActivity("the highways", {type: 'WATCHING'});
});

bot.login(process.env.TOKEN);