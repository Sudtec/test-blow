// Helper Util for making authenticated XHRs
function xhrWithAuth(method, url, interactive, callback) {
    var retry = true;
    var access_token;
    getToken();

    function getToken() {
        chrome.identity.getAuthToken({
            interactive: interactive
        }, function (token) {
            if (chrome.runtime.lastError) {
                callback(chrome.runtime.lastError);
                return;
            }
            access_token = token;
            requestStart();
        });
    }

    function requestStart() {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
        xhr.onreadystatechange = function (oEvent) {
            if (xhr.readyState === 4) {
                if (xhr.status === 401 && retry) {
                    retry = false;
                    chrome.identity.removeCachedAuthToken({
                        'token': access_token
                    },
                        getToken);
                } else if (xhr.status === 200) {
                    callback(null, xhr.status, xhr.response);
                }
            } else {
                ////////console.log("Error - " + xhr.statusText);
            }
        }
        try {
            xhr.send();
        } catch (e) {
            ////////console.log("Error in xhr - " + e);
        }
    }
}