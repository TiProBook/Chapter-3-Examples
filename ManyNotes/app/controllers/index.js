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
			if(!e){
				alert('need to login to sync');
			}
			
			if(e){
				sync(function(r){
 					if(r.success){
 						alert('awesome');
 					}else{
 						alert('problem');
 					}
				});			
			}
		});
	}, 
	deleteRecord : function(e){
		//Remove note
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
