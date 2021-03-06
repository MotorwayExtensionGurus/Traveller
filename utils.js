module.exports = {
	getSortedList: () => {
		let sorted = require('./scores.json').players.sort((a, b) => parseInt(b.count) - parseInt(a.count));
		return sorted.map((player) => `**${getShow(sorted, player)}:** ${player.name}: \`${commafy(player.count)} {${player.accounts}}\``).join('\n');
		//return sorted.map((player) => `**${getShow(sorted, player)}:** <@${player.id}>: \`${commafy(player.count)} {${player.accounts}}\``).join('\n');
	},
	trueDate: () => {
		let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		let d = new Date();
		return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
	},
	commafy,
	divider: '--------------------------------'
}

function commafy(num) {
	let str = num.toString().split('.');
	if (str[0].length >= 5) str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
	if (str[1] && str[1].length >= 5) str[1] = str[1].replace(/(\d{3})/g, '$1 ');
	return str.join('.');
}

function getShow(sorted, player) {
	let position = sorted.indexOf(player) + 1;
	let show = position == 1 ? medals.first : position == 2 ? medals.second : position == 3 ? medals.third : position < 10 ? `${nbsp}${nbspss}${position}` : position == 11 ? `${nbsp}${position}` : `${nbsps}${position}`;
	return show;
}

const nbsp = ' ';
const nbsps = ' ';
const nbspss = ' ';

const medals = {
	first: ':first_place:',
	second: ':second_place:',
	third: ':third_place:'
};