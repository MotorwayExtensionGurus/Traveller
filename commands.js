const MessageEmbed = require('discord.js').MessageEmbed;
const botversion = require('./package.json').version;
const { getSortedList, trueDate, currency, commafy } = require('./utils');
const MEG = require('./meg.json');

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
		let counter = currency.getBalance(target.id);
		return msg.channel.send(counter == 0 ? 'This user hasn\'t mined anything, what a pleb!' : `${target} has mined \`${commafy(counter)}\` netherrack`, { 'allowedMentions': { 'users': [] } });
	},
	setnetherrack: async (msg, args) => {
		let reply;
		if (msg.member.roles.cache.some((role) => ['DIGGER'].includes(role.name))) {
			if (!args || !args.toString().match(/\b([0-9]+)/)) reply = 'Value must be numbers only!';
			else {
				await currency.add(msg.author.id, parseFloat(args.toString().replace(/,/g, '')));
				reply = `Set ${msg.author}'s netherrack count to \`${commafy(currency.getBalance(msg.author.id))}\``;
			}
		} else reply = 'This command can only be ran by Diggers!';
		msg.channel.send(reply, { 'allowedMentions': { 'users': [] } });
	},
	fixcount: (msg) => {
		let reply;
		if (msg.member.roles.cache.some((role) => ['DIGGER'].includes(role.name))) {
			currency.add(msg.author.id, -currency.getBalance(msg.author.id));
			reply = 'Fixed Netherrack count';
		} else reply = 'This command can only be ran by Diggers!';
		msg.channel.send(reply);
	}
};

function buildTopEmbed(official = false) {
	return new MessageEmbed()
		.setColor(MEG.color)
		.setTitle(`Leaderboard${official ? '' : ' (unofficial)'}`)
		.setThumbnail(MEG.logo)
		.setDescription(getSortedList())
}

const medals = {
	first: ':first_place:',
	second: ':second_place:',
	third: ':third_place:'
}

const commandsList = [
	`\`${MEG.prefix}help\` - Displays this help page`,
	`\`${MEG.prefix}version\` - Display the bot version`,
	`\`${MEG.prefix}top\` - Print the digger netherrack leaderboard`,
	`\`${MEG.prefix}officialtop\` - Prints an offically formatted netherrack leaderboard`,
	`\`${MEG.prefix}netherrack [digger]\` - Check a diggers netherrack count`,
	`\`${MEG.prefix}setnetherrack\` - Set your own netherrack count`,
	`\`${MEG.prefix}fixcount\` - If you somehow fuck up the counter, reset it to zero`,
];