/*
*
* Copyright (C) 2011, The Locker Project
* All rights reserved.
*
* Please see the LICENSE file for more information.
*
*/

var express = require('express'),
    connect = require('connect'),
    url = require('url'),
    sys = require('sys'),
    locker = require('../../Common/node/locker.js'),
    lfs = require('../../Common/node/lfs.js');


var twitterClient;

var app = express.createServer(
        connect.bodyParser(),
        connect.cookieParser(),
        connect.session({secret : "locker"})
    );
    

var auth;

app.get('/', function(req, res) {
    twitterClient.getAccessToken(req, res,
        function(error, newToken) {
            if (error)
                sys.debug(JSON.stringify(error));
            else if (newToken) {  
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                auth.token = newToken;
//                lfs.writeObjectToFile('auth.json', auth);
                res.end();
            }
        });    
    }
});

var stdin = process.openStdin();
stdin.setEncoding('utf8');
stdin.on('data', function (chunk) {
    var processInfo = JSON.parse(chunk);
    auth.consumerKey = processInfo.consumerKey;
    auth.consumerSecret = processInfo.consumerSecret;
    twitterClient = require('twitter-js')(auth.consumerKey, auth.consumerSecret, me.uri);
    app.listen(processInfo.port);
    var returnedInfo = {port: processInfo.port};
    console.log(JSON.stringify(returnedInfo));
});
