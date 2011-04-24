/*
*
* Copyright (C) 2011, The Locker Project
* All rights reserved.
*
* Please see the LICENSE file for more information.
*
*/

/**
 * web server/service to wrap auth interactions w/ FB
 */

var express = require('express'),
    connect = require('connect'),
    sys = require('sys'),
    app = express.createServer(
                    connect.bodyParser(),
                    connect.cookieParser(),
                    connect.session({secret : "locker"})),
    lconfig = require('./Common/node/lconfig.js');

var auth = {};
var facebookClient = require('facebook-js')();

app.get('/',
function(req, res) {
    res.redirect(facebookClient.getAuthorizeUrl({
        client_id: auth.appID,
        redirect_uri: lconfig.lockerBase + '/auth/facebook/auth',
        scope: 'email,offline_access,read_stream,user_photos,friends_photos,publish_stream'
    }));
    res.end();
});

app.get('/auth',
function(req, res) {
    var OAuth = require("oauth").OAuth2;
    var oa = new OAuth(auth.appID, auth.appSecret, 'https://graph.facebook.com');

    oa.getOAuthAccessToken(req.param('code'), {redirect_uri: me.uri+"auth"},
        function(error, access_token, refresh_token) {
            if (error) {
                sys.debug(error);
                res.writeHead(401);
                res.end(error);
            } else {
                res.writeHead(200);
                auth.token = access_token;
    //            lfs.writeObjectToFile('auth.json', auth);
                res.end();
            }
        });
});


var stdin = process.openStdin();
stdin.setEncoding('utf8');
stdin.on('data', function (chunk) {
    var processInfo = JSON.parse(chunk);
    app.listen(processInfo.port);
    auth.apiKey = processInfo.apiKey;
    auth.apiSecret = processInfo.apiSecret;
    var returnedInfo = {port: processInfo.port};
    console.log(JSON.stringify(returnedInfo));
});
