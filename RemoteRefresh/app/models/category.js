exports.definition = {
	config: {
		columns: {
		    "categoryCode": "text",
		    "CategoryName": "text"
		},
		adapter: {
			type: "sql",
			collection_name: "category"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
	        removeAll : function() {
	            var collection = this;	
	            var sql = "DELETE FROM " + collection.config.adapter.collection_name;
	            var db = Ti.Database.open(collection.config.adapter.db_name);
	            db.execute(sql);
	            db.close();
	            collection.trigger('sync');
	        }
		});

		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			// extended functions and properties go here
		});

		return Collection;
	}
};