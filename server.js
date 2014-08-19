var http = require("http");
var url = require("url");

function start(route, handle) {
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
//        console.log("Request for " + pathname + " received");
        var pathArray = pathname.split("/");
        pathname = (pathArray[1] == null) ? pathname : '/' + pathArray[1];

        route(handle, pathname, response, request);
    }
    http.createServer(onRequest).listen(8888);
    console.log("Server has started.");
}

exports.start = start;

