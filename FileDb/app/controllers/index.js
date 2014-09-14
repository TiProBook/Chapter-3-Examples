
var libary = require('ti.biblio')("mystorage");
var async = require('async');

var downloader = function(info,callback){	
	var done = false;
	var xhr = Ti.Network.createHTTPClient();
	xhr.setTimeout(10000);
	xhr.onload = function(e){
		if (this.readyState == 4 && !done) {
			done=true;
			//Make sure the network didn't freak out
			if(this.status!==200){
				 callback({sucess:false, message:xhr.status});			
			}else{
				 callback({sucess:true, info:info, data:xhr.responseData});
			 }											
		}				
	};

	xhr.open('GET', info.url);
	xhr.send();	
};

function doClick(e) {

	var contentToDownload=[
		{name:"1mb.zip", url:"https://raw.githubusercontent.com/TiProBook/FilesUsedInDownloadExamples/master/1mb.zip"},
		{name:"264.pdf", url:"https://raw.githubusercontent.com/TiProBook/FilesUsedInDownloadExamples/master/264.pdf"},
		{name:"fw2.pdf", url:"https://raw.githubusercontent.com/TiProBook/FilesUsedInDownloadExamples/master/fw2.pdf"},
		{name:"fw4.pdf", url:"https://raw.githubusercontent.com/TiProBook/FilesUsedInDownloadExamples/master/fw4.pdf"}];
		
	async.each(contentToDownload, function( info, callback) {
		Ti.API.info("Downloading document:" + info.name);
		downloader( info, function(f){
			if(f.success){
				Ti.API.info("Saving Document " + info.name + " to library");
				var id = libary.addBlob(info.name,f.data);
				Ti.API.info("DocumentID for " + info.name + " is now " + id);
			}
		});
	}, function(err){
	    if( err ) {
			Ti.API.error(JSON.stringify(err));
	    }
	});
	
}

$.index.open();
