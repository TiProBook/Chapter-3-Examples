var _apiURLRoot = 'https://api.mongolab.com/api/1/';
var actionTypes = {
	GET : 'GET',
	PUT : 'PUT',
	POST : 'POST',
	DELETE : 'DELETE'
};

var helpers = {
	serialize : function(obj, prefix) {
	  var str = [];
	  for(var p in obj) {
	    var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
	    if((k=='c')||(k=='fo')){
	    	str.push(typeof v == true ? k + "=true": k + "=false");	
	    }else{
	    	str.push(typeof v == "object" ? k + "=" + JSON.stringify(v): k + "=" + v);	
	    }
	    
	  }
	  return str.join("&");
	}	
};

var client = function(config){
	var that = this;
	config = config || {};
	config.timeout || 30000;
	config.debug || false;
	
	if(!config.hasOwnProperty("apiKey")){
		throw "The required property apiKey is missing";
	}
	
	var urlBuilders = {
		getDbUrl : function(){
			if(!config.hasOwnProperty("dbName")){
				throw "dbName has not been set. This can be set when creating the module or using the setDbName method.";
			}
			return _apiURLRoot + 'databases/'+ config.dbName + '/';
		},		
		getCollectionUrl : function(collectionName){
			return urlBuilders.getDbUrl() + 'collections/'+ collectionName + '?apiKey=' + config.apiKey;
		},
		getDocumentUrl : function(collectionName,docId){
			return urlBuilders.getDbUrl() + 'collections/'+ collectionName + '/' + docId + '?apiKey=' + config.apiKey;
		}
	};
	
	var network = {
		fetch : function(actionType, url, callback){
			
			if(!Ti.Network.online){
				callback({
					success:false, message:"No network connection available", statusCode:0	
				});
				return;
			}
			if(config.debug){
				Ti.API.debug("network.fetch URL: " + url);
			}
			
			var done = false;
			var xhr = Ti.Network.createHTTPClient();
			xhr.setTimeout(config.timeout);
	
			xhr.onerror = function(err) {
				Ti.API.error(JSON.stringify(err));
				callback({success:false,message:err, statusCode:xhr.status});
			};
			xhr.onload = function() {
				if (xhr.readyState == 4 && !done) {
					done=true;
					//Make sure the network didn't freak out
					if(this.status == 200){
						 callback({sucess:true, docs:JSON.parse(xhr.responseData), statusCode:xhr.status});						 			
					}else{
						 callback({sucess:false, message:xhr.status, statusCode:xhr.status});
					}											
				}	
			};
			
			xhr.open(actionType, url);
			xhr.send();			
		},
		execute : function(actionType,url,data,callback){
			
			if(!Ti.Network.online){
				callback({
					success:false, message:"No network connection available", statusCode:0	
				});
				return;
			}
			
			if(config.debug){
				Ti.API.debug("network.execute URL: " + url);
			}			
			
			var done = false;
			var xhr = Ti.Network.createHTTPClient();
			
			xhr.setTimeout(config.timeout);
	
			xhr.onerror = function(err) {
				Ti.API.error(JSON.stringify(err));
				callback({success:false,message:err, statusCode:xhr.status});
			};
			xhr.onload = function() {
				if (this.readyState == 4 && !done) {
					done=true;
					//Make sure the network didn't freak out
					if((xhr.status==200) ||(xhr.status==201)){
						callback({sucess:true, docs:xhr.responseData, statusCode:xhr.status});		
					}else{
						callback({sucess:false, message:xhr.status, statusCode:xhr.status});		 
					}											
				}	
			};
									
			xhr.open(actionType, url);
			xhr.setRequestHeader('Content-Type', 'application/json');

			if(data !=null){
				xhr.send(JSON.stringify(data));
			}else{
				xhr.send();
			}			
		}
	};
	
	that.setDbName = function(name){
		config.dbName = name;
	};
	
	that.getDbName = function(){
		return config.dbName;
	};
	
	that.getDatabases =function(callback){
		var url = _apiURLRoot + "databases?apiKey=" + config.apiKey;
		network.fetch(actionTypes.GET,url,callback);
	};	

	that.getCollections =function(callback){
		var url = urlBuilders.getDbUrl() + "collections?apiKey=" + config.apiKey;
		network.fetch(actionTypes.GET,url,callback);
	};	

	that.getDocuments =function(collectionName,callback){
		var url = urlBuilders.getCollectionUrl(collectionName);
		network.fetch(actionTypes.GET,url,callback);
	};	

	that.queryDocuments = function(collectionName,query,callback){
		var qryString = helpers.serialize(query);
		var url = urlBuilders.getCollectionUrl(collectionName) + '&' + qryString;
		network.fetch(actionTypes.GET,url,callback);
	};
	
	that.createDocument = function(collectionName,data,callback){
		var url = urlBuilders.getCollectionUrl(collectionName);
		network.execute(actionTypes.POST,url,data,callback);
	};

	that.updateDocuments = function(collectionName,query,data,callback){
		var qryString = helpers.serialize(query);
		var url = urlBuilders.getCollectionUrl(collectionName) + '&' + qryString;
		network.execute(actionTypes.PUT,url,data,callback);
	};

	that.deleteDocuments = function(collectionName,query,callback){
		var qryString = helpers.serialize(query);
		var url = urlBuilders.getCollectionUrl(collectionName) + '&' + qryString;
		network.execute(actionTypes.PUT,url,[],callback);
	};
		
	that.getDocument = function(collectionName,documentID,callback){
		var url = urlBuilders.getDocumentUrl(collectionName,documentID);
		network.fetch(actionTypes.GET,url,callback);
	};

	that.updateDocument = function(collectionName,documentID,data,callback){
		var url = urlBuilders.getDocumentUrl(collectionName,documentID);
		network.execute(actionTypes.PUT,url,data,callback);
	};
	
	that.deleteDocument = function(collectionName,documentID,callback){
		var url = urlBuilders.getDocumentUrl(collectionName,documentID);
		network.execute(actionTypes.DELETE,url,null,callback);		
	};
						
	return that;
};

module.exports = client;