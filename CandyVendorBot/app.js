/*
* Requirements
*/

require('dotenv').config();
var restify = require('restify');
var builder = require('botbuilder');
var rpio = require('rpio');

/*
* Respberry Pi
*/

//Setup Pi GPIOs
rpio.open(12, rpio.OUTPUT, rpio.HIGH);

//Give Candy-Function
function giveCandy(){
	rpio.msleep(2000);
	rpio.write(12, rpio.LOW);
	rpio.msleep(500);
	rpio.write(12, rpio.HIGH);
}

/*
* Restify Server
*/

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

/*
* MS BotFramework
*/

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// The Bot
var bot = new builder.UniversalBot(connector, [
	function (session) {
        session.say("Welcome to the CandyBot.", "Welcome to the CandyBot.");
        builder.Prompts.text(session, "What's your name?", {                                    
			speak: "What's your name?",                                               
			retrySpeak: "Hey, wake up! What's your name?",  
			inputHint: builder.InputHint.expectingInput                                              
		});
    },
	function (session, results) {
        session.dialogData.name = results.response;
        builder.Prompts.text(session, (session.dialogData.name + ", do you want some Candy?"), {                                    
			speak: session.dialogData.name + ", do you want some Candy?",                                               
			retrySpeak: "Hey, wake up! Do you want some Candy?",  
			inputHint: builder.InputHint.expectingInput                                              
		});
    },
    function (session) {
		session.say("Ok " + session.dialogData.name + " here is your candy!", "Ok " + session.dialogData.name + " here is your candy!");
        session.endDialog();
        giveCandy();
    }
]);