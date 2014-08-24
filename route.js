/*jslint node: true */
"use strict";

function route(handle, pathname, response, request) {

    console.log(pathname);
    console.log(handle[pathname]);

    if (typeof handle[pathname] === 'function') {
        handle[pathname](response, request);
    } else {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("not found");
        response.end();
    }
}

exports.route = route;
