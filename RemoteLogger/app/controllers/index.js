var mongo = require('ti.mongolab.client');

var mongoClient = new mongo({
	debug : true,
	timeout : 15000,
	apiKey: "your mongo lab apikey goes here",
	dbName :'event-log' //"your database name goes here"	
});

function addLogEntry(){
	var logEntry = {
		message:'hello word ' + new Date().getTime(),
		level : 'informational',
		timestamp : new Date().getTime()
	};
	
	mongoClient.createDocument('eventLog',logEntry,function(data){
		var message = (data.sucess) ? 'Event Log Added' : 'Error:' + JSON.stringify(data.message);
		alert(message);
	});	
};

function removeAllLogs(){
	var startingDate = new Date();
	startingDate.setDate(startingDate.getDate()-1);	
	
	var query = {
		q: {
			timestamp: { $gt: startingDate.getTime() }
		}
	};
	
	mongoClient.deleteDocuments('eventLog',query,function(data){
		var message = (data.sucess) ? 'Event Log Cleared' : 'Error:' + JSON.stringify(data.message);
		alert(message);
	});	
};

$.index.open();