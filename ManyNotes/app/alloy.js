
// Create the Note Collection, this will be used to store all of our notes
Alloy.Collections.note = Alloy.createCollection('note');

//Add Azure Application Information
//This is where you would put your azure mobile services name and API Key
Alloy.CFG.azureAppInfo = {
	name :'ti-many-notes'
};

//Require our Azure Mobile Services Native Module
var azure = require('com.winwire.azuremobileservices');
//Add the module to Alloy.Globals so we can use it anywhere in the application
Alloy.Globals.azure = new azure.AzureMobileServices();
//Set the Azure Mobile Services Name, this only needs to be done once
Alloy.Globals.azure.setAppName(Alloy.CFG.azureAppInfo.name);

//Add authenticate method to Alloy.Globals so we can authenticate anywhere within the app
Alloy.Globals.authenticate = function(callback){
    var authenticationClients = ['Facebook', 'Twitter'];
    
    if (OS_IOS) {
        authenticationClients.push('Cancel');
    }
    
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
