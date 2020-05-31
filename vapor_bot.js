var fs = require('fs')

process.on('unhandledRejection', (reason) => {
    console.error(reason);
    process.exit();
});

try {
    var Discord = require("discord.js");
} catch (e){
    console.log(e.stack);
    console.log(process.version);
    process.exit();
}
console.log("Executing Vapor Bot\nNode version: " + process.version + "\nDiscord.js version: " + Discord.version);


// Get authenticate
try {
    var AuthDetails = require("./auth.json");
} catch (e){
    console.log("Error finding a proper auth.json file.");
    process.exit();
}

// Load custom permissions

var Permissions = {};
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

// Load Config file 

var Config = {}
try {
    Config = require("./config.json");
} catch(e) { // default configuration
    Config.debug = false;
    Config.commandPrefix = '!';
}

commands = {    // List of all implemented commands
        "ping": {
                description: "Responds pong; useful for checking if bot is alive.",
                process: function(bot, msg, suffix) {
                    msg.channel.send( msg.member.user.tag+" pong!");
                    if (suffix){
                        msg.channel.send( "No need to add arguments ! I'm alive you know..");
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
            description: "Give a link of the current Space X channel live.",
            process: function(bot, msg, suffix) {
                msg.channel.send("Watch the SpaceX live here : https://www.youtube.com/watch?v=bIZsnKGV8TE !!");
            }
        }
}
var bot = new Discord.Client();

bot.on("ready", function () {
    console.log("Connected as " + bot.user.tag)
    console.log("Write "+Config.commandPrefix+"help on Discord chat area to display the command list.");
    bot.user.setPresence({
            game: {
                name: Config.commandPrefix+"help | "+ bot.guilds.name +" Servers"
            }
    });
});

bot.on("message", (msg) => {
	if(!checkMessageForCommand(msg, false)){
		for(msgListener of hooks.onMessage){
			msgListener(msg);
		}
	}
});

bot.on("messageUpdate", (oldMessage, newMessage) => {
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
		var cmd = commands[cmdTxt];
        if(cmdTxt === "help"){
            //help is special since it iterates over the other commands
			if(suffix){
				var cmds = suffix.split(" ").filter(function(cmd){return commands[cmd]});
				var info = "";
				for(var i=0;i<cmds.length;i++) {
					var cmd = cmds[i];
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

if(AuthDetails.bot_token){
	console.log("logging in with token");
	bot.login(AuthDetails.bot_token);
} else {
	console.log("Logging in with user credentials is no longer supported!\nYou can use token based log in with a user account; see\nhttps://discord.js.org/#/docs/main/master/general/updating.");
}