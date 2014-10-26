exports.definition = {
	config: {
		columns: {
		    "id": "text primary key",
		    "noteText": "text",
		    "modifyID": "real"
		},
		adapter: {
			"type": "sql",
			"idAttribute": "noteID",
			"collection_name": "note"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			createNote : function(text){
     			 this.set({
                        noteID : Ti.Platform.createUUID(),
                        noteText : text,
                        modifyID : new Date().getTime()
                 });
                 this.save();				
			},
			updateNote : function(text){
		     	this.set({
		     		 noteText : text,
                     modifyID : new Date().getTime()
                });
                this.save();				
			},
			noteExists : function(id){
		        var collection = this;	
	            var sql = "SELECT id FROM " + collection.config.adapter.collection_name + " WHERE id=?" ;
	            var db = Ti.Database.open(collection.config.adapter.db_name);
	            var dbRecords = db.execute(sql,id);
	            var recordCount = dbRecords.getRowCount();
	            dbRecords.close();
	            db.close();
	     		return (recordCount>0);			
			},
			lastModified : function(){
				return new Date(parseFloat(this.get("modifyID")));
			}
		});

		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
		});
		return Collection;
	}
};