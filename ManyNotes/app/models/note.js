exports.definition = {
	config: {
		columns: {
		    "noteID": "text primary key",
		    "noteText": "text",
		    "published": "integer",
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
                        published : 0,
                        noteText : text,
                        modifyID : new Date().getTime()
                 });
                 this.save();				
			},
			updatePublished : function(value){
     			 this.set({
                        published : (value ? 1 : 0)
                 });
                 this.save();					
			},
			isPublished : function(){
				return (this.get('published') == 1);
			},
			modified : function(){
	     		this.set({
                        modifyID : new Date().getTime()
                });
                this.save();			
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