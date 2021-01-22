var version = {
    custom: function(botversion, message, Discord) {
        const embed = new Discord.MessageEmbed()
        .setColor('#FF0000')
        .setTitle("Running Version " + botversion)
        .setFooter("Traveller created by ToxicAven")
        message.channel.send(embed); 
    }
}

module.exports = version