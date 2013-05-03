window.addEventListener("keydown", function(event) {
    var modifier = event.ctrlKey;
    var keyCode = event.keyCode;
    if (modifier && keyCode <= 53 && keyCode >= 49) {logNote(keyCode-48);}
});

function logNote(keyCode) {
    //should send img too. that'd be good to have.
    var text = encodeURIComponent(window.getSelection().toString());
    var title = encodeURIComponent(document.title);
    var href = encodeURIComponent(location.href);
    chrome.extension.sendMessage({method:"logNote", text:text, title:title,
                                  href:href, keyCode:keyCode});

}

