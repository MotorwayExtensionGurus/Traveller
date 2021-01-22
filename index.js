const Discord = require('discord.js');
require('dotenv').config()
const {Users} = require('./dbObjects');
const { Op } = require('sequelize');
const bot = new Discord.Client();
//const fetch = require('node-fetch');
//const querystring = require('querystring');
//const trim = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);
//const date = Date.now()
const prefix = '?';
var commandsList = [
    prefix + "netherrack [digger] - Check a diggers netherrack count!",
    prefix + "officialtop - Prints an offically formatted netherrack leaderboard!",
    prefix + "setnetherrack - Set your own netherrack count!",
    prefix + "fixcount - If you somehow fuck up the counter, reset it to zero!",
    prefix + "top - Print the digger netherrack leaderboard!",
    prefix + "version - Display the bot version!",   
]

var d = new Date();

var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const botversion = '1.0.0';

var trueDate = (months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear())
console.log(trueDate);
//Imports
var version = require('./cmds/version.js');

function removeSymbol(symbol, str){
    var newString = "";
    for(var i = 0; i < str.length; i++) {
        var char = str.charAt(i);
        if(char != symbol){
            newString = newString + char;
        }
    }
    return newString;
}

function commafy( num ) {
    var str = num.toString().split('.');
    if (str[0].length >= 5) {
        str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    }
    if (str[1] && str[1].length >= 5) {
        str[1] = str[1].replace(/(\d{3})/g, '$1 ');
    }
    return str.join('.');
}

const currency = new Discord.Collection();
//Alpha
Reflect.defineProperty(currency, 'add', {
	/* eslint-disable-next-line func-name-matching */
	value: async function add(id, amount) {
		const user = currency.get(id);
		if (user) {
			user.balance += Number(amount);
			return user.save();
		}
		const newUser = await Users.create({ user_id: id, balance: amount });
		currency.set(id, newUser);
		return newUser;
	},
});

Reflect.defineProperty(currency, 'getBalance', {
	/* eslint-disable-next-line func-name-matching */
	value: function getBalance(id) {
		const user = currency.get(id);
		return user ? user.balance : 0;
	},
});

bot.on("ready", async () => {
    const storedBalances = await Users.findAll();
    storedBalances.forEach(b => currency.set(b.user_id, b));
    console.log(`\n------------\nTraveller v${botversion}\nRunning as ${bot.user.tag}\nMade by ToxicAven#3678\nLicensed under GNU GPL-3.0\n------------\n`)
});

bot.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();


    //Version Command
    if (command === 'version') {
        console.log(`Version Command Issued`)
        version.custom(botversion, message, Discord);
    }
    else if (command === 'netherrack') {
        const target = message.mentions.users.first() || message.author;
        var counter = currency.getBalance(target.id);
        if (counter == 0) {
            return message.channel.send ("This user has no count Set!");
        }
        var commafied = commafy(counter);
        return message.channel.send(`${target} has mined ${commafied} netherrack!`);
    }
    else if (command === 'officialtop') {
        if(message.member.roles.cache.some(r=>["ADMIN"].includes(r.name)) ) {
        if (1 == 1) {
            message.channel.send({files: ['./netherrack.png']})
              .then(a => {
                message.channel.send(
                    currency.sort((a, b) => b.balance - a.balance)
                        .filter(user => bot.users.cache.has(user.user_id))
                        .first(20)
                        .map((user, position) => `(${position + 1}) ${(bot.users.cache.get(user.user_id).tag)}: ${commafy(user.balance)} netherrack`)
                        .join('\n'),
                    { code: true }
                );
                message.channel.send('Last updated: ' + trueDate);
              })
            }
            else {
                message.channel.send('This command can only be ran by Admins!')
              }
            }
    }
    else if (command === 'setnetherrack') {
        if(message.member.roles.cache.some(r=>["DIGGER"].includes(r.name)) ) {
        const target = message.author;
        var zeroout = -currency.getBalance(target.id)
        var anticomma = parseFloat(args.toString().replace(/,/g, ''))
        currency.add(message.author.id, zeroout);
        currency.add(message.author.id, anticomma);
        return message.channel.send(`Set ${target}'s new netherrack Count to ${commafy(currency.getBalance(target.id))} netherrack!`);
        }
        else {
            message.channel.send('This command can only be ran by Diggers!')
          }
    }
    else if (command === 'fixcount') {
        if(message.member.roles.cache.some(r=>["DIGGER"].includes(r.name)) ) {
            const target = message.author;
            var zeroout = -currency.getBalance(target.id)
            currency.add(message.author.id, zeroout);
            message.channel.send('Fixed Netherrack count!')
          } else {
            message.channel.send('This command can only be ran by Diggers!')
          }
    }
    else if (command === 'top') {
        return message.channel.send(
            currency.sort((a, b) => b.balance - a.balance)
                .filter(user => bot.users.cache.has(user.user_id))
                .first(20)
                .map((user, position) => `(${position + 1}) ${(bot.users.cache.get(user.user_id).tag)}: ${commafy(user.balance)} netherrack`)
                .join('\n'),
            { code: true }

        );
    }    

    else if (command === 'help'){
                const embed = new Discord.MessageEmbed()
                    .setTitle("Traveller Help")
                    .setDescription(commandsList)
                    .setColor('#ff0000');
                    message.channel.send(embed);
    }
});


bot.on("ready", async() => {
    bot.user.setActivity("with Pigmen", {type: 'PLAYING'});
});

bot.login(process.env.TOKEN);