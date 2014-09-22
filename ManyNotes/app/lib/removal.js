module.exports = function(noteID){
	var removed = Alloy.Collections.removedNote;
	var remove = Alloy.createModel('removedNote',{
		noteID:noteID
	});
    // add new model to the global collection
    removed.add(remove);
    // save the model to persistent storage
    remove.save();
    // reload the notes
    removed.fetch();	
};
