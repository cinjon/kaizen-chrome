var bgp = chrome.extension.getBackgroundPage();
var domainName = bgp.domainName;
var maxBindings = bgp.maxBindings;
var enableRegister = false;
var userName = false;
var userNameRoute = false;

document.addEventListener('DOMContentLoaded', function () {
//    Change this so that it uses session vars to log in if logged into site
//     loggedInCheck(showLoggedIn, attemptLoginServer);
    loggedInCheck(showLoggedIn, showLoggedOut);
    document.getElementById('userName').addEventListener('click', function() {
        var url = domainName + '/me'
        chrome.tabs.create({url:url});
    });
    document.getElementById('goKaizen').addEventListener('click', function() {
        chrome.tabs.create({url:domainName});
    });
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
    email = document.getElementById('email').value;
    password = document.getElementById('password').value;
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
    document.getElementById('userName').innerHTML = '<b>' + userName + '</b>';
}

function showBindings(bindings) {
    var rows = document.getElementById('mapsUGC');
    for (var i = 1; i < maxBindings+1; i++) {
        var row = document.createElement('div'); //the overarching row
        var binding = document.createElement('div'); //the integer to ctrl-key
        var mapping = document.createElement('div'); //the mapping that it submits
        var mapinput = document.createElement('input'); //change the mapping

        row.className = 'row';
        binding.className = 'span1';
        mapping.className = 'span2';
        mapinput.className = 'span2 inputBoxMap';
        mapinput.tabIndex = i;
        mapinput.type = 'text';

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
        }
}

function setMapBinding(mapping, binding) {
    mapping.innerHTML = '<b><a href="#">' + binding + '</a></b>';
    mapping.addEventListener('click', function() {
        var url = domainName + '/user/' + userNameRoute + '/' + binding;
        chrome.tabs.create({url:url});
    });
};

function attemptLoginServer() {
    loginRequest('', '', handleLoginResponse, showLoggedOut);
};

function showLoggedOut() {
    document.querySelector('#loginSubmit').addEventListener('click', loginFormSubmit);
    document.querySelector('#registerLink').addEventListener('click', registerLinkClick);
    changeDisplay('loggedOut', 'block');
    changeDisplay('loggedIn', 'none');
}

function setUserInfo(response) {
    bgp.setToStorage('name', response.name);
    bgp.setToStorage('nameRoute', response.nameRoute);
    for (var key in response) {
        if (key.slice(0,7) == 'binding') {
            bgp.setToStorage(key, response[key]);
        }
    }
}

function showLoggedIn(response, callback) {
    changeDisplay('loggedOut', 'none');
    changeDisplay('loggedIn', 'block');
    userName = response.name;
    userNameRoute = response.nameRoute;
    showUsername();
    var bindings = {};
    for (var i = 1; i < maxBindings+1; i++) {
        key = 'binding_' + i;
        if (key in response) {
            bindings[i] = response[key];
        }
    }
    showBindings(bindings);
    document.querySelector('#mapChangesSubmit').addEventListener('click', mapChangesHandler);
    document.querySelector('#logoutSubmit').addEventListener('click', logoutFormSubmit);
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

function mapChangesHandler() {
    var rows = document.getElementById('mapsUGC');
    for (var i = 0; i < rows.childNodes.length; i++) {
        var maps = rows.childNodes[i].childNodes;
        var oldMapping = maps[1].innerHTML;
        var inputMapping = maps[2].value;

        if (inputMapping != "" && (oldMapping != inputMapping)) {
            setMapBinding(maps[1], inputMapping);
            dbChangeBinding(maps[0].innerHTML, inputMapping);
        }
        maps[2].value = "";
    }
}

function dbChangeBinding(binding, mapping) {
    bgp.dbChangeBinding(binding, mapping);
}

function loggedInCheck(inCallback, outCallback) {
    bgp.getStoredUser(inCallback, outCallback);
}

function clearData() {
    var rows = document.getElementById('mapsUGC');
    rows.innerHTML = "";
    bgp.clearUserData();
}