var domainName = 'http://www.seekaizen.com';

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "logNote") {
        logNote(request.text, request.title, request.href, request.keyCode);
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
    var sendText = makeSendText({'binding':binding, 'mapping':encodeURIComponent(mapping)});
    var xhr = newXMLRequest("POST", domainName + "/xhr_bindings", sendText);
    chrome.storage.sync.get(null, function(response) {
        if ('bindings' in response) {
            console.log('got bindings');
            bindings = response.bindings;
            bindings[binding] = mapping;
            setBindingsToStorage(bindings);
        }
        else {
            console.log('bindings not in response');
        }
    });
}

function logNote(text, title, href, keyCode) {
    var stateChangeFunction = function() {
        if (this.readyState == 4) {
            if (this.status == 201) {flashIcon();}
        }
    }
    var sendText = makeSendText({'text':text, 'title':title, 'href':href,
                                 'keyCode':keyCode});
    var xhr = newXMLRequest("POST", domainName + "/xhr_notes",
                            sendText, stateChangeFunction);
}

function flashIcon() {
    chrome.browserAction.setIcon({path:"k_16_flash.gif"});
    setTimeout(function(){chrome.browserAction.setIcon({path:"k_icon16.gif"})}, 200);
}

function setNameToStorage(first, last) {
    chrome.storage.sync.set({'first':first, 'last':last}, function() {
        console.log("saved named to storage");
//         message("this would return a message back to popup.js");
    });
}

function setBindingsToStorage(bindings) {
    chrome.storage.sync.set({'bindings':bindings}, function() {
        console.log("saved bindings to storage " + bindings);
    });
}

function clearUserData() {
    chrome.storage.sync.clear(function() {
        console.log("cleared data in storage");
    });
}

function getStoredUser(inCallback, outCallback) {
    chrome.storage.sync.get(null, function(response) {
        if ('bindings' in response && 'first' in response && 'last' in response) {console.log("going to showLoggedIn"); inCallback(response);}
        else {console.log("going to showLoggedOut"); outCallback();}
    });
}