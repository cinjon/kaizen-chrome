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
    setTimeout(function(){chrome.browserAction.setIcon({path:"k_icon16.gif"})}, 400);
}