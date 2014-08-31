/*jslint node: true */
"use strict";

var CNST = require("./constants");
var AUTH_CNST = require("./authConstants");
var mailSender = require("./mailSender");

var mysql = require('mysql');
var ejs = require('ejs'),
    fs = require('fs'),
    path = require('path'),
    qs = require('querystring'),
    url = require('url')
    ;

var system_error_view = fs.readFileSync('./views/system_error.ejs','utf8'); 
var score_li = fs.readFileSync('./views/score_li.ejs','utf8'); 
var score_ul = fs.readFileSync('./views/score_ul.ejs','utf8'); 

var index_view = fs.readFileSync('./views/index.ejs','utf8'); 

var spViews = {
    'start' : fs.readFileSync('./views/sp_index.ejs','utf8')
};

var dcArray = {
    0 : fs.readFileSync('./public/data/patatap/dc-patatap.html', 'utf8'),
    1 : fs.readFileSync('./public/data/jemapur01/dc-jemapur01.html', 'utf8'),
    2 : fs.readFileSync('./public/data/jemapur02/dc-jemapur02.html', 'utf8'),
    3 : fs.readFileSync('./public/data/jemapur03/dc-jemapur03.html', 'utf8')
};

var dcNameArray = {
    0 : 'patatap', 
    1 : 'jemapur01', 
    2 : 'jemapur02', 
    3 : 'jemapur03' 
};

var uaTypes = [
    'iPhone',
    'iPad',
    'Android',
    'Windows Phone'
];



function isSP(request) {

    var ua = JSON.stringify(request.headers['user-agent']);
    console.log("-------------------- HEADER INFO START");
    //ソースIPの取得
    console.log("[address]"+request.connection.remoteAddress);
    //User-Agentの取得
    console.log("[ua]"+JSON.stringify(request.headers['user-agent']));
    //他ヘッダー
    console.log("[headers]"+JSON.stringify(request.headers));
    console.log("-------------------- HEADER INFO END");
    for (var i = 0; i < uaTypes.length; i++) {
        if (ua.indexOf(uaTypes[i]) === -1) {
            return false;
        } else {
            return true;
        }
    }   
}

function connectToDB(callback) {
    // var conString = AUTH_CNST.DBDATASOURCE + 
    //                 AUTH_CNST.DBUSER  + 
    //                 "@" + AUTH_CNST.DBHOSTNAME + 
    //                 ":" + AUTH_CNST.DBPORT  + 
    //                 "/" + AUTH_CNST.DBNAME;
    // var client = new mysql.createConnection(conString);

    // client.connect(function(err) {
    //         if (err) {
    //             callback(err, null);
    //             console.log("db callback end as error");
    //         } else {
    //             callback(null, client);
    //             console.log("db callback end as success");
    //         }
    // });
    var client = mysql.createConnection({
        host: AUTH_CNST.DBHOSTNAME,
        database: AUTH_CNST.DBNAME,
        user: AUTH_CNST.DBUSER,
        password: AUTH_CNST.DBPASSWORD
    });

    callback(null, client);
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
                if(result[0].count > CNST.RECORD_CAP) {
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
            console.log(err);
            callback(err, null);
        } 
        client.query(
            CNST.SQL_1, 
            function(err, result) {
                if (err) {
                    console.log(err);
                    return callback(err, null);
                } else {
                    console.log(result);

                    for (var i = 0; i < result.length; i++) {
                        scoreList += ejs.render(score_li, {
                            id : result[i].id,
                            sound_id : result[i].sound_id,
                            display_score : result[i].display_score_string,
                            name : result[i].name,
                            sound_name : dcNameArray[result[i].sound_id],
                            score_string : result[i].display_score_string
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

function getSingleScore(scoreId, callback) {
    connectToDB(function(err, client) {
        if (err) {
            callback(err, null);
        }
        client.query(
            CNST.SQL_4,
            [scoreId],
            function(err, result) {
                if (err) {
                    return callback(err, null);
                } else {
                    if (result.length === 0) {
                        client.query(
                            CNST.SQL_4,
                            1,
                            function(err, result) {
                                if(err) {
                                    return callback(err, null);
                                } else {
                                    callback(null, result);
                                }
                            });
                        
                    }
                    callback(null, result);
                }
         });

     });
 }


function start(response, request) {


    if (isSP(request)) {

        var url_parts = url.parse(request.url, true);
        var getParameters = url_parts.query;

        var scoreId = getParameters.score;

        if (isNaN(scoreId)) {
           scoreId = 1;
        }



        getSingleScore(scoreId, function(err, result) {


            if (err) {
                return responseSystemError(response);
            }


            response.writeHead(200, CNST.CONTENT_TYPE_HTML);
            response.write(ejs.render(spViews.start, {

                "id" : result[0].id,
                "sound_id" : result[0].sound_id,
                "sound_name" : result[0].display_score_string,
                "display_score" : result[0].name,
                "nick_name" : dcNameArray[result[0].sound_id],
                "actual_score" : result[0].display_score_string,
                "this_url" : 'http://' + request.headers.host + '/load?score=' + result[0].id

            }));
            response.end();
        });
    } else {

        buildScoreList(function(err, scoreUL) {
            if (err) {
                return responseSystemError(response);
            }
            response.writeHead(200, CNST.CONTENT_TYPE_HTML);
            response.write(ejs.render(index_view, {
                score_list : scoreUL
            }));
            response.end();
        });
    }
}

function selectSound(response, request) {
    if (request.method === 'POST') {
        var body = '';
        request.on('data', function(data) {
                body += data;
        });
        request.on('end', function() {
            var POST = qs.parse(body);
            if (dcArray[POST.sound_id]) {
                response.writeHead(200, CNST.CONTENT_TYPE_JSON);
                var json = JSON.stringify({
                    "dc" : dcArray[POST.sound_id]
                });
                response.end(json);
            } else {
                return responseSystemError();
            }
        });

    } else {
        console.log("what?");
    }
    return;

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
            var inputSoundID = POST.input_sound_id;
            var displayScore = POST.display_score_string;
            var scoreString = score.toString(); 


            connectToDB(function(err, client) {

                if (err) {
                    return responseSystemError(response);
                }
                checkSomething(client, function(err, data) {
                    if(err) {
                        return responseSystemError(response);
                    } else {
                        if (data === CNST.APP_ERR_1) {
                            return responseApplicationError(response, CNST.APP_ERR_1);
                        }
                    }
                    client.query(
                        CNST.SQL_2, 
                        [inputName, inputBpm, inputSoundID, displayScore, scoreString],
                        function(err, result) {
                            if (err) {
                                console.log(err.message);
                                return;
                            }
                            buildScoreList(function(err, scoreUL) {
                                if (err) {
                                    return responseSystemError(response);
                                }
                                response.writeHead(200, CNST.CONTENT_TYPE_JSON);
                                var json = JSON.stringify({
                                    scoreList : scoreUL,
                                    uploadedId : result.insertId
                                    // uploadedId : result.id
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

function sendMail(mail_to, html, text, response, callback) {

    mailSender.sendMail(mail_to, html, text, function(err, result) {
        if (err) {
            return responseApplicationError(response, CNST.APP_ERR_4);
        }
        var json = JSON.stringify({
            result : result
        });

        if (callback) {
            callback(json);
        } else {
            response.writeHead(200, CNST.CONTENT_TYPE_JSON);
            response.end(json);
        }

        return;

    }); 
}

function buildLink(request, uploadedId, callback) {
    callback('http://' + request.headers.host + '/load?score=' + uploadedId);
}

function sendMailAndSave(response, request) {
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

            var inputName = POST.input_name;
            var inputBpm = POST.input_bpm;
            var inputSoundID = POST.input_sound_id;
            var displayScore = POST.display_score_string;
            var scoreString = score.toString(); 
            var emailAddress = POST.email_address; 
            var uploadedId = POST.uploaded_id; 


            if (!POST.input_name) {
                return responseApplicationError(response, CNST.APP_ERR_2);
            }

            if (uploadedId) {
                buildLink(request, uploadedId, function(scoreLink) {
                    return sendMail(emailAddress, scoreLink, scoreLink, response, null);
                });
            }

            connectToDB(function(err, client) {

                if (err) {
                    return responseSystemError(response);
                }
                checkSomething(client, function(err, data) {
                    if(err) {
                        return responseSystemError(response);
                    } else {
                        if (data === CNST.APP_ERR_1) {
                            return responseApplicationError(response, CNST.APP_ERR_1);
                        }
                    }
                    client.query(
                        CNST.SQL_2, 
                        [inputName, inputBpm, inputSoundID, displayScore, scoreString],
                        function(err, result) {
                            if (err) {
                                console.log(err.message);
                                return;
                            }
                            uploadedId = result.insertId;

                            buildScoreList(function(err, scoreUL) {
                                if (err) {
                                    return responseSystemError(response);
                                }
                                buildLink(request, uploadedId, function(scoreLink) {
                                    sendMail(emailAddress , 
                                        scoreLink , 
                                        scoreLink , 
                                        response , 
                                        function(mailResult) {
                                            response.writeHead(200, CNST.CONTENT_TYPE_JSON);
                                            var json = JSON.stringify({
                                                scoreList : scoreUL,
                                                uploadedId : uploadedId,
                                                mailResult : mailResult
                                            });
                                            return response.end(json);
                                        });
                                });
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
exports.selectSound = selectSound;
exports.sendMailAndSave = sendMailAndSave;
