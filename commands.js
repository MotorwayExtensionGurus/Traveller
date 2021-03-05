const MessageEmbed = require('discord.js').MessageEmbed;
const fs = require('fs-extra');
const path = require('path');
const botversion = require('./package.json').version;
const { getSortedList, trueDate, commafy } = require('./utils');
const MEG = require('./meg.json');

const hardcode_whitelist = ['295974862646804480'];

module.exports = {
	version: (msg) =>
		msg.channel.send(new MessageEmbed()
			.setColor(MEG.color)
			.setTitle(`Traveller v${botversion}`)
			.setFooter(`Created by ${require('./package.json').author}`)),
	help: (msg) =>
		msg.channel.send(new MessageEmbed()
			.setColor(MEG.color)
			.setTitle('Traveller Help')
			.setDescription(commandsList)),
	top: (msg) => msg.channel.send(buildTopEmbed()),
	officialtop: (msg) => {
		msg.member.roles.cache.some((role) => ['ADMIN'].includes(role.name))
			? msg.channel.send({ files: ['./netherrack.png'] }).then((_botMsg) => msg.channel.send(buildTopEmbed(true).setFooter(`Last updated: ${trueDate()}`)))
			: msg.channel.send('This command can only be ran by Admins!')
	},
	netherrack: (msg) => {
		let target = msg.mentions.users.first() || msg.author;
		let counter = require('./scores.json').players.find((player) => player.id == target.id);
		return msg.channel.send(!counter || counter == 0 ? 'This user hasn\'t mined anything, what a pleb!' : `${target} has mined \`${commafy(counter.count)}\` netherrack using **${counter.accounts}** accounts`, { 'allowedMentions': { 'users': [] } });
	},
	setnetherrack: async (msg, args) => {
		let reply;
		if (verifyUser(msg)) {
			if (!args || !args.toString().match(/\b([0-9]+)/) || parseInt(args.toString()) < 0) reply = 'Value must be 0 or higher!';
			else {
				let scores = require('./scores.json');
				let author = msg.author.id;
				let player = scores.players.find((player) => player.id == author);
				let count = parseInt(args.toString().replace(/,/g, ''));

				if (count.toString() == NaN.toString()) reply = "fuck you";
				else if (player) player.count = count;
				else scores.players.push({
					id: author,
					name: msg.author.username,
					count,
					accounts: 1
				});

				fs.writeJson(path.join(__dirname, 'scores.json'), scores, { spaces: '\t' })
				if (count.toString() != NaN.toString()) reply = `Set ${msg.author}'s netherrack count to \`${commafy(count)}\``;
			}
		} else reply = 'This command can only be ran by Diggers!';
		msg.channel.send(reply, { 'allowedMentions': { 'users': [] } });
	},
	setaccounts: async (msg, args) => {
		let reply;
		if (verifyUser(msg)) {
			if (!args || !args.toString().match(/\b([0-9]+)/) || parseInt(args.toString()) < 1) reply = 'Value must be 1 or higher!';
			else {
				let scores = require('./scores.json');
				let author = msg.author.id;
				let player = scores.players.find((player) => player.id == author);
				let count = parseInt(args.toString().replace(/,/g, ''));

				if (count.toString() == NaN.toString()) reply = "fuck you";
				else if (player) player.accounts = count;
				else scores.players.push({
					id: author,
					name: msg.author.username,
					count: 0,
					accounts: count
				});

				fs.writeJson(path.join(__dirname, 'scores.json'), scores, { spaces: '\t' })
				if (count.toString() != NaN.toString()) reply = `Set ${msg.author}'s accounts to \`${commafy(count)}\``;
			}
		} else reply = 'This command can only be ran by Diggers!';
		msg.channel.send(reply, { 'allowedMentions': { 'users': [] } });
	}
};

function buildTopEmbed(official = false) {
	return new MessageEmbed()
		.setColor(MEG.color)
		.setTitle(`Leaderboard${official ? '' : ' (unofficial)'}`)
		.setThumbnail(MEG.logo)
		.setDescription(getSortedList())
}

function verifyUser(msg) {
	return msg.member.roles.cache.some((role) => role.name.includes('DIGGER') || role.name.includes('PROSPECTIVE')) || hardcode_whitelist.includes(msg.author.id);
}

const commandsList = [
	`\`${MEG.prefix}help\` - Displays this help page`,
	`\`${MEG.prefix}version\` - Display the bot version`,
	`\`${MEG.prefix}top\` - Print the digger netherrack leaderboard`,
	`\`${MEG.prefix}officialtop\` - Prints an offically formatted netherrack leaderboard`,
	`\`${MEG.prefix}netherrack [digger]\` - Check a diggers netherrack count`,
	`\`${MEG.prefix}setnetherrack\` - Set your own netherrack count`,
	`\`${MEG.prefix}setaccounts\` - Set how many accounts contribute to your count`,
];