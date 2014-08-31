/*jslint node: true */

exports.UNDEFINED = 'undefined';

exports.CONTENT_TYPE_HTML={'Content-Type': "text/html"};
exports.CONTENT_TYPE_JSON={'Content-Type': "text/json"};
exports.CONTENT_TYPE_CSS={'Content-Type': "text/css"};
exports.CONTENT_TYPE_JS={'Content-Type': "text/javascript"};

exports.RECORD_CAP = 13;

exports.APP_ERR_1 = 'capped. in checkSomething';
exports.APP_ERR_2 = 'Please input your name.';
exports.APP_ERR_3 = 'Please type something';
exports.APP_ERR_4 = 'Couldnt send email';

exports.SQL_1 = 'SELECT * FROM score order by created_at desc limit 50;';
exports.SQL_2 = 'INSERT INTO score (name, bpm, sound_id, display_score_string, score_string, created_at) VALUES ($1, $2, $3, $4, $5, now()) RETURNING id';
exports.SQL_3 = 'SELECT count(*) FROM score';
exports.SQL_4 = 'SELECT * FROM score WHERE id = $1';

