var maxBindings = 2;

window.addEventListener("keydown", function(event) {
    var modifier = event.ctrlKey;
    var keyCode = event.keyCode;
    if (modifier && keyCode <= maxBindings+48 && keyCode >= 49) {logNote(keyCode-48);}
    else if (modifier && keyCode == 192) {showSearch();}
});

function _getPageComponents() {
    var text = encodeURIComponent(window.getSelection().toString());
    var href = encodeURIComponent(location.href);
    var title = encodeURIComponent(document.title);
    return {text:text, href:href, title:title};
}

function logNote(keyCode) {
    //TODO -- send img, smart text search.
    var msg = _getPageComponents();
    msg['method'] = "logNote";
    msg['keyCode'] = keyCode;
    chrome.runtime.sendMessage(msg);
}

function showSearch() {
    var msg = _getPageComponents();
    msg['method'] = "showSearch";
    chrome.runtime.sendMessage(msg);
}
