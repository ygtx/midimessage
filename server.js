/*jslint node: true */
"use strict";

var http = require("http");
var url = require("url");



function start(route, handle) {
    function onRequest(request, response) {

        // PC and SP common

        var pathname = url.parse(request.url).pathname;
        if (pathname.lastIndexOf('/public',0) === 0) {
            pathname = '/public';
        } 


        route(handle, pathname, response, request);
    }
    var port = process.env.PORT || 1337;
    http.createServer(onRequest).listen(port);
    console.log("Server has started.");
}

exports.start = start;

