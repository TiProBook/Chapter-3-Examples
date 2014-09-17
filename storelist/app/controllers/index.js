
var stores = Alloy.Collections.store;

// fetch existing tables from storage
stores && stores.fetch();

var mongo = require('ti.mongolab.client');

var mongoClient = new mongo({
	debug:true,
	apiKey:"your mongo lab apikey goes here",
	dbName : "your database name goes here"	
});

var remoteRefresh = {
	addStore : function(item){		    
	    // Create a new model for the categories collection
	    var store = Alloy.createModel('store', {
	        storeCode : item.storeCode,
	        storeName : item.storeName,
	        address : item.address,
	        phone : item.phone,
	        hours : item.hours
	    });
	
	    // add new model to the global collection
	    stores.add(store);
	    store.save();
	    stores.fetch();		
	},
	networkNotAvailable : function(){
		if(!Ti.Network.online){
			alert('A network connection is needed to refresh');
			return true;
		}		
		return false;
	},
	stores : function(){
		if(remoteRefresh.networkNotAvailable()){
			return;
		}
		stores.removeAll(); //Remove all local records
		//Call to MongoLab to get the full Store Collection
		mongoClient.getDocuments('store',function(data){
			if(!data.sucess){
				alert("Error: " + JSON.stringify(data.message));
				return;
			}
			_.each(data.docs, remoteRefresh.addStore);
		});
	}
};

$.index.open();
