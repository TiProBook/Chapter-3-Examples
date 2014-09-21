
 var appName = '<---APP NAME---->';  //Replace with your Application name
 var appKey = '<------------APP KEY------------>'; // Replace this with your Application Key for a working Mobile Service.
 // This is available on the Azure Management Portal, by selecting your mobile service and then clicking on "Dashboard".

/**
 * Main window
 */
$.rootController.open({
    navBarHidden : true,
    exitOnClose : true
});

/**
 * User choices to test Azure mobile services as per configured in Azure Management Portal
 */
var types = [{
    title : 'No Authentication',
}, {
    title : 'With App Key',
}, {
    title : 'With Login',
//}, {
    //title : 'Client Direct',
}];
var rowArray = [];
for (var i = 0; i < types.length; i++) {
    var row = Titanium.UI.createTableViewRow({
        title : types[i].title,
        color : 'black',
        height : '44',
        rightImage : '/images/arrow.png'
    });
    rowArray.push(row);
}
$.table.setData(rowArray);

/**
 * Table cell click action listerner to identify user choice to perform Fetch/Add/Update/Delete data from server table
 */
$.table.addEventListener('click', function(e) {
    switch (e.index) {
        case 0:
            //No authentication......           
            Alloy.Globals.azureMobileServices.setAppName(appName);
            //Alloy.Globals.useFilterForUnAuthorization = true;
            Ti.App.Properties.removeProperty('authenticationToken');
            Ti.App.Properties.removeProperty('authorizeClient');
            Alloy.createController('TableData');
            break;
        case 1:
            //With APP key .....
            var keys = {};
            keys.appName = appName;
            keys.appKey = appKey;
            Alloy.Globals.azureMobileServices.setAzureKeys(keys);
            Ti.App.Properties.removeProperty('authenticationToken');
            Ti.App.Properties.removeProperty('authorizeClient');
            Alloy.createController('TableData');
            break;
        case 2:
            //With login .....
            Alloy.Globals.azureMobileServices.setAppName(appName);
            var authenticationClients = [];
            if (OS_ANDROID) {
                authenticationClients = ['Google', 'Facebook', 'Twitter', 'Microsoft Account', 'Active Directory'];
                var dialog = Ti.UI.createOptionDialog({
                    options : authenticationClients,
                    title : 'Select a client'
                });
            } else {
                authenticationClients = ['Google', 'Facebook', 'Twitter', 'Microsoft Account', 'Active Directory', 'Cancel'];
                var dialog = Ti.UI.createOptionDialog({
                    options : authenticationClients,
                    title : 'Select a client'
                });
            }

            dialog.addEventListener('click', function(evt) {
                var index = evt.index;
                if (index >= 0 && index <= 4) {
                    var str = authenticationClients[evt.index];
                    str = str.replace(/ /g, '');
                    var authorizeClient = str.toLowerCase();
                    if (authorizeClient == 'activedirectory')
                        authorizeClient = 'aad';
                    Alloy.Globals.azureMobileServices.authorizeClient(authorizeClient, function(result) {
                        if (result == 'true') {
                            Alloy.createController('TableData');
                        }
                    });
                } else {
                    dialog.hide();
                }
            });
            dialog.show();
            /**
             * Below lines are used to send particular identity provider to request authentication
             */
            // var authorizeClient = "Google";
            // authorizeClient = authorizeClient.replace(/ /g, ''); //It will remove any spaces between words. For example Microsoft account
            // authorizeClient = authorizeClient.toLowerCase();
            // Alloy.Globals.azureMobileServices.authorizeClient(authorizeClient, function(result) {
            // if (result == 'true') {
            // Alloy.createController('TableData');
            // }
            // });
            break;
        case 3:
            //With client direct .....
            Alloy.Globals.azureMobileServices.setAppName(appName);
            var authenticationClients = [];
            if (OS_ANDROID) {
                authenticationClients = ['Google', 'Facebook', 'Microsoft Account'];
                var dialog = Ti.UI.createOptionDialog({
                    options : authenticationClients,
                    title : 'Select a client'
                });
            } else {
                authenticationClients = ['Google', 'Facebook', 'Microsoft Account', 'Cancel'];
                var dialog = Ti.UI.createOptionDialog({
                    options : authenticationClients,
                    title : 'Select a client'
                });
            }
            dialog.addEventListener('click', function(evt) {
                var index = evt.index;
                if (index >= 0 && index <= 2) {
                    var str = authenticationClients[evt.index];
                    str = str.replace(/ /g, '');
                    var authorizeClient = str.toLowerCase();
                    var request = {};
                    if (evt.index == 3) {
                        dialog.hide();
                        return;
                    } else if (evt.index == 0) {
                        request.access_token = '';
                        //Please enter google's access token here
                    } else if (evt.index == 1) {
                        request.access_token = '';
                        //Please enter facebook's access token here
                    } else if (evt.index == 2) {
                        request.authenticationToken = '';
                        //Please enter Microsoft's access token here
                    }
                    Alloy.Globals.azureMobileServices.GetAuthenticationTokenUsingClientAuthorize(authorizeClient, request, function(response) {
                        Alloy.createController('TableData');
                    }, function(errorMessage) {
                        var errorJson = JSON.parse(JSON.stringify(errorMessage));
                        alert(errorJson.error);
                    });
                }
            });
            dialog.show();
            break;
        default:
            Alloy.Globals.azureMobileServices.setAppName(appName);
            break;
    }
});

