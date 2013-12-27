var maxBindings = 4;

window.addEventListener("keydown", function(event) {
    var keyCode = event.keyCode;
    if (keyCode <= maxBindings+48 && keyCode >= 49) {
        logNote(keyCode-48, event.altKey, event.ctrlKey);
    }
    else if (keyCode == 192) {
        showSearch(event.altKey, event.ctrlKey);}
});

function _getPageComponents() {
    var text = encodeURIComponent(window.getSelection().toString());
    var href = encodeURIComponent(location.href);
    var title = encodeURIComponent(document.title);
    return {text:text, href:href, title:title};
}

function logNote(keyCode, altKey, ctrlKey) {
    //TODO -- send img, smart text search.
    var msg = _getPageComponents();
    msg['method'] = "logNote";
    msg['keyCode'] = keyCode;
    msg['altKey'] = altKey;
    msg['ctrlKey'] = ctrlKey;
    chrome.runtime.sendMessage(msg);
}

function showSearch(altKey, ctrlKey) {
    var msg = _getPageComponents();
    msg['method'] = "showSearch";
    msg['altKey'] = altKey;
    msg['ctrlKey'] = ctrlKey;
    chrome.runtime.sendMessage(msg);
}
