/**
 * @author ToxicAven (ToxicAven#3678), tycrek (tycrek#0001)
 * MEG-Bot
 */

// Config
require('dotenv').config()

// Imports
const Discord = require('discord.js');
const utils = require('./utils');
const botversion = require('./package.json').version;
const MEG = require('./meg.json');

// Build the bot
const bot = new Discord.Client();

// Runs when bot signs in successfully
bot.on('ready', async () => {
	console.log(`\n${utils.divider}\nTraveller v${botversion}\nRunning as: ${bot.user.tag}\nMade by ToxicAven#3678\nRewrite by Tycrek#0001\nLicensed under GNU GPL-3.0\n${utils.divider}\n`)
	bot.user.setActivity('with Pigmen', { type: 'PLAYING' });
});

// Command processor
bot.on('message', async (message) => {
	if (!message.content.startsWith(MEG.prefix) || message.author.bot) return;

	const args = message.content.slice(MEG.prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	let commands = require('./commands');
	if (commands[command]) return commands[command](message, args);
});

// Sign in (token stored in .env file)
bot.login(process.env.TOKEN);

module.exports = {
	bot
};