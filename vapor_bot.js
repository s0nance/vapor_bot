require("dotenv").config();
require("module-alias/register");

const { DiscordClient } = require("@src/structures");
const fs = require("fs");

const client = new DiscordClient();

process.on('unhandledRejection', (reason) => {
    console.error(reason);
    process.exit();
});


try {
} catch (e){
    console.log(e.stack);
    console.log(process.version);
    process.exit();
}
console.log("Executing Vapor Bot\nNode version: " + process.version + "\nDiscord.js version: " + client.version);


const AuthDetails = require("./auth.json");
// Get authenticate
try {
} catch (e){
    console.log("Error finding a proper auth.json file.");
    process.exit();
}

// Load custom permissions

let Permissions = {};
try{
	Permissions = require("./permissions.json");
} catch(e){
	Permissions.global = {};
	Permissions.users = {};
}

Permissions.checkPermission = function (userid,permission){
	//var usn = user.username + "#" + user.discriminator;
	//console.log("Checking " + permission + " permission for " + usn);
	try {
		var allowed = true;
		try{
			if(Permissions.global.hasOwnProperty(permission)){
				allowed = Permissions.global[permission] === true;
			}
		} catch(e){}
		try{
			if(Permissions.users[userid].hasOwnProperty("*")){
				allowed = Permissions.users[userid]["*"] === true;
			}
			if(Permissions.users[userid].hasOwnProperty(permission)){
				allowed = Permissions.users[userid][permission] === true;
			}
		} catch(e){}
		return allowed;
	} catch(e){}
	return false;
}
fs.writeFile("./permissions.json",JSON.stringify(Permissions,null,2), (err) => {
	if(err) console.error(err);
});

// Load SpaceX API wrapper

const SpaceXApi = require("spacex-api");
const {Presence} = require("discord.js");

// Load jquery

commands = {    // List of all implemented commands
		"help": {
			description: "It seems you need some help",
			process: function (bot, msg, suffix) {
				helpCommand(suffix, msg)
			}
		},
        "ping": {
            description: "Responds pong; useful for checking if bot is alive.",
            process: function(bot, msg, suffix) {
                msg.channel.send( msg.member.user.tag+" pong!");
                if (suffix){
                    msg.channel.send( "No need to add arguments ! I'm alive you know..");
                }
            }
		},
		"cosmic": {
			description: "I can't tell you what you are supposed to know.",
			process: function(bot, msg, suffix) {
				if (!suffix) {
					msg.channel.send("Hey! Really good choice... " + "https://cosmiccycler.bandcamp.com/");
				}
			}
		},
        "multiply": {
            description: "Multiply two numbers, taken as arguments.",
            process: function(bot, msg, suffix) {
                var args = suffix.split(' ');
                multiplyCommand(args, msg);
            }
        },
        "spacex": {
            description: "Interact with SpaceX database, a lot of commands here. To display them, try  !`spacex help`",
            process: function(bot, msg, suffix) {
				if (!suffix) {
					msg.channel.send( "You have to put an argument ! Try `!spacex nextlaunch` for example. \nTo receive the list of `spacex` commands, write " + Config.commandPrefix + "`spacex help`");
				} else {
					var args = suffix.split(' ');
					if ((args[0] == 'nextlaunch' || args[0] == 'next_launch') & !args[1]) {
						SpaceXApiWrapper.getNextLaunch().then(function(data) {
							var datax = data;
							msg.channel.send({
								embed: {
									title: "Informations about the next SpaceX mission :",
									color: '1778CC',
									description: "",
									"thumbnail": {
										"url": datax.links.mission_patch_small
									  },
									"fields": [
										{
											"name": "Mission Name : ",
											"value": datax.mission_name
										},
										{
											"name": "UTC Launch Date : ",
											"value": datax.launch_date_utc
										},
										{
											"name": "Rocket Used :",
											"value": datax.rocket.rocket_name
										},
										{
											"name": "Launch Site :",
											"value": datax.launch_site.site_name_long
										}
									]
								}
							});
							//msg.channel.send("If you want to see upcoming missions, try " + Config.commandPrefix + "`spacex uplaunches`."); // WORTH IT ?
							console.log(data);
						});
					} else if (args[0] == 'info' || args[0] == 'infos' || args[0] == 'information' || args[0] == 'informations') {
						SpaceXApiWrapper.info().then(function(data) {
							var datax = data;
							msg.channel.send({
								embed: {
									title: "Informations about SpaceX :",
									color: '1778CC',
									description: datax.summary,
									"thumbnail": {
										"url": "http://seekvectorlogo.com/wp-content/uploads/2017/12/spacex-vector-logo-small.png"
									},
									"fields": [
										{
											"name": "Name : ",
											"value": datax.name
										},
										{
											"name": "Founder : ",
											"value": datax.founder
										},
										{
											"name": "Number of employees :",
											"value": datax.employees
										},
										{
											"name": "Launch Sites / Test Sites :",
											"value": datax.launch_sites + ' / ' + datax.test_sites
										},
										{
											"name": "CEO :",
											"value": datax.ceo
										},
										{
											"name": "Valuation (in US dollars) :",
											"value": datax.valuation
										},
										{
											"name": "Links :",
											"value": 'Website : ' + datax.links.website + '\nTwitter : ' + datax.links.twitter
										}
									]
								}
							});
							console.log(data);
						});
					} else if ((args[0] == 'mission' || args[0] == 'latest' || args[0] == 'current') && !args[1]) {
						SpaceXApiWrapper.getLatestLaunch().then(function(data) {
							var datax = data;
							if (data.launch_success) {
								if (data.launch_success == true)
									var success = 'Success';
								else	
									var success = 'Failure';
							}
							msg.channel.send({
								embed: {
									title: 'Current / Latest SpaceX Mission :',
									color: '1778CC',
									description: "",
									"thumbnail": {
										"url": datax.links.mission_patch_small
									  },
									"fields": [
										{
											"name": "Mission Name : ",
											"value": datax.mission_name
										},
										{
											"name": "UTC Launch Date : ",
											"value": datax.launch_date_utc
										},
										{
											"name": "Rocket Used :",
											"value": datax.rocket.rocket_name
										},
										{
											"name": "Launch Site :",
											"value": datax.launch_site.site_name_long
										},
										{
											"name": "Launch State :",
											"value": success
										},
										{
											"name": "Details :",
											"value": datax.details
										}
									]
								}
							});
							console.log(data);
						});
					} else if (args[0] == 'cores') {
						SpaceXApiWrapper.getAllCores().then(function(data) {
							if (args[1] == 'list') {
								var datax = data;
								var offset = 0;
								var limit = 5;
								var counter = 1;
								let embed = new Discord.MessageEmbed()
									.setColor("1778CC")
									.setTitle("SpaceX Cores List #" + counter + ':')
								for (; datax[offset]; offset += 1) { // Loop parsing the cores json
									for (; offset != limit; offset += 1) {
										embed.addField("__**Core Serial Name :**__", '**' + datax[offset].core_serial + '**');
										embed.addField("UTC Original Launch Date :", datax[offset].original_launch);
										embed.addField("*Details :*", datax[offset].details);
									}
									if (offset == limit) { // Limit is the number of cores displayed on the embed. Embed max chars are 6000 and 256 per lign.
										limit += 5;
										counter += 1;
										msg.author.send(embed);
										embed = new Discord.MessageEmbed()
											.setColor("1778CC")
											.setTitle("SpaceX Cores List #" + counter + ':')
										}
									}
							} else {
								var datax = data;
								var offset = 0;
								var limit = 5;
								var counter = 1;
								let embed = new Discord.MessageEmbed()
									.setColor("1778CC")
									.setTitle("SpaceX Cores List #" + counter + ':')
								for (; datax[offset]; offset += 1) {
									for (; offset != limit; offset += 1) {
										embed.addField("__**Core Serial Name :**__", '**' + datax[offset].core_serial + '**');
										embed.addField("UTC Original Launch Date :", datax[offset].original_launch);
										embed.addField("*Details :*", datax[offset].details);
									}
									if (offset == limit) {
										msg.channel.send(embed);
										break;
									}
								}
								msg.channel.send("Try adding `list` as argument to receive full SpaceX cores lists.");
							}
						});
					} else if (args[0] == 'live') {
						msg.channel.send("Watch the SpaceX live here : \nhttps://www.youtube.com/watch?v=bIZsnKGV8TE");
					} else {
						msg.channel.send("Invalid argmument(s).");
					}
				}
			}
			// IN PROGRESS 
			// GOAL : Implement Youtube API to verify if SpaceX channel is on live or not, and SpaceX API to give informations about missions and countdowwns.
        }
}


client.on("ready", function () {
    console.log("Connected as " + client.user.tag)
	console.log("Write !help on Discord chat area to display the command list.");
	client.user.setPresence({ status: "online"})

	// Set the bot user's activity

	client.user.setActivity('Cosmic Cycler', { type: 2 })
	// .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
	// .catch(console.error);
});

client.on("message", (msg) => {
	if(!checkMessageForCommand(msg, false)){
		for(msgListener of hooks.onMessage){
			msgListener(msg);
		}
	}
});

client.on("messageUpdate", (oldMessage, newMessage) => {
	checkMessageForCommand(newMessage,true);
});

function checkMessageForCommand(msg, isEdit) {
	//check if message is a command
	if(msg.author.id != bot.user.id && (msg.content.startsWith(Config.commandPrefix))){
        console.log("treating " + msg.content + " from " + msg.author + " as command");
		var cmdTxt = msg.content.split(" ")[0].substring(Config.commandPrefix.length);
        var suffix = msg.content.substring(cmdTxt.length+Config.commandPrefix.length+1);//add one for the ! and one for the space
        if(msg.mentions.has(bot.user)){
			try {
				cmdTxt = msg.content.split(" ")[1];
				suffix = msg.content.substring(bot.user.mention().length+cmdTxt.length+Config.commandPrefix.length+1);
			} catch(e){ //no command
				//msg.channel.send("Yes?");
				return false;
			}
        }
		let cmd = commands[cmdTxt];
		if(cmdTxt === "help"){
            //help is special since it iterates over the other commands
			if(suffix){
				var cmds = suffix.split(" ").filter(function(cmd){return commands[cmd]});
				var info = "";
				for(var i=0;i<cmds.length;i++) {
					cmd = cmds[i];
					info += "**"+Config.commandPrefix + cmd+"**";
					var usage = commands[cmd].usage;
					if(usage){
						info += " " + usage;
					}
					var description = commands[cmd].description;
					if(description instanceof Function){
						description = description();
					}
					if(description){
						info += "\n\t" + description;
					}
					info += "\n"
				}
				msg.channel.send(info);
			} else {
				msg.author.send("**Available Commands:**").then(function(){
					var batch = "";
					var sortedCommands = Object.keys(commands).sort();
					for(var i in sortedCommands) {
						var cmd = sortedCommands[i];
						var info = "**"+Config.commandPrefix + cmd+"**";
						var usage = commands[cmd].usage;
						if(usage){
							info += " " + usage;
						}
						var description = commands[cmd].description;
						if(description instanceof Function){
							description = description();
						}
						if(description){
							info += "\n\t" + description;
						}
						var newBatch = batch + "\n" + info;
						if(newBatch.length > (1024 - 8)){ //limit message length
							msg.author.send(batch);
							batch = info;
						} else {
							batch = newBatch
						}
					}
					if(batch.length > 0){
						msg.author.send(batch);
					}
				});
			}
			return true;
        }
		else if(cmd) {
			if(Permissions.checkPermission(msg.author.id,cmdTxt)){
				try{
					cmd.process(bot,msg,suffix,isEdit);
				} catch(e){
					var msgTxt = "command " + cmdTxt + " failed :(";
					if(Config.debug){
						 msgTxt += "\n" + e.stack;
						 console.log(msgTxt);
					}
					if(msgTxt.length > (1024 - 8)){ //Truncate the stack if it's too long for a discord message
						msgTxt = msgTxt.substr(0,1024-8);
					}
					msg.channel.send(msgTxt);
				}
			} else {
				msg.channel.send("You are not allowed to run " + cmdTxt + "!");
			}
			return true;
		} else {
			msg.channel.send(cmdTxt + " does not figure in the database. Try `!help` to see how to interact with me.")
			return true;
		}
	} else {
		//message is not a command or is from us
        //drop our own messages to prevent feedback loops
        if(msg.author == bot.user){
            return true; //returning true to prevent feedback from commands
        }

        if (msg.author != bot.user && msg.mentions.has(bot.user)) {
                //msg.channel.send("yes?"); //using a mention here can lead to looping
        } else {

				}
		return false;
    }
}

function helpCommand(arguments, receivedMessage) {
    if (arguments.length > 0) {
        receivedMessage.channel.send("It looks like you might need help with " + arguments)
    } else {
        receivedMessage.channel.send("I'm not sure what you need help with. Try `!help [topic]`")
    }
}

function multiplyCommand(arguments, receivedMessage) {
    if (arguments.length < 2) {
        receivedMessage.channel.send("Not enough values to multiply. Try `!multiply 2 4 10` or `!multiply 5.2 7`")
        return
    }
    let product = 1
    arguments.forEach((value) => {
        product = product * parseFloat(value)
    })
    receivedMessage.channel.send("The product of " + arguments + " multiplied together is: " + product.toString())
}

if(AuthDetails.BOT_TOKEN){
	console.log("Logging in with token");
	client.login(AuthDetails.BOT_TOKEN);
} else {
	console.log("Logging in with user credentials is no longer supported!\nYou can use token based log in with a user account; see\nhttps://discord.js.org/#/docs/main/master/general/updating.");
}