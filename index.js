/*jslint node: true */
"use strict";

var server = require("./server");
var router = require("./route");
var requestHandlers = require("./requestHandlers");

var handle = {};
handle["/"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload;
handle["/select_sound"] = requestHandlers.selectSound;
handle["/send_mail"] = requestHandlers.sendMailAndSave;
handle["/load"] = requestHandlers.start;


handle["/_sp"] = requestHandlers.startSP;
handle["/load_sp"] = requestHandlers.loadSP;
handle["/send_mail_sp"] = requestHandlers.sendMailAndSaveSP;


handle["/public"] = requestHandlers.publicDir;


server.start(router.route, handle);

