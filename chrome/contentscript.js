var maxBindings = 2;

window.addEventListener("keydown", function(event) {
    var modifier = event.ctrlKey;
    var keyCode = event.keyCode;
    if (modifier && keyCode <= maxBindings+48 && keyCode >= 49) {logNote(keyCode-48);}
    else if (modifier && keyCode == 192) {showSearch();}
});

function logNote(keyCode) {
    console.log('logging note: ' + keyCode);
    //TODO -- send img, smart text search.
    var text = encodeURIComponent(window.getSelection().toString());
    var title = encodeURIComponent(document.title);
    var href = encodeURIComponent(location.href);
    chrome.extension.sendMessage({method:"logNote", text:text, title:title,
                                  href:href, keyCode:keyCode});

}

function showSearch() {
    chrome.extension.sendMessage({method:"showSearch"});
}
