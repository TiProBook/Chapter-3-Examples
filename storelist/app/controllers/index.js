
var stores = Alloy.Collections.store;

// fetch existing tables from storage
stores && stores.fetch();

var mongo = require('ti.mongolab.client');

var mongoClient = new mongo({
	debug : true,
	timeout : 15000,
	apiKey:"your mongo lab apikey goes here",
	dbName : "your database name goes here"	
});

var storeManager = {
	addStore : function(item){		    
	    // Create a new model for the categories collection
	    var store = Alloy.createModel('store', {
	        storeID : item.storeID,
	        storeName : item.storeName,
	        address : item.address,
	        city : item.city,
	        phone : item.phone,
	        hours : item.hours,
	        countryCode: item.countryCode
	    });
	
	    // add new model to the global collection
	    stores.add(store);
	    store.save();
	    stores.fetch();		
	},
	scheduledRefresh : function(){
		var refreshedOn = new Date(parseFloat(Ti.App.Properties.getDouble('LAST_REFESHED',0)));
		var moreThanAWeek = ((new Date() - refreshedOn)/(1000*60*60*24) > 7);
		
		if(Ti.Network.online && moreThanAWeek){
			storeManager.refreshAll();
			Ti.App.Properties.setDouble('LAST_REFESHED', new Date().getTime());
		}
		
	},
	refreshAll : function(){
		if(!Ti.Network.online){
			alert('A network connection is needed to refresh');
			return true;
		}	
		//Call to MongoLab to get the full Store Collection
		mongoClient.getDocuments('store',function(data){
			if(!data.sucess){
				alert("Error: " + JSON.stringify(data.message));
				return;
			}
			stores.removeAll(); //Remove all local records
			//Loop through each of the documents returned and save locally
			_.each(data.docs, storeManager.addStore);
		});
	}
};

//$.index.addEventListener('focus',storeManager.scheduledRefresh);

$.index.open();
