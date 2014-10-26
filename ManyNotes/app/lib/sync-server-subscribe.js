var agent = {
	verifyStatus:function(evtList){
		var iLength= evtList.length;
		for (var i=0;i<iLength;i++){
			evtList[i].noteRefCount = _.where(listOfPlays, {noteID: evtList[i].noteID}).length;
			if(evtList[i].noteRefCount > 1){
				evtList[i].eventType = 'update';
			}else{
				if(Alloy.Collections.note.noteExists(evtList[i].noteID)){
					evtList[i].eventType = 'update';
				}				
			}			
		}
		return evtList;	
	},
	eventsSince : function(modifyID){
		modifyID = modifyID || -1;
		var defer = Q.defer();
		
		var query = "?$filter=modifyid%20gt%20" + modifyID;
	    Alloy.Globals.azure.QueryTable('noteEvents', query, function(jsonResponse) {
	       
	       var data = JSON.parse(jsonResponse);
	       var serverEvts = agent.verifyStatus(data);
	       defer.resolve(serverEvts);	       
	       
	    }, function(err) {
	        var error = JSON.parse(JSON.stringify(err));
			defer.reject({
				success:  false,
				message: error
			});
	    });				
		return defer.promise;		
	},
	add : function(evtList,evtStore){
		var promises = [];
		var addList = _(evtList).filter(function (x) { return x.eventType == 'add';});
		_.each(addList, function(event) {
			var deferred = Q.defer();
			var query = "?$filter=id%20eq%" + event.noteID;
		    Alloy.Globals.azure.QueryTable('notes', query, function(jsonResponse) {
		       var data = JSON.parse(jsonResponse);
				// Create a new model for the note collection
			    var note = Alloy.createModel('note',{
			    	id: data.id,
			    	noteText: data.noteText,
			    	modifyID : data.modifyID			    	
			    });
			    // add new model to the global collection
			    Alloy.Collections.note.add(note);		       
       			note.save();
       			deferred.resolve();			       
		    }, function(err) {
		        var error = JSON.parse(JSON.stringify(err));
				deferred.reject({
					success:  false,
					message: error
				});
		    });	
	    	promises.push(deferred.promise); 
		});
	},
	remove : function(evtList){
		var removeList = _(evtList).filter(function (x) { return x.eventType == 'remove';});
		_.each(removeList, function(event) {
			Alloy.Collections.note.get(event.noteID).destroy();
		});
	}
};

var publisher = function(evtStore,syncLog){
	var defer = Q.defer();
	var serverEvents = [];
		
	agent.eventsSince(syncLog.finLastTranactionID())
		.then(function(evtList){
			serverEvents = evtList;
			agent.remove(serverEvents);
			return agent.add(serverEvents);
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

module.exports = publisher;