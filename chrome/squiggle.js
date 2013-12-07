var bgp = chrome.extension.getBackgroundPage();
var searchNote = bgp.searchNote;

document.addEventListener('DOMContentLoaded', function() {
    showNote();
});

function shortString(str, len) {
    if (str.length > len) {
        return str.slice(0,len-3) + '...'
    } else {
        return str;
    }
}

function fitTitle(title) {
    return shortString(title, 40);
}

function fitText(text) {
    return shortString(text, 200);
}

function noTypeahead() {
    var typeahead = $('.typeahead');
    if (!typeahead || typeahead.css("display") == "none") {
        return true;
    }
    return false;
}

function showNote() {
    document.getElementById('title').innerHTML = '<b>' + fitTitle(decodeURIComponent(searchNote.title)) + '</b>';
    document.getElementById('text').innerHTML = fitText(decodeURIComponent(searchNote.text));
    $('#search').attr('data-provide', 'typeahead');
    $('#search').attr('data-items', 4);
    $('#search').attr('data-source', bgp.make_data_source());
    $('#search').
    $('#search').keyup(function(e) {
        if (e.keyCode == 13 && noTypeahead()) {saveNote();}
        else if (e.keyCode == 27) {closeWindow();}
    });
    $('#search').focus();
}

function closeWindow() {
    //Close this window
    window.close();
}

function saveNote() {
    mapping = $("#search").val();
    if (mapping) {
//         chrome.extension.getBackgroundPage().logSearchNote(mapping);
//         closeWindow();
    } else {
        console.log('no map, need a map');
    }
};
