var args = arguments[0] || {};

var eventStore = require('localEventStore');

//Check if we have the noteText and noteID value, if so we are in edit mode
var isEdit = args.hasOwnProperty("noteText") && args.hasOwnProperty("id");

//Set our time depending on if we are editing or not
$.noteWindow.title = (isEdit ? "Edit Note" : "Add Note");

//If we are editing add the values
//Otherwise just use place-holder text
if(isEdit){
	$.txtNote.value = args.noteText;
	$.labelUpdated.text = String.format("updated: %s %s",String.formatDate(new Date(parseFloat(args.modifyID))),String.formatTime(new Date(parseFloat(args.modifyID))));	
}else{
	$.labelUpdated.text = "Updated: Now";
}

//Create a shortcut to the note collection
var notes = Alloy.Collections.note;
	    
var viewController = {
	add :function(){
	    // Create a new model for the note collection
	    var note = Alloy.createModel('note');
	    //Create the note, using our extension method
		note.createNote($.txtNote.value);
	    // add new model to the global collection
	    notes.add(note);
	    //Add an event - add
	    eventStore.addEvent(note.toJSON().id,'add');
	},
	edit : function(){
		//Get the note we need to update
		var note = notes.get(args.id);
		//Update the note text
		note.updateNote($.txtNote.value);
	    //Add an event - update
	    eventStore.addEvent(args.id,'update');		
	},
	remove : function(){
		//Get the note we need to remove
		notes.get(args.id).destroy();
	    //Add an event - remove
	    eventStore.addEvent(args.id,'remove');			
	},
	persist : function(){
		//If no text entered, close window without saving
		if($.txtNote.value.trim().length===0){
			//If we are in edit mode, assume we are deleting if next removed
			if(isEdit){
				viewController.remove();
			}
			return;
		}
		
		if(isEdit){
			viewController.edit();
		}else{
			viewController.add();
		}
			
	},
	deleteRecord : function(){
		//Check that we are in edit mode
		if(isEdit){
			viewController.remove();		
		}
					
		//Close the note window
		$.noteWindow.close();
	}
};

$.noteWindow.addEventListener('close',function(e){
	//Persist Notes
	viewController.persist();
	// update views from sql storage
	notes.fetch();	
});
