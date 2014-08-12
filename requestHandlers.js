var DBHOSTNAME = 'localhost'
var PORT = 5432;
var DBNAME = 'mytest'
var DBUSER = 'yagitatsuya'
var DBPASSWORD = null;

var pg = require('pg'),
    ejs = require('ejs'),
    fs = require('fs'),
    path = require('path'),
    qs = require('querystring')
    ;

function start(response) {
    var index_view = fs.readFileSync('./views/index.ejs','utf8');
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(ejs.render(index_view));
    response.end();
}

function upload(response, request) {
    if (request.method == 'POST') {
        var body = '';
        request.on('data', function(data) {
                body += data;
        });
        request.on('end', function() {
                var POST = qs.parse(body);
                console.log(POST);
        });
    } else if (req.method == 'GET') {
        console.log('get is not');
    }
    return;
}

function publicDir(response, request) {
    var contentType = undefined
      , filePath = __dirname + request.url;
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
            console.log(exists);
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
