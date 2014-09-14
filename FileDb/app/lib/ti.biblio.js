
var DEFAULTS = {
	NAME : 'blibrary'
};

var bib = function(name){
	var that = this;
	var library = [];	
	name = ((name==undefined)||name==null) ? DEFAULTS.NAME : name;
	var dir=null,indexFile=null;
	
	
	function initDirectory(){
		dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,name);
		if(!dir.exists()){
			dir.createDirectory();
		}
		
		Ti.API.debug('your library directory is ' + dir.nativePath);		
	};
	 
	function initIndex(){
		indexFile = Ti.Filesystem.getFile(dir.nativePath,"index.json");
		if(indexFile.exists()){
			library = JSON.parse(indexFile.read().text); 
		}		
	};
	
	function initContainer(){
		initDirectory();
		initIndex();
	};
	
	function saveLibToDisk(){
		//Flush index to disk
		indexFile.write(JSON.stringify(library));
	};
	
	that.getDirectoryPath = function(){
		return dir.nativePath;
	};
	
	that.getName = function(){
		return name;
	};
	
	that.documentCount = function(){
		return library.length;
	};
	
	function saveDocument(info){
		//Lazy create our directory structures
		if(indexFile==null){
			initContainer();	
		}
		
		var ID = Ti.Platform.createUUID();
		var temp = Ti.Filesystem.getFile(dir.nativePath,(ID + "."+ info.ext));
		temp.write(info.content);
		Ti.API.debug("saving file to library =" + temp.nativePath);
		
		library.push({
			ID:ID,
			name : info.name,
			extension:info.ext,
			nativePath : temp.nativePath
		});	
		
		setTimeout(function(){
			saveLibToDisk();
		},250);
		
		return ID;			
	};
	
	that.addDocument = function(doc){
		if(!doc.exists()){
			throw "document provided does not exist";
		}

		return saveDocument({
			name : doc.name,
			ext : doc.extension(),
			content : doc.read(),
			addOn : new Date()
		});
	};

	that.addBlob = function(name,doc){
		if(doc.apiName.toLowerCase() != 'ti.blob'){
			throw "expected input of type Ti.Blob, other object type provided";
		}
		var re = /(?:\.([^.]+))?$/;
		var ext = re.exec(name)[1];
		ext = ((ext == undefined) ? null : ext);
		
		return saveDocument({
			name : name,
			ext : ext,
			content : doc
		});		
	};
		
	function getRecord(prop,value){
		var iLength = library.length;
		for (var i=0;i<iLength;i++){
			if(library[i][prop].toUpperCase()==value.toUpperCase()){
				return library[i];
			}
		}
		return null;			
	};

	function getFile(prop,value){
		var iLength = library.length;
		for (var i=0;i<iLength;i++){
			if(library[i][prop].toUpperCase()==value.toUpperCase()){
				return Ti.Filesystem.getFile(library[i].nativePath);
			}
		}
		return null;			
	};
	
	that.getDocumentByName = function(name){
		return getRecord('name',name);		
	};
		
	that.getDocumentByID = function(id){
		return getRecord('ID',id);		
	};
		
	that.getFileByName = function(name){
		return getFile('name',name);	
	};

	that.getFileByID = function(id){
		return getFile('ID',id);		
	};
	
	that.deleteDocument = function(id){
		var iLength = library.length;
		for (var i=0;i<iLength;i++){
			if(library[i].ID==id){
				var temp = Ti.Filesystem.getFile(library[i].nativePath);
				if(temp.exists()){
					temp.deleteFile();
				}
				delete library[i];
			}
		}
		saveLibToDisk();		
	};
	
	that.listDocuments = function(){
		return library;
	};
		
	that.destroy = function(){
		library.length = 0;
		dir.deleteDirectory();
	};
	
	return that;
};

module.exports = bib;