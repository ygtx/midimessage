/*jslint node: true */
"use strict";

var CNST = require("./constants");

var pg = require('pg'),
    ejs = require('ejs'),
    fs = require('fs'),
    path = require('path'),
    qs = require('querystring')
    ;
var index_view = fs.readFileSync('./views/index.ejs','utf8'); 
var system_error_view = fs.readFileSync('./views/system_error.ejs','utf8'); 
var score_li = fs.readFileSync('./views/score_li.ejs','utf8'); 
var score_ul = fs.readFileSync('./views/score_ul.ejs','utf8'); 

function connectToDB(callback) {
    var conString = CNST.DBDATASOURCE + 
                    CNST.DBUSER  + 
                    "@" + CNST.DBHOSTNAME + 
                    ":" + CNST.DBPORT  + 
                    "/" + CNST.DBNAME;
    var client = new pg.Client(conString);
    client.connect(function(err) {
            if (err) {
                callback(err, null);
                console.log("db callback end as error");
            } else {
                callback(null, client);
                console.log("db callback end as success");
            }
    });
}

function responseSystemError(response) {
        response.writeHead(200, {'Content-Type': "text/html"});
        response.write(ejs.render(system_error_view));
        response.end();
}

function responseApplicationError(response, msg) {
        response.writeHead(200, CNST.CONTENT_TYPE_JSON); 
        var json = JSON.stringify({
            APP_ERR : msg
        });
        response.end(json);
}

function checkSomething(client, callback) {
    client.query(
        CNST.SQL_3, 
        function(err, result) {
            if (err) {
                callback(err, null); 
            } else {
                if(result.rows[0].count > CNST.RECORD_CAP) {
                    callback(null, CNST.APP_ERR_1);
                }
            } 
            callback(null, null);
        }
    );
}

function buildScoreList(callback) {
    var scoreList = '';
    var scoreUL = '';
    connectToDB(function(err, client) {
        if (err) {
            callback(err, null);
        } 
        client.query(
            CNST.SQL_1, 
            function(err, result) {
                if (err) {
                    return callback(err, null);
                } else {
                    for (var i = 0; i < result.rows.length; i++) {
                        scoreList += ejs.render(score_li, {
                           id : result.rows[i].id,
                           display_score : result.rows[i].display_score_string,
                           name : result.rows[i].name,
                           sound_name : result.rows[i].sound_name,
                           score_string : result.rows[i].display_score_string
                        });
                    }
                    scoreUL = ejs.render(score_ul, {
                        score_li : scoreList
                    });
                    callback(null, scoreUL);
                }
         });
    });
}

function start(response) {
    buildScoreList(function(err, scoreUL) {
        if (err) {
            return responseSystemError(response);
        }
        console.log(scoreUL);
        response.writeHead(200, CNST.CONTENT_TYPE_HTML);
        response.write(ejs.render(index_view, {
            score_list : scoreUL
        }));
        response.end();
    });
}

function upload(response, request) {
    if (request.method === 'POST') {
        var body = '';
        request.on('data', function(data) {
                body += data;
        });
        request.on('end', function() {
            var POST = qs.parse(body);
            var score = POST['score[]'];


            if (!score) {
                return responseApplicationError(response, CNST.APP_ERR_3);
            }
            if (!POST.input_name) {
                return responseApplicationError(response, CNST.APP_ERR_2);
            }

            var inputName = POST.input_name;
            var inputBpm = POST.input_bpm;
            var inputSoundName = POST.input_sound_name;
            var displayScore = POST.display_score_string;
            var scoreString = score.toString(); 


            connectToDB(function(err, client) {

                if (err) {
                    return responseSystemError(response);
                }
                checkSomething(client, function(err, data) {
                    console.log("XXXXXXXXXXXXXXX 1");
                    console.log(err);
                    console.log(data);
                    if(err) {
                        return responseSystemError(response);
                    } else {
                        if (data === CNST.APP_ERR_1) {
                            return responseApplicationError(response, CNST.APP_ERR_1);
                        }
                    }
                    client.query(
                        CNST.SQL_2, 
                        [inputName, inputBpm, inputSoundName, displayScore, scoreString],
                        function(err, result) {
                            if (err) {
                                console.log(err.message);
                                return;
                            }
                            console.log(result);
                            buildScoreList(function(err, scoreUL) {
                                if (err) {
                                    return responseSystemError(response);
                                }
                                response.writeHead(200, CNST.CONTENT_TYPE_JSON);
                                var json = JSON.stringify({
                                    scoreList : scoreUL 
                                });
                                response.end(json);
                            });
                    });
                });
                    
            });
        });
    } else if (request.method === 'GET') {
        console.log('get is not');
    }
    return;
}

function publicDir(response, request) {
    var contentType = '';
    var filePath = __dirname + request.url;
    switch(path.extname(request.url)) {
        case '.css' :
        contentType = CNST.CONTENT_TYPE_CSS; 
        break;
        case '.js':
        contentType = CNST.CONTENT_TYPE_JS;
        break;
        default:
        contentType = CNST.CONTENT_TYPE_HTML;
    }

    path.exists(filePath, function(exists) {
            //console.log(exists);
            if (exists) {
                fs.readFile(filePath, function(error, content) {
                        if (error) {
                            response.writeHead(500);
                            response.end();
                        } else {
                            response.writeHead(200, contentType);
                            response.end(content, 'utf-8');
                        }
                });
            } else {
                response.writeHead(404);
                response.end();
            }
    });

}

exports.start = start;
exports.upload = upload;
exports.publicDir = publicDir;
