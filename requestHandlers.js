var CNST = require("./constants");

var pg = require('pg'),
    ejs = require('ejs'),
    fs = require('fs'),
    path = require('path'),
    qs = require('querystring')
    ;
var index_view = fs.readFileSync('./views/index.ejs','utf8'); 
var score_li = fs.readFileSync('./views/score_li.ejs','utf8'); 
var score_ul = fs.readFileSync('./views/score_ul.ejs','utf8'); 

function connectToDB(callback) {
    "use strict";
    var conString = CNST.DBDATASOURCE + 
                    CNST.DBUSER  + 
                    "@" + CNST.DBHOSTNAME + 
                    ":" + CNST.DBPORT  + 
                    "/" + CNST.DBNAME;
    var client = new pg.Client(conString);
    client.connect(function(err) {
            if (err) {
                throw err;
            }
            callback(client);
            console.log("db callback end");
    });
}

function buildScoreList(callback) {
    "use strict";
    var scoreList = '';
    var scoreUL = '';
    connectToDB(function(client) {
            client.query(
                CNST.SQL_1, 
                function(err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        for (var i = 0; i < result.rows.length; i++) {
                            scoreList += ejs.render(score_li, {
                               id : result.rows[i].id,
                               display_score : result.rows[i].display_score_string,
                               name : result.rows[i].name,
                               sound_name : result.rows[i].sound_name,
                               score_string : result.rows[i].score_string
                            });
                        }
                        scoreUL = ejs.render(score_ul, {
                            score_li : scoreList
                        });
                        callback(scoreUL);
                    }
             });
    });
}

function start(response) {
    "use strict";
    buildScoreList(function(scoreUL) {
        console.log(scoreUL);
        response.writeHead(200, {'Content-Type': "text/html"});
        response.write(ejs.render(index_view, {
            score_list : scoreUL
        }));
        response.end();
    });
}

function upload(response, request) {
    "use strict";
    if (request.method === 'POST') {
        var body = '';
        request.on('data', function(data) {
                body += data;
        });
        request.on('end', function() {
            var POST = qs.parse(body);
            var score = POST['score[]'];

            var inputName = POST.input_name;
            var inputBpm = POST.input_bpm;
            var inputSoundName = POST.input_sound_name;
            var displayScore = POST.display_score_string;
            var scoreString = score.toString(); 

            var contentType = 'application/json';

            connectToDB(function(client) {
                    client.query(
                        CNST.SQL_2, 
                        [inputName, inputBpm, inputSoundName, displayScore, scoreString],
                        function(err, result) {
                            if (err) {
                                console.log(err.message);
                                return;
                            }
                            console.log(result);
                            buildScoreList(function(scoreUL) {
                                response.writeHead(200, {'Content-Type': contentType});
                                var json = JSON.stringify({
                                    scoreList : scoreUL 
                                });
                                response.end(json);
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
    "use strict";
    var contentType = '';
    var filePath = __dirname + request.url;
    switch(path.extname(request.url)) {
        case '.css' :
        contentType = 'text/css';
        break;
        case '.js':
        contentType = 'text/javascript';
        break;
        default:
        contentType = 'text/html';
    }

    path.exists(filePath, function(exists) {
            //console.log(exists);
            if (exists) {
                fs.readFile(filePath, function(error, content) {
                        if (error) {
                            response.writeHead(500);
                            response.end();
                        } else {
                            response.writeHead(200, {'Content-Type': contentType});
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
