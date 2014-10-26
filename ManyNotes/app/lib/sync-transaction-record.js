var transaction = {
	collection: null,
	init : function(){
		transaction.collection = Alloy.Collections.syncTransactionLog;
		transaction.collection.fetch({
			query: 'SELECT max(modifyID) as modifyID FROM ' + transaction.collection.config.adapter.collection_name		
		});				
	},
	finLastTranactionID : function(){
		if(transaction.collection.models.length==0){
			return null;
		}
		if(transaction.collection.models.length > 0){
			return transaction.collection.models[0].modifyID;
		}		
	},
	saveTransaction :function(modifyID){
	    // Create a new model for the note collection
	    var trans = Alloy.createModel('syncTranactionLog', {
	    	modifyID: modifyID
	    });		
	    // add new model to the global collection
	    Alloy.Collections.syncTransactionLog.add(trans);
		//Save model update
		trans.save();
	}
};
	
module.exports = transaction;