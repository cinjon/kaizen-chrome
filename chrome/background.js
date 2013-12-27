var domainName = 'http://www.seekaizen.com';
// var domainName = 'http://0.0.0.0:5000';
var maxBindings = 4;
var searchNote = null;
var userNameRoute = false;
var userMapnames = false;
var userName = false;
var userModifier = 'ctrlKey';

chrome.runtime.onInstalled.addListener(function() {
    //runs when extension is installed or reloaded.
    // Use it to sync the user if nothing changed in store
    clearUserData();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "logNote" && request[userModifier]) {
        logNote(request.text, request.title, request.href, request.keyCode);
    } else if (request.method == "showSearch" && request[userModifier]) {
        showSearch(request.text, request.title, request.href);
    }
});

function verifyModifier(request) {
    if (userModifier && userModifier == 'ctrlKey' && request.ctrlKey) {
        return true;
    } else if (userModifier && userModifier == 'altKey' && request.altKey) {
        return true;
    } else {
        return false;
    }
}

function newXMLRequest(httpType, address, sendText, stateChangeFunction) {
    var xhr = new XMLHttpRequest();
    xhr.open(httpType, address, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.onreadystatechange = stateChangeFunction;
    xhr.send(sendText);
}

function makeSendText(d) {
    var text = '';
    for (var key in d) {
        if (text != '') {
            text += ('&' + key + '=' + d[key]);
        } else {
            text += (key + '=' + d[key]);
        }
    }
    return text;
}

function dbChangeBinding(binding, mapping) {
    var stateChangeFunction = function() {
        if (this.readyState == 4) {
            if (this.status == 201) {
                key = 'binding_' + binding;
                setToStorage(key, mapping);
            }
        }
    }
    var sendText = makeSendText({'binding':binding, 'mapping':encodeURIComponent(mapping)});
    var xhr = newXMLRequest("POST", domainName + "/xhr_bindings", sendText, stateChangeFunction);
}

function logNote(text, title, href, keyCode) {
    var stateChangeFunction = function() {
        if (this.readyState == 4) {
            if (this.status == 201) {flashIcon();}
        }
    }
    var sendText = makeSendText({'text':text, 'title':title,
                                 'href':href, 'keyCode':keyCode});
    var xhr = newXMLRequest("POST", domainName + "/xhr_notes",
                            sendText, stateChangeFunction);
}

function showSearch(text, title, href) {
    var w = 372;
    var h = 150;
    if (text == '') {
        h = 25;
    }
    var left = screen.width - w - 20;
    var top = screen.height/4;
    searchNote = {'text':text, 'title':title, 'href':href};
    chrome.windows.create({'url':'squiggle.html', 'type':'popup',
                           'height':h, 'width':w, 'focused':true,
                           'left':left, 'top':top});
}

function logSearchNote(mapping) {
    updateMapnames(mapping);
    var stateChangeFunction = function() {
        if (this.readyState == 4) {
            if (this.status == 201) {flashIcon();}
        }
    }
    if (searchNote) {
        var sendText = makeSendText({'text':searchNote['text'],
                                     'title':searchNote['title'],
                                     'href':searchNote['href'],
                                     'mapping':mapping});
        var xhr = newXMLRequest("POST", domainName + "/xhr_notes",
                                sendText, stateChangeFunction);
    }
}

function flashIcon() {
    chrome.browserAction.setIcon({path:"kaizenIcon16Flash.png"});
    setTimeout(function(){chrome.browserAction.setIcon({path:"kaizenIcon16.png"})}, 200);
}

function setToStorage(key, value) {
    var store_dict = {};
    store_dict[key] = value;
    chrome.storage.sync.set(store_dict);
}

function clearUserData() {
    chrome.storage.sync.clear();
}

function getStoredUser(inCallback, outCallback) {
    var syncArray = ['name', 'nameRoute', 'mapnames', 'modifier'];
    for (var i = 1; i < maxBindings+1; i ++) {
        syncArray.push('binding_' + i);
    }
    chrome.storage.sync.get(syncArray, function(response) {
        if ('name' in response) {inCallback(response);}
        else {outCallback();}
    });
}

function make_data_source(names) {
    if (!names) {
        names = userMapnames;
    }
    data_source = "[";
    for (var i = 0; i < names.length; i++) {
        data_source = data_source + '"' + names[i] + '"';
        if (i < names.length - 1) {
            data_source += ',';
        } else {
            data_source += ']';
        }
    }
    return data_source;
}

function updateMapnames(mapname) {
    if (userMapnames.indexOf(mapname) == -1) {
        userMapnames.push(mapname);
        setToStorage('mapnames', userMapnames);
        return true;
    } else {
        return false;
    }
}
