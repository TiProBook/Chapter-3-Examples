//Add authenticate method to Alloy.Globals so we can authenticate anywhere within the app

var authenticationClients = ['Facebook', 'Twitter'];

if (OS_IOS) {
    authenticationClients.push('Cancel');
}
    
module.exports = function(callback){

    var dialog = Ti.UI.createOptionDialog({
        options : authenticationClients, title : 'Select a login'
    });

    dialog.addEventListener('click', function(evt) {        
        if (evt.index >= 0 && evt.index <= 1) {
            var authorizeClient = authenticationClients[evt.index].replace(/ /g, '').toLowerCase();
            Alloy.Globals.azure.authorizeClient(authorizeClient, function(data) {
				callback(data);
            });
        }else{
        	callback({
        		success:false,
        		canceled:true
        	});
           dialog.hide();
        }
    });
    
    dialog.show();		
};
