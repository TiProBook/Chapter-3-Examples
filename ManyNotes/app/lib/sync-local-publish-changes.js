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
	add : function(evtStore){
		var promises = [];
		
		var events = evtStore.where({
			eventType:'add'
		});
				
		_.each(events, function(event) {
			var deferred = Q.defer();
			var request = agent.createNoteRequest(event.toJSON().noteID);
			if(request !== null){
			    Alloy.Globals.azure.InsertTable('notes', request, function(data) {
					deferred.resolve(data);				
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
			
		return Q.all(promises);		
	},
	remove :function(evtStore){
		var promises = [];
		
		var events = evtStore.where({
			eventType:'remove'
		});
		
		_.each(events, function(event) {
			var deferred = Q.defer();
		    Alloy.Globals.azure.DeleteTable('notes', event.toJSON().noteID, function(data) {
				deferred.resolve(data);				
            }, function(err) {
      			var error = JSON.parse(JSON.stringify(err));
   				deferred.reject({
					success:  false,
					message: error
				});
            });					
            promises.push(deferred.promise);                	
		});	
			
		return Q.all(promises);		
	}	
};

var publisher = function(evtStore){
	var defer = Q.defer();
	
	agent.add(evtStore)
		.then(function(){
			return agent.remove(evtStore);
		}).then(function(){
			defer.resolve({
					sucess:true
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