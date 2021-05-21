const MessageEmbed = require('discord.js').MessageEmbed;
const fs = require('fs-extra');
const path = require('path');
const Octokit = require("@octokit/core").Octokit;
const octokit = new Octokit();
const botversion = require('./package.json').version;
const { getSortedList, getTotal, trueDate, commafy, formatBytes } = require('./utils');
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
	setnetherrack: (msg, args) => {
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
		msg.channel.send(reply, { 'allowedMentions': { 'users': [] } });
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
		msg.channel.send(reply, { 'allowedMentions': { 'users': [] } });
	},
	hwt: async (msg, args) => {
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
	}
};

function buildTopEmbed(official = false) {
	return new MessageEmbed()
		.setColor(MEG.color)
		.setTitle(`Leaderboard${official ? '' : ' (unofficial)'}`)
		.setFooter(`Total: ${getTotal().count} dug by ${getTotal().accounts} accounts`)
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
	`\`${MEG.prefix}nickname\` - Set your leaderboard nickname`,
	`\`${MEG.prefix}hwt\ - Grab info for the latest release of Highway Tools by <@295974862646804480>`
];