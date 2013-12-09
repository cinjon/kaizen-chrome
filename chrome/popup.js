var bgp = chrome.extension.getBackgroundPage();
var domainName = bgp.domainName;
var maxBindings = bgp.maxBindings;
var enableRegister = false;

document.addEventListener('DOMContentLoaded', function () {
//    Change this so that it uses session vars to log in if logged into site
//     loggedInCheck(showLoggedIn, attemptLoginServer);
    document.querySelector('#logoutSubmit').addEventListener('click', logoutFormSubmit);
    loggedInCheck(showLoggedIn, showLoggedOut);
});

function loginRequest(email, password, callback1, callback2) {
    if (!callback2) {callback2 = callback1;}
    stateChangeFunction = function() {
        if (this.readyState == 4) {
            if (this.status == 202) {
                callback1(JSON.parse(this.responseText));
            } else {
                callback2(null);
            }
        }
    }
    bgp.newXMLRequest("POST", domainName + "/ext-login",
                      "email=" + email + "&password=" + password,
                      stateChangeFunction);
}

function registerRequest(email, password, first, last, callback) {
  if (enableRegister){
    stateChangeFunction = function() {
        if (this.readyState == 4) {
            if (this.status == 202) {callback(JSON.parse(this.responseText));}
            else {console.log('failed to register');} //TODO
        }
    }
    bgp.newXMLRequest("POST", domainName + "/ext-register",
                      "email=" + email + "&password=" + password + "&first=" + first + "&last=" + last,
                      stateChangeFunction);
  }
}

function logoutRequest(callback) {
    stateChangeFunction = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                callback();
            }
        }
    }
    bgp.newXMLRequest("GET", domainName + "/ext-logout",
                      "", stateChangeFunction);
}

function registerLinkClick() {
  chrome.tabs.create({url: domainName});
  return false;
}

function loginFormSubmit() {
    email = document.querySelector('#email').value;
    password = document.querySelector('#password').value;
    if (checkEmailPassword(email, password)) {
        loginRequest(email, password, handleLoginResponse);
    } else {
        //TODO
        console.log('you need to enter something yo');
    }
}

function logoutFormSubmit() {
    logoutRequest(handleLogoutResponse);
}

function handleLoginResponse(data) {
    if (!data || data.length == 0) {showLoggedOut();}
    else {
        showLoggedIn(data, setUserInfo);
    }
}

function handleLogoutResponse() {
    clearData();
    showLoggedOut();
}

function checkEmailPassword(email, password) {
    if (!email || !password) {
        return false;
    }
    if (password == "@") {
        return false;
    }
    var splitEmail = email.split("@");
    if (splitEmail.length != 2 || splitEmail[0] == "" || splitEmail[1] == "") {
        return false;
    }
    return true;
}

function checkFirstLast(first, last) {
    if (!first || !last || /[^a-zA-Z]/.test(first + last)) {
        return false;
    }
    return true;
}

function showUsername() {
    document.querySelector('#userName').innerHTML = '<b>' + bgp.userName + '</b>';
}

function showBindings(bindings, mapnames) {
    var rows = document.querySelector('#mapsUGC');
    for (var i = 1; i < maxBindings+1; i++) {
        var row = document.createElement('div'); //the overarching row
        var binding = document.createElement('div'); //the integer to ctrl-key
        var mapping = document.createElement('div'); //the mapping that it submits
        var mapinput = document.createElement('input'); //change the mapping

        row.className = 'row';
        binding.className = 'span1 mapBinding';
        mapping.className = 'span2 mapName';
        mapinput.className = 'span2 inputBoxMap';
        mapinput.tabIndex = i;

        binding.innerHTML = i;
        if (bindings[i]) {
            setMapBinding(mapping, bindings[i]);
        } else {
            mapping.innerHTML = "";
        }

        binding.style.marginTop = "5px";
        mapping.style.marginTop = "5px";
        binding.style.fontSize = "10px";

        row.appendChild(binding);
        row.appendChild(mapping);
        row.appendChild(mapinput);
        rows.appendChild(row);

        addMapinputAttrs(mapinput, mapnames);
    }
    $('input.inputBoxMap').keyup(function (e) {
        if (e.keyCode == 13) {
            mapChangesHandler();
            return false;
        }
    });
}

function addMapinputAttrs(input, mapnames) {
    input.type = 'text';
    input.setAttribute('data-provide', 'typeahead');
    input.setAttribute('data-items', 4);
    input.setAttribute('data-source', bgp.make_data_source(mapnames));
}

function setMapBinding(mappingSpan, mapping) {
    mappingSpan.innerHTML = '<b><a href="#">' + mapping + '</a></b>';
    mappingSpan.addEventListener('click', function() {
        var url = domainName + '/user/' + bgp.userNameRoute + '/' + mapping;
        chrome.tabs.create({url:url});
    });
};

function attemptLoginServer() {
    loginRequest('', '', handleLoginResponse, shoowLoggedOut);
};

function showLoggedOut() {
    document.querySelector('#loginSubmit').addEventListener('click', loginFormSubmit);
    document.querySelector('#registerLink').addEventListener('click', registerLinkClick);
    document.querySelector('#goKaizen').addEventListener('click', function() {
        chrome.tabs.create({url:domainName});
    });
    changeDisplay('loggedOut', 'block');
    changeDisplay('loggedIn', 'none');
}

function setUserInfo(response) {
    bgp.setToStorage('name', response.name);
    bgp.setToStorage('nameRoute', response.nameRoute);
    bgp.setToStorage('mapnames', response.mapnames);
    for (var key in response) {
        if (key.slice(0,7) == 'binding') {
            bgp.setToStorage(key, response[key]);
        }
    }
}

function showLoggedIn(response, callback) {
    changeDisplay('loggedOut', 'none');
    changeDisplay('loggedIn', 'block');
    bgp.userName = response.name;
    bgp.userNameRoute = response.nameRoute;
    bgp.userMapnames = response.mapnames;

    showUsername();
    var bindings = {};
    for (var i = 1; i < maxBindings+1; i++) {
        key = 'binding_' + i;
        if (key in response) {
            bindings[i] = response[key];
        }
    }
    showBindings(bindings, response.mapnames);
    document.querySelector('#mapChangesSubmit').addEventListener('click', mapChangesHandler);
    document.querySelector('#userName').addEventListener('click', function() {
        var url = domainName + '/me'
        chrome.tabs.create({url:url});
    });

    if (callback) {
        //intended for settinguserinfo
        callback(response);
    }
}

function changeDisplay(elementID, display) {
    if (display == 'none' || display == 'block') {
        document.getElementById(elementID).style.display = display
    }
}

function checkValidInput(input) {
    return (input && input != "");
}

function mapChangesHandler() {
    var rows = document.querySelector('#mapsUGC');
    for (var i = 0; i < rows.childNodes.length; i++) {
        var maps = rows.childNodes[i].childNodes;
        var mappingSpan = maps[1];
        var oldMapping = mappingSpan.innerHTML;
        var newMapping = maps[2].value;

        if (newMapping != "" && (oldMapping != newMapping)) {
            setMapBinding(mappingSpan, newMapping);
            dbChangeBinding(maps[0].innerHTML, newMapping);
            updateMapnames(newMapping);
        }
        maps[2].value = "";
    }
}

function updateMapnames(mapname) {
    if (bgp.userMapnames.indexOf(mapname) == -1) {
        bgp.userMapnames.push(mapname);
        bgp.setToStorage('mapnames', bgp.userMapnames);
        $('input.inputBoxMap').attr('data-source', bgp.make_data_source(bgp.userMapnames));
    }
}

function dbChangeBinding(binding, mapping) {
    bgp.dbChangeBinding(binding, mapping);
}

function loggedInCheck(inCallback, outCallback) {
    bgp.getStoredUser(inCallback, outCallback);
}

function clearData() {
    var rows = document.querySelector('#mapsUGC');
    rows.innerHTML = "";
    bgp.clearUserData();
}