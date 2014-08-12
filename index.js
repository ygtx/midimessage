var server = require("./server");
var router = require("./route");
var requestHandlers = require("./requestHandlers");

var handle = {};
handle["/"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload;

handle["/public"] = requestHandlers.publicDir;


server.start(router.route, handle);

