var args = arguments[0] || {};
//Check if we have the noteText value, if so we are in edit mode
var isEdit = (args.hasOwnProperty("noteText"));
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

var viewController = {
	closeWindow : function(){
		//Close the note window
		$.noteWindow.close();
	},
	saveRecord : function(){
		//If no text entered, close window without saving
		if($.txtNote.value.trim().length===0){
			viewController.closeWindow();	
			return;
		}
		//Create a shortcut to the note collection
	    var notes = Alloy.Collections.note;
	    // Create a new model for the note collection
	    var note = Alloy.createModel('note');
	    //Create the note, using our extension method
		note.createNote($.txtNote.value);
	    // add new model to the global collection
	    notes.add(note);
	    // save the model to persistent storage
	    note.save();
	    // reload the notes
	    notes.fetch();
		//Close the Notes Window
	    viewController.closeWindow();		
	},
	deleteRecord : function(){
		//Check if we have the noteID value
		if(args.hasOwnProperty("noteID")){
			//Remove the note Using the noteID
			Alloy.Collections.note.get(args.noteID).destroy();
			//Add note ID to our removal collection
			require('removal')(args.noteID);			
		}
					
		//Close the Notes Window
		viewController.closeWindow();
	}
};
