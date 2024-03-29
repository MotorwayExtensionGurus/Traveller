const { MessageEmbed, GuildMember } = require('discord.js');
const fs = require('fs-extra');
const path = require('path');
const Octokit = require("@octokit/core").Octokit;
const octokit = new Octokit();
const botversion = require('./package.json').version;
const { getSortedList, getSortedListAsString, getTotal, trueDate, commafy, formatBytes } = require('./utils');
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
		let counter = require('./scores.json').players.find((player) => player.id == target.id);
		return msg.channel.send(!counter || counter == 0 ? 'This user hasn\'t mined anything, what a pleb!' : `${target} has mined \`${commafy(counter.count)}\` netherrack using **${counter.accounts}** accounts`, { 'allowedMentions': { 'users': [] } });
	},
	setnetherrack: (msg, args) => {
		let reply = '', count;
		if (verifyUser(msg)) {
			if (!args || !args.toString().match(/\b([0-9]+)/) || parseInt(args.toString()) < 0) reply = 'Value must be 0 or higher!';
			else {
				let oldSorted = getSortedList();
				let oldPreviousIndex = oldSorted.findIndex((player) => player.id == msg.author.id) + 1;

				let scores = require('./scores.json');
				let author = msg.author.id;
				let player = scores.players.find((player) => player.id == author);
				count = parseInt(args.toString().replace(/,/g, ''));

				if (count.toString() == NaN.toString()) reply = "fuck you";
				else if (player) player.count = count;
				else scores.players.push({
					id: author,
					name: msg.author.username,
					count,
					accounts: 1
				});

				try {
					let newPreviousIndex = getSortedList().findIndex((player) => player.id == msg.author.id) + 1;
					let newPrevious = getSortedList()[newPreviousIndex]
					if (newPrevious.name != oldSorted[oldPreviousIndex].name)
						reply = `\n\nTake that, <@${newPrevious.id}>! ||Their score: \`${commafy(newPrevious.count)}\`||`;
				}
				catch (e) { }

				fs.writeJson(path.join(__dirname, 'scores.json'), scores, { spaces: '\t' })
				if (count.toString() != NaN.toString()) reply = `Set ${msg.author}'s netherrack count to \`${commafy(count)}\``.concat(reply);
			}
		} else reply = 'This command can only be ran by Diggers!';
		msg.channel.send(new MessageEmbed()
			.setTitle('Set Netherrack')
			.setColor(MEG.color)
			.setDescription(reply)
			.setThumbnail(MEG.logo)
			.setTimestamp(new Date()))
			.then(() => applyRoles(msg.member, count))
			.catch((err) => msg.channel.send(err));
	},
	setaccounts: (msg, args) => {
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
		msg.channel.send(new MessageEmbed()
			.setTitle('Set Accounts')
			.setColor(MEG.color)
			.setDescription(reply)
			.setTimestamp(new Date()));
	},
	nickname: (msg, args) => {
		let noArgs = !args;
		let reply;
		if (verifyUser(msg)) {
			if (args.length > 0 && (args.toString().replace(/\W/g, '').length < 3 || args.toString().replace(/\W/g, '').length > 16)) reply = 'Must be between 3 & 16 characters (inclusive)';
			else {
				let scores = require('./scores.json');
				let author = msg.author.id;
				let player = scores.players.find((player) => player.id == author);
				let newName = args.length < 1 ? msg.author.username : args.toString().replace(/\W/g, '');

				if (player) player.name = newName;
				else scores.players.push({
					id: author,
					name: newName,
					count: 0,
					accounts: 1
				});

				fs.writeJson(path.join(__dirname, 'scores.json'), scores, { spaces: '\t' })
				reply = `Set ${msg.author}'s nickname to \`${newName}\``;
			}
		} else reply = 'This command can only be ran by Diggers!';
		msg.channel.send(new MessageEmbed()
			.setTitle('Set Nickname')
			.setColor(MEG.color)
			.setDescription(reply)
			.setTimestamp(new Date()));
	},
	hwt: async (msg, args) => {
		msg.channel.send('This command is outdated! Download Lambda Client for the new HWT!');
		return;
		if (args.length == 0)
			octokit.request('GET /repos/{owner}/{repo}/releases', { owner: 'avanatiker', repo: 'client' })
				.then(({ data }) => data[0])
				.then((release) => {
					let { name, html_url, assets, author, published_at, body } = release;
					let { browser_download_url, size, download_count } = assets[0];
					body = ('**Changelog:**').concat(body.split('Changelog:')[1].split('\r\n\r\n')[0]).replace(/\[x\] /gim, '').replace(/\n-/gim, '\n•');

					msg.channel.send(new MessageEmbed()
						.setTitle(name)
						.setURL(html_url)
						.setThumbnail('https://jmoore.dev/files/HWT-icon.png')
						.setColor('#987ff3')
						.setAuthor('Made by Constructor', author.avatar_url, author.html_url)
						.setDescription(`${body}\n\n**Click [here](${browser_download_url}) to download**\nSize: **\`${formatBytes(size)}\`**\nDownloads: **\`${download_count}\`**\n\Developer: <@295974862646804480>`)
						.setTimestamp(published_at));
				}).catch(console.error);
		else {
			let runNumber, HtmlUrl;
			octokit.request('GET /repos/{owner}/{repo}/actions/runs', { owner: 'avanatiker', repo: 'client' })
				.then(({ data }) => {
					let run = data.workflow_runs[0];
					runNumber = run.run_number;
					HtmlUrl = run.html_url;
					return run.id;
				})
				.then((run_id) => octokit.request('GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts', { owner: 'avanatiker', repo: 'client', run_id }))
				.then(({ data }) => {
					let { id, size_in_bytes, created_at } = data.artifacts[0];

					msg.channel.send(new MessageEmbed()
						.setTitle(`HWT dev build #${runNumber}`)
						.setURL(HtmlUrl)
						.setThumbnail('https://jmoore.dev/files/HWT-icon.png')
						.setColor('#987ff3')
						.setDescription(`Size: **\`${formatBytes(size_in_bytes)}\`**\n\n**Disclaimer:** these builds are **experimental** and **untested**. Use with caution. You must be signed in to GitHub to access the download.`)
						.setFooter(`Artifact ID: ${id}`)
						.setTimestamp(created_at));
				})
				.catch(console.error);
		}
	},
	smp: (msg, args) => {
		msg.channel.send(new MessageEmbed()
			.setTitle(`MEG's SMP`)
			.setColor(MEG.color)
			.setDescription(verifyUser(msg, (role) => role.id == '876892752607055922') ? fs.readFileSync('smp.md') : 'no')
			.setThumbnail(MEG.logo)
			.setTimestamp(new Date()))
			.catch((err) => msg.channel.send(err))
	}
};

function buildTopEmbed(official = false) {
	return new MessageEmbed()
		.setColor(MEG.color)
		.setTitle(`Leaderboard (Netherrack Mined)`)
		.setFooter(`Total: ${getTotal().count} dug by ${getTotal().accounts} accounts`)
		.setThumbnail(MEG.logo)
		.setDescription(getSortedListAsString())
}

const DIGGER_WHITELIST = [
	'883963604351717407', // DIGGER role
	'716573337383469107', // PROSPECTIVE role
	'428418366831591424', // Tullybob (user)
];
function verifyUser(msg, condition = (role) => DIGGER_WHITELIST.includes(role.id)) {
	return DIGGER_WHITELIST.includes(msg.author.id) || msg.member.roles.cache.some((role) => condition(role));
}

const DIGGER_RANKS = {
	2_000_000: '852217024276856913',
	5_000_000: '852217861136318465',
	10_000_000: '852218174736039946',
	20_000_000: '852219382935584838',
	50_000_000: '852220327848837182',
	100_000_000: '852377027645931521',
	150_000_000: '872511544175493213',
	250_000_000: '872511864670670939',
	500_000_000: '872513275521298452',
};

/**
 * @param {GuildMember} member - The member to potentially add ranks to
 * @param {number} score - Their current score
 */
function applyRoles(member, score) {
	return new Promise((resolve, reject) => {
		const roles = Object.entries(DIGGER_RANKS)
			.filter(([rank,]) => score >= parseInt(rank))
			.map(([, roleId]) => roleId);
		const addRole = roles.pop();

		member.roles.remove(roles)
			.then(() => member.roles.add(addRole))
			.then(resolve)
			.catch(reject);
	});
}

const commandsList = [
	`\`${MEG.prefix}help\` - Displays this help page`,
	`\`${MEG.prefix}version\` - Display the bot version`,
	`\`${MEG.prefix}top\` - Print the digger netherrack leaderboard`,
	`\`${MEG.prefix}officialtop\` - Prints an offically formatted netherrack leaderboard`,
	`\`${MEG.prefix}netherrack [digger]\` - Check a diggers netherrack count`,
	`\`${MEG.prefix}setnetherrack\` - Set your own netherrack count`,
	`\`${MEG.prefix}setaccounts\` - Set how many accounts contribute to your count`,
	`\`${MEG.prefix}nickname\` - Set your leaderboard nickname`,
	`\`${MEG.prefix}hwt\` - Grab info for the latest release of Highway Tools by <@295974862646804480>`
];