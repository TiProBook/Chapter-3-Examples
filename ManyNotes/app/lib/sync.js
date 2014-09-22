

var sync = function(){
	
	if(!Ti.Network.online){
		return;
	}
	
	function publish(){
		
	};
	
	function pushChanges(){
		
	};
	
	function removeRemoteDeleted(){
		
	};

	function removeLocallyDeleted(){
		
	};
	
	//Remove locally deleted records
	removeLocallyDeleted();
	//First step we publish any local records
	publish();
	//Next we apply changes
	pushChanges();
	//Finally we handle remotely deleted records
	removeRemoteDeleted();
	
};

module.exports = sync;