var cntXmlRequests = 0;

var qtBridge = {
    "ping": function () { return (false); },
    "start": null,
    "finish": function () { console.log ("Invoked 'qtBridge.finish()' method."); }
};

qtBridge.ping ();

//////////////////////////////////////

function startXMLHttpRequest (name, URL, returnValue) {
    console.log ("Starting XMLHttpRequest '" + name + "'...");
    var xhr = new XMLHttpRequest ();
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                var jsonResponse = JSON.stringify (JSON.parse(xhr.responseText));
                console.log ("XMLHttpRequest '" + name + "' returned a JSON data: '" + jsonResponse + "'");
                returnValue (jsonResponse);
            } catch (e) {
                console.warn ("An exception was thrown while handling JSON response from XMLHttpRequest '" + name + "': " + e.message);
                returnValue ('');
            }
        } else {
            console.warn ("XMLHttpRequest '" + name + "' returned HTTP status code " + xhr.status + ": '" + xhr.statusText + "'!");
            returnValue ('');
        }
    };
    xhr.timeout = 30000;
    xhr.ontimeout = function () {
        console.warn ("XMLHttpRequest '" + name + "' timed out!");
        returnValue ('');
    }
    xhr.onerror = function () {
        console.warn ("XMLHttpRequest '" + name + "' failed!");
        returnValue ('');
    };
    xhr.onabort = function () {
        console.warn ("XMLHttpRequest '" + name + "' was aborted!");
        returnValue ('');
    };
    xhr.onreadystatechange = function () {
        console.log ("XMLHttpRequest '" + name + "': readyState is now #" + xhr.readyState + "...");
    }
    xhr.open ("GET", URL, true);
    xhr.send ();
    console.log ("XMLHttpRequest '" + name + "' started.");
    cntXmlRequests++;
}

function finishXMLHttpRequest (valueReturned) {
    console.log ("A value was returned from a XMLHttpRequest object: '" + valueReturned + "'");
    if (! --cntXmlRequests) {
        qtBridge.finish ();
    }
}

function startAllRequests () {
    console.log ("Starting XMLHttpRequests...");
    startXMLHttpRequest ("YouTubeV3API", "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=eij0rOmSf5E&key=an%20invalid%20API%20key", finishXMLHttpRequest);
    startXMLHttpRequest ("JSONplaceholder", "https://jsonplaceholder.typicode.com/posts/1", finishXMLHttpRequest);
    startXMLHttpRequest ("localhost", "http://localhost:54321/", finishXMLHttpRequest);
};

//////////////////////////////////////

// If this script is running under Qt environmnent, forward events to the qtBridge object
// If this script is running under Chrome Developer Tools, fake a qtBridge object

qtBridge.start = startAllRequests;
try {
    if (qtRealBridge.ping ()) {
        qtBridge = qtRealBridge;
    }
} catch (e) {
    console.warn ("An exception was thrown during startup: " + e.message);
}
qtBridge.start ();
