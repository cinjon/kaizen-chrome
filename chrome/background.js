// var domainName = 'http://www.seekaizen.com';
var domainName = 'http://0.0.0.0:5000';
var maxBindings = 2;
var searchNote = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "logNote") {
        logNote(request.text, request.title, request.href, request.keyCode);
    } else if (request.method == "showSearch") {
        showSearch(request.text, request.title, request.href);
    }
});

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
    var sendText = makeSendText({'text':text, 'title':title, 'href':href, 'keyCode':keyCode});
    var xhr = newXMLRequest("POST", domainName + "/xhr_notes",
                            sendText, stateChangeFunction);
}

function showSearch(text, title, href) {
    var w = 372;
    var h = 100;
    var left = screen.width - w - 20;
    var top = 0;
    searchNote = {'text':text, 'title':title, 'href':href};
    chrome.windows.create({'url':'squiggle.html', 'type':'popup',
                           'height':h, 'width':w, 'focused':true,
                           'left':left, 'top':top});
}

function logSearchNote(mapping, userGeneratedNote) {
    var stateChangeFunction = function() {
        if (this.readyState == 4) {
            if (this.status == 201) {flashIcon();}
        }
    }
    if (searchNote) {
        var sendText = makeSendText({'text':searchNote['text'],
                                    'title':searchNote['title'],
                                    'href':searchNote['href'],
                                    'mapping':mapping,
                                    'ugn':userGeneratedNote});
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
//     clearUserData()
    chrome.storage.sync.get(['name', 'nameRoute', 'mapnames', 'binding_1', 'binding_2'], function(response) {
        if ('name' in response) {inCallback(response);}
        else {outCallback();}
    });
}
