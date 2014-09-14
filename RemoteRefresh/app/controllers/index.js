
var mongo = require('ti.mongolab.client');

var mongoClient = new mongo({
	debug:true,
	apiKey:"your mongo lab apikey goes here",
	dbName : "your database name goes here"	
});

var products = Alloy.Collections.product;
var categories = Alloy.Collections.category;

// fetch existing tables from storage
products && products.fetch();
categories && categories.fetch();

var remoteRefresh = {
	addCategory : function(item){		    
	    // Create a new model for the categories collection
	    var category = Alloy.createModel('category', {
	        categoryCode : item.categoryCode,
	        CategoryName : item.CategoryName
	    });
	
	    // add new model to the global collection
	    categories.add(category);
	    category.save();
	    categories.fetch();		
	},
	addProduct : function(item){		    
	    // Create a new model for the products collection
	    var product = Alloy.createModel('product', {
	        productCode : item.productCode,
	        productName : item.productName,
	        categoryCode : item.categoryCode,
	        price : item.price
	    });
	
	    // add new model to the global collection
	    products.add(product);
	    product.save();
	    products.fetch();		
	},
	networkNotAvailable : function(){
		if(!Ti.Network.online){
			alert('A network connection is needed to refresh');
			return true;
		}		
		return false;
	},
	products : function(){
		if(remoteRefresh.networkNotAvailable()){
			return;
		}
		products.removeAll(); //Remove all local records
		//Call to MongoLab to get the full Product Collection
		mongoClient.getDocuments('product',function(data){
			if(!data.sucess){
				alert("Error: " + JSON.stringify(data.message));
				return;
			}
			_.each(data.docs, remoteRefresh.addProduct);
		});		
	},
	categories : function(){
		if(remoteRefresh.networkNotAvailable()){
			return;
		}
		categories.removeAll(); //Remove all local records
		//Call to MongoLab to get the full Product Collection
		mongoClient.getDocuments('category',function(data){
			if(!data.sucess){
				alert("Error: " + JSON.stringify(data.message));
				return;
			}
			_.each(data.docs, remoteRefresh.addCategory);
		});
	}
};

$.index.open();
