const Discord = require('discord.js');
const { Users } = require('./dbObjects');

const currency = new Discord.Collection();

module.exports = {
	currency,
	initCurrency: async () => {
		Reflect.defineProperty(currency, 'add', {
			value: async function add(id, amount) {
				if (currency.has(id)) {
					let user = currency.get(id);
					user.balance = Number(amount);
					return user.save();
				} else {
					let newUser = await Users.create({ user_id: id, balance: Number(amount) });
					currency.set(id, newUser);
					let user = await add(id, amount);
					return user;
				}
			}
		});

		Reflect.defineProperty(currency, 'getBalance', {

			value: function getBalance(id) {
				let user = currency.get(id);
				return user ? user.balance : 0;
			}
		});

		let storedBalances = await Users.findAll();
		storedBalances.forEach((b) => currency.set(b.user_id, b));
	},

	getSortedList: () => {
		let bot = require('./index').bot;
		return currency.sort((a, b) => b.balance - a.balance)
			.filter((user) => bot.users.cache.has(user.user_id)).first(20)
			.map((user, position) => `**${position + 1}:** <@${(bot.users.cache.get(user.user_id).id)}>: \`${commafy(user.balance)}\``)
			.join('\n')
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