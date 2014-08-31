/*jslint node: true */
"use strict";

var AUTH_CNST = require("./authConstants");
var mailer = require('nodemailer');

//SMTPの設定
var setting = {
    service: AUTH_CNST.MAIL_SERVICE, //'Gmail'、'Hotmail'、'Yahoo Mail'など
    auth: {
        user: AUTH_CNST.MAIL_USER,
        pass: AUTH_CNST.MAIL_PASS
    }
};

var smtp = mailer.createTransport('SMTP', setting);

function sendMail(mail_to, html, text, callback) {
    var mailOptions = {
        from: 'miditap',
        to: mail_to,
        subject: 'email from your friend via miditap',
        html: html,
        text: text
    };
    smtp.sendMail(mailOptions, function(err, res){
        //送信に失敗したとき
        if(err){
            callback(err, null);
            console.log(err);
        }else{
            callback(null, res.message);
        }
        //SMTPの切断
        smtp.close();
    });
}



exports.sendMail = sendMail;
