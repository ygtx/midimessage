/*jslint node: true */
"use strict";

var http = require("http");
var url = require("url");

// var server = require("./server");
var router = require("./route");
var requestHandlers = require("./requestHandlers");

var handle = {};
handle["/"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload;
handle["/select_sound"] = requestHandlers.selectSound;
handle["/send_mail"] = requestHandlers.sendMailAndSave;
handle["/load"] = requestHandlers.start;

handle["/public"] = requestHandlers.publicDir;

// function start(route, handle) {
function onRequest(request, response) {

    // PC and SP common

    var pathname = url.parse(request.url).pathname;
    if (pathname.lastIndexOf('/public',0) === 0) {
        pathname = '/public';
    } 


    router.route(handle, pathname, response, request);
}
var port = process.env.PORT || 1337;
http.createServer(onRequest).listen(port);
console.log("Server has started.");
//}

// exports.start = start;

