/*jslint node: true */
"use strict";

var http = require("http");
var url = require("url");

var uaTypes = [
    'iPhone',
    'iPad',
    'Android',
    'Windows Phone'
];

function isSP(ua) {

    for (var i = 0; i < uaTypes.length; i++) {
        if (ua.indexOf(uaTypes[i]) === -1) {
            return false;
        } else {
            return true;
        }
    }   

}

function start(route, handle) {
    function onRequest(request, response) {

        // PC and SP common

        var pathname = url.parse(request.url).pathname;
        if (pathname.lastIndexOf('/public',0) === 0) {
            pathname = '/public';
        } 

        // for SP 
        if (isSP(JSON.stringify(request.headers['user-agent']))) {
            pathname = pathname + '_sp';
        }
        console.log("-------------------- HEADER INFO START");
        //ソースIPの取得
        console.log("[address]"+request.connection.remoteAddress);
        //User-Agentの取得
        console.log("[ua]"+JSON.stringify(request.headers['user-agent']));
        //他ヘッダー
        console.log("[headers]"+JSON.stringify(request.headers));
        console.log("-------------------- HEADER INFO END");


        route(handle, pathname, response, request);
    }
    http.createServer(onRequest).listen(8888);
    console.log("Server has started.");
}

exports.start = start;

