var bgp = chrome.extension.getBackgroundPage();
var searchNote = bgp.searchNote;

document.addEventListener('DOMContentLoaded', function() {
    showNote();
});

$(document).keyup(function(e) {
    if (e.keyCode == 27) {closeWindow()};
});

function shortString(str, len) {
    if (str.length > len) {
        return str.slice(0,len-3) + '...'
    } else {
        return str;
    }
}

function fitTitle(title) {
    return shortString(title, 34);
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
    document.getElementById('titleRow').innerHTML = '<b><a href="' + decodeURIComponent(searchNote.href) + '">' + fitTitle(decodeURIComponent(searchNote.title)) + '</a></b>';
    document.getElementById('textRow').innerHTML = fitText(decodeURIComponent(searchNote.text));
    $('#binding').keyup(function(e) {
        if (e.keyCode == 13) {saveNote();}
    });
    $('#search').attr('data-provide', 'typeahead');
    $('#search').attr('data-items', 4);
    $('#search').attr('data-source', bgp.make_data_source());
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
    binding = $("#binding").val();
    if (mapping) {
        chrome.extension.getBackgroundPage().logSearchNote(mapping);
        if (binding == 1 || binding == 2) {
            chrome.extension.getBackgroundPage().dbChangeBinding(binding, mapping);
        }
        closeWindow();
    }
};
