
var query = "?$filter=complete%20eq%20false";
var tableName = "TodoItem";
var json;

//To get data from table
getData(function(e) {
    $.table.setData(e.data);
});

//To update data from table
$.table.addEventListener('click', function(e) {
    var id = e.index;
    title = e.row.title;
    if (OS_ANDROID) {
        addOrUpdateDataFromAndroid(id, title, true, function(ee) {
            $.table.setData(ee.data);
        });
    } else {
        updateOrAddData(id, title, true, function(ee) {
            $.table.setData(ee.data);
        });
    }
});

//To add data into table
function addtextToserver() {
    var id = '';
    title = '';
    if (OS_ANDROID) {
        addOrUpdateDataFromAndroid(id, title, false, function(ee) {
            $.table.setData(ee.data);
        });
    } else {
        updateOrAddData(id, title, false, function(ee) {
            $.table.setData(ee.data);
        });
    }
}

function backButtonClicked() {
    $.tableData.close();
}

$.tableData.open({
    navBarHidden : true
});

//To delete data from table in iOS
$.table.addEventListener("delete", function(e) {
    if (Titanium.Network.networkType == Titanium.Network.NETWORK_NONE) {
        alert('Please check your internet connection');
    } else {
        var id = e.index;
        iOSSwipeDelete(id, function(ee) {
            $.table.setData(ee.data);
        });
    }

});

//To delete data from table in android
$.table.addEventListener('longclick', function(e) {
    var id = e.index;
    // alert(id);
    androidLongPressDelete(e.index, function(ee) {
        $.table.setData(ee.data);
    });
});

//To refresh data from in table
if (Ti.Platform.name == "android") {
    refreshAndroid($.tableData, function(ee) {
        $.table.setData(ee.data);
    });
} else {
    var table = $.table;
    iOSPullToRefresh(table, function(ee) {
        $.table.setData(ee.data);
    });
}

/**
 * Querry to get data from server table
 * @return callback - returns data from server table
 */
function getData(callback) {
    var textArray = [];
    Alloy.Globals.azure.QueryTable('notes', query, function(jsonResponse) {
        json = JSON.parse(jsonResponse);
        for (var i = 0; i < json.length; i++) {
            var row = Titanium.UI.createTableViewRow({
                title : json[i].text,
                height : '44',
                color : 'black',
                rightImage : '/images/edit.png'
            });
            var r = i % 2;
            if (r != 0) {
                row.backgroundColor = '#e4f0f4';
            };
            textArray.push(row);
        }
        callback({
            data : textArray
        });
    }, function(errorMessage) {
        var errorJson = JSON.parse(JSON.stringify(errorMessage));
        alert(errorJson.error);
    });
};

/**
 * iOS default swipe delete
 * @param id - contains the table cell row index path
 * @return callback - returns data from server table
 */
function iOSSwipeDelete(id, callback) {
    var id = json[id].id;
    Alloy.Globals.azureMobileServices.DeleteTable(tableName, id, function(jsonResponse) {
        getData(function(ee) {
            callback({
                data : ee.data
            });
        });
    }, function(errorMessage) {
        var errorJson = JSON.parse(JSON.stringify(errorMessage));
        alert(errorJson.error);
        getData(function(ee) {
            callback({
                data : ee.data
            });
        });
    });
};

/**
 * Android long press delete
 * @param id - contains the table cell row index path
 * @return callback - returns data from server table
 */
function androidLongPressDelete(id, callback) {
    var index = id;
    var dialog = Ti.UI.createAlertDialog({
        title : 'Are you sure want to delete this data?',
        buttonNames : ['OK', 'Cancel']
    });
    dialog.addEventListener('click', function(e) {
        if (e.index == 0) {
            var id = json[index].id;

            Alloy.Globals.azureMobileServices.DeleteTable(tableName, id, function(jsonResponse) {
                getData(function(ee) {
                    callback({
                        data : ee.data
                    });
                });
            }, function(errorMessage) {
                var errorJson = JSON.parse(JSON.stringify(errorMessage));
                alert(errorJson.error);
            });
        };
    });
    dialog.show();
};

/**
 * Add/update data to/from table in android
 * @param idd - contains the table cell row index path
 * @param title - contains cell textif it is update the data
 * @param addOrUpdate - boolean contains whether it is adding new data or updating the existing data
 * @return callback - returns data from server table
 */
function addOrUpdateDataFromAndroid(idd, title, addOrUpdate, callback) {
    var alertTypeView = Titanium.UI.createView({
        backgroundImage : '/images/pop-bg.png',

    });
    var alertTitleLabel = Titanium.UI.createLabel({
        top : '0',
        width : '100%',
        height : '35',
        left : '0%',
        text : "Enter Data",
        textAlign : 'center',
        color : 'black',

        backgroundColor : '#00BCF2',
        font : {
            fontSize : 16,
            fontWeight : 'bold'
        }
    });

    var alertTextField = Titanium.UI.createTextField({
        top : '50',
        width : '90%',
        height : '40',
        left : '5%',
        color : 'black',
        borderRadius : 5,
        borderWidth : 1,
        borderColor : 'gray',
        keyboardType : Titanium.UI.KEYBOARD_DEFAULT,
        returnKeyType : Titanium.UI.RETURNKEY_DONE,
        backgroundColor : 'white',
        hintText : "Enter data here",
        focusable : 'true',
        paddingLeft : "10"
    });
    alertTextField.addEventListener('change', function(e) {
        var text = e.source.value;
        if (e.source.value.length > 50) {
            e.source.blur();
            e.source.value = e.source.value.substr(0, 50);
        }

    });
    if (addOrUpdate) {
        alertTextField.value = title;
        alertTitleLabel.text = "Update Data";
    }

    var closeButton = Titanium.UI.createButton({
        top : '100',
        right : '20',
        width : '90',
        height : '40',
        title : 'Cancel',
        backgroundImage : '/images/cancel.png'
    });
    closeButton.addEventListener('click', function(e) {
        dialog.hide();
    });
    var saveButton = Titanium.UI.createButton({
        top : '100',
        left : '20',
        width : '90',
        height : '40',
        title : 'Save',
        backgroundImage : '/images/save.png'
    });
    saveButton.addEventListener('click', function(e) {
        if (addOrUpdate) {
            var value = alertTextField.value;
            if (value != "" && value != null && value.trim() != "") {
                var id = json[idd].id;
                var request = {
                    'text' : value,
                    'complete' : false
                };
                Alloy.Globals.azureMobileServices.UpdateTable(tableName, id, request, function(response) {
                    getData(function(ee) {
                        callback({
                            data : ee.data
                        });
                    });
                    dialog.hide();
                }, function(errorMessage) {
                    dialog.hide();
                    var errorJson = JSON.parse(JSON.stringify(errorMessage));
                    alert(errorJson.error);
                });
            } else {
                alert('Please enter data');
            }
        } else {
            var value = alertTextField.value;
            if (value != "" && value != null && value.trim() != "") {
                var request = {
                    'text' : alertTextField.getValue(),
                    'complete' : false
                };
                Alloy.Globals.azureMobileServices.InsertTable(tableName, request, function(jsonResponse) {

                    getData(function(ee) {
                        callback({
                            data : ee.data
                        });
                    });
                }, function(errorMessage) {
                    var errorJson = JSON.parse(JSON.stringify(errorMessage));
                    alert(errorJson.error);
                });
                dialog.hide();
            } else {
                alert('Please enter data');
            }
        }
    });

    var hiddenLabel = Titanium.UI.createLabel({
        top : '130',
        width : '100%',
        height : '20',
        left : '0%'
    });

    alertTypeView.add(alertTitleLabel);
    alertTypeView.add(alertTextField);
    alertTypeView.add(closeButton);
    alertTypeView.add(saveButton);
    alertTypeView.add(hiddenLabel);

    var dialog = Ti.UI.createAlertDialog({
        backgroundColor : "white",
        androidView : alertTypeView
    });

    dialog.show();
};

/**
 * Add/update data to/from table in iOS
 * @param idd - contains the table cell row index path
 * @param title - contains cell textif it is update the data
 * @param addOrUpdate - boolean contains whether it is adding new data or updating the existing data
 * @return callback - returns data from server table
 */
function updateOrAddData(idd, title, addOrUpdate, callback) {
    //  alert(idd);
    var alertWin = Titanium.UI.createWindow({
        width : '100%',
        height : '100%',
        backgroundColor : 'black',
        opacity : 0.6
    });
    var alertViewBackWindow = Titanium.UI.createWindow({
        top : '20%',
        width : '90%',
        height : 150,
        backgroundColor : 'white',
    });
    var alertTypeView = Titanium.UI.createView({
        top : '0%',
        borderWidth : 1,
        borderColor : 'gray',
        width : '100%',
        height : 150,
        opacity : 1.0,
        backgroundImage : '/images/pop-bg.png'
    });

    var alertTitleLabel = Titanium.UI.createLabel({
        top : '0',
        width : '100%',
        height : '35',
        left : '0%',
        text : "Enter Data",
        textAlign : 'center',
        color : 'black',
        backgroundColor : '#00BCF2',
        font : {
            fontSize : 16,
            fontWeight : 'bold'
        }
    });
    var alertTextField = Titanium.UI.createTextField({
        top : '50',
        width : '90%',
        height : '40',
        left : '5%',
        color : 'black',
        borderRadius : 5,
        borderWidth : 1,
        borderColor : 'gray',
        keyboardType : Titanium.UI.KEYBOARD_DEFAULT,
        returnKeyType : Titanium.UI.RETURNKEY_DONE,
        backgroundColor : 'white',
        focusable : 'true',
        hintText : "Enter data here",
        paddingLeft : "10"
    });
    alertTextField.addEventListener('change', function(e) {
        var text = e.source.value;
        if (e.source.value.length > 50) {
            e.source.blur();
            e.source.value = e.source.value.substr(0, 50);
        }
    });
    if (addOrUpdate) {
        alertTextField.value = title;
        alertTitleLabel.text = "Update Data";
    }
    var closeButton = Titanium.UI.createButton({
        top : '100',
        right : '20',
        width : '90',
        height : '40',
        title : 'Cancel',
        backgroundImage : '/images/cancel.png'
    });
    closeButton.addEventListener('click', function(e) {
        alertWin.close({
            animated : true
        });
        alertViewBackWindow.close({
            animated : true
        });
    });
    var saveButton = Titanium.UI.createButton({
        top : '100',
        left : '20',
        width : '90',
        height : '40',
        title : 'Save',
        backgroundImage : '/images/save.png'
    });
    saveButton.addEventListener('click', function(e) {
        if (addOrUpdate) {
            var value = alertTextField.value;
            if (value != "" && value != null && value.trim() != "") {
                var id = json[idd].id;
                var request = {
                    'text' : value,
                    'complete' : false
                };
                Alloy.Globals.azureMobileServices.UpdateTable(tableName, id, request, function(response) {
                    getData(function(ee) {
                        callback({
                            data : ee.data
                        });
                    });
                    alertWin.close({
                        animated : true
                    });
                    alertViewBackWindow.close({
                        animated : true
                    });
                }, function(errorMessage) {
                    alertWin.close({
                        animated : true
                    });
                    alertViewBackWindow.close({
                        animated : true
                    });
                    var errorJson = JSON.parse(JSON.stringify(errorMessage));
                    alert(errorJson.error);
                });
            } else {
                alert('Please enter data');
            }
        } else {
            var value = alertTextField.value;
            if (value != "" && value != null && value.trim() != "") {
                var request = {
                    'text' : alertTextField.getValue(),
                    'complete' : false
                };
                Alloy.Globals.azureMobileServices.InsertTable(tableName, request, function(jsonResponse) {

                    getData(function(ee) {
                        callback({
                            data : ee.data
                        });
                    });
                }, function(errorMessage) {
                    var errorJson = JSON.parse(JSON.stringify(errorMessage));
                    alert(errorJson.error);
                });
                alertWin.close({
                    animated : true
                });
                alertViewBackWindow.close({
                    animated : true
                });
            } else {
                alert('Please enter data');
            }
        }
    });

    alertTypeView.add(alertTitleLabel);
    alertTypeView.add(alertTextField);
    alertTypeView.add(closeButton);
    alertTypeView.add(saveButton);

    alertViewBackWindow.add(alertTypeView);

    alertWin.open({
        animated : true,
        navBarHidden : true
    });
    alertViewBackWindow.open({
        animated : true,
        navBarHidden : true
    });
};

/**
 * Refresh data in android
 * @param win - to get the activity of current window
 * @return callback - returns data from server table
 */

function refreshAndroid(win, callback) {
    var activity = win.activity;
    activity.onCreateOptionsMenu = function(e) {
        var menu = e.menu;
        var menuItem = menu.add({
            title : "Refresh",
            showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER
        });
        menuItem.addEventListener("click", function(e) {
            getData(function(ee) {
                callback({
                    data : ee.data
                });
            });
        });
    };

};

/**
 * Refresh data in iOS
 * @param table - to refresh the data
 * @return callback - returns data from server table
 */
function iOSPullToRefresh(table, callback) {
    var control = Ti.UI.createRefreshControl({
        tintColor : '#00CCFF'
    });
    table.refreshControl = control;
    control.addEventListener('refreshstart', function(e) {
        setTimeout(function() {
            getData(function(ee) {
                callback({
                    data : ee.data
                });
            });
            control.endRefreshing();
        }, 2000);
    });
};
