var Q = require("q");

var agent = {
	createNoteRequest : function(noteID){
		var model = Alloy.Collections.note.get(noteID);
		if(model !=undefined || model !=null){
			return JSON.stringify(model);
		}else{
			return null;
		}
	},	
	createMaxEventList : function(list,noteID){
		var eventsForID = _(list).filter(function (x) { return x.noteID == noteID;});			
		return  _.max(eventsForID, function(evt){ return evt.modifyID; });		
	},
	uniqueUpdateList :function(list){
		var updateList = _(list).filter(function (x) { return x.eventType == 'update';});
		return _.uniq(updateList, false, function(p){ return p.noteID; });			
	},	
	serverToLocalCompare : function(localEvents,serverEvents){
		var serverSearch = agent.uniqueUpdateList(serverEvents);	
		var notes = Alloy.Collections.note;
		
		_.each(serverSearch, function(srvEvt) {
			var deferred = Q.defer();		
			var localEvent =  agent.createMaxEventList(localEvents,srvEvt.noteID);
						
			if(localEvent[0].modifyID < srvEvt.modifyID){
				var query = "?$filter=id%20eq%" + srvEvt.noteID;
			    Alloy.Globals.azure.QueryTable('notes', query, function(jsonResponse) {
			       	var data = JSON.parse(jsonResponse);
			       	var note = notes.get(srvEvt.noteID);
					note.noteText= data.noteText;
					note.modifyID = data.modifyID;	       
		   			note.save();
		   			deferred.resolve();			       
			    }, function(err) {
			        var error = JSON.parse(JSON.stringify(err));
					deferred.reject({
						success:  false,
						message: error
					});
			    });			
			}
			
			promises.push(deferred.promise); 	
		});
	},
	localToServerCompare : function(localEvents,serverEvents){
		var searchList = agent.uniqueUpdateList(localEvents);	
			
		_.each(serverSearch, function(locEvt) {
			var deferred = Q.defer();
			var serverEvent =  agent.createMaxEventList(serverEvents,locEvt.noteID);
			
			if(serverEvent[0].modifyID < locEvt.modifyID){
				var request = agent.createNoteRequest(locEvt.noteID);
				if(request !==null){
			         Alloy.Globals.azure.UpdateTable('notes', locEvt.noteID, request, function(response) {
						deferred.resolve(response);	
				    }, function(err) {
				        var error = JSON.parse(JSON.stringify(err));
						deferred.reject({
							success:  false,
							message: error
						});
				    });		
				}					
			}

			promises.push(deferred.promise); 	
			
		});
	}	
};

var delta = function(localEvents,serverEvents){	
	var defer = Q.defer();
	agent.serverToLocalCompare(localEvents,serverEvents)
	.then(function(){
		return agent.localToServerCompare(localEvents,serverEvents);
	}).then(function(){
		defer.resolve({
			sucess:true,
			data:serverEvents
		});		
	}).catch(function(err){
		defer.reject({
			success:  false,
			message: err
		});
	});
	return defer.promise;		
};

module.exports = delta;