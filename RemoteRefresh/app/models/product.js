exports.definition = {
	config: {
		columns: {
		    "productCode": "text",
		    "productName": "text",
		    "categoryCode": "text",
		    "price": "real"
		},
		adapter: {
			type: "sql",
			collection_name: "product"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			// extended functions and properties go here
		});

		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
	        removeAll : function() {
	            var collection = this;	
	            var sql = "DELETE FROM " + collection.config.adapter.collection_name;
	            var db = Ti.Database.open(collection.config.adapter.db_name);
	            db.execute(sql);
	            db.close();
	            collection.trigger('sync');
	        }
		});

		return Collection;
	}
};