var auth = require('auth');
var sync = require('sync');
var eventStore = require('localEventStore');

//Shortcut our global reference
var notes = Alloy.Collections.note;
// fetch existing tables from storage
notes && notes.fetch();

var viewController = {
	addNew : function(){
		if(OS_IOS){
			$.index.openWindow(Alloy.createController("note").getView());
		}else{
			Alloy.createController("note").getView().open();
		}
	},
	sync : function(){
		if(!Ti.Network.online){
			alert("A network connection is needed to sync your notes. Please check your network connection and try again.");
			return;
		}	
		//Authorization needed to syc
		auth(function(e){
			if(e){
				// sync(function(f){
//  					
				// });
				var query = "?$filter=modifyid%20gt%20" + 1414296123621;
			    Alloy.Globals.azure.QueryTable('notes', query, function(jsonResponse) {
			       var json = JSON.parse(jsonResponse);
			    }, function(errorMessage) {
			        var errorJson = JSON.parse(JSON.stringify(errorMessage));
			        alert(errorJson.error);
			    });				
			}
		});
	}, 
	deleteRecord : function(e){
		notes.get(e.rowData.noteID).destroy();
	    //Add an event - remove
	    eventStore.addEvent(e.rowData.noteID,'remove');		
	},
	viewNote : function(e){
		var model = notes.get(e.rowData.noteID).toJSON();
		if(OS_IOS){
			$.index.openWindow(Alloy.createController("note",model).getView()); 	
		}else{
			Alloy.createController("note",model).getView().open();
		}			
	}
};

$.index.open();
