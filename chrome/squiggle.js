document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#cancel').addEventListener('click', closeWindow);
    document.querySelector('#save').addEventListener('click', saveNote);
});

$("#search").keyup(function(e) {
    var query = $("#search").val();
    console.log("query is: " + query);
});

$(document).keyup(function(e) {
    keyCode = e.keyCode;
    if (keyCode == 13) {$('#save').click();}
    else if (keyCode == 27) {$('#cancel').click();}
});

function closeWindow() {
    //Close this window
    console.log('closing window');
    window.close();
}

function saveNote() {
    console.log('saving note');
    mapping = $("#search").val();
    optionalNote = $("#note").val();
    if (mapping) {
        console.log('mapping exists, logging via bgp');
        chrome.extension.getBackgroundPage().logSearchNote(mapping, optionalNote);
        closeWindow();
    } else {
        console.log('no map, need a map');
    }
};
