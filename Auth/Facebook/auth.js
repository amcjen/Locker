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
    url = require('url'),
    querystring = require("querystring"),
    app = express.createServer(
                    connect.bodyParser(),
                    connect.cookieParser(),
                    connect.session({secret : "locker"})),
    locker = require('../../Common/node/locker.js'),
    lfs = require('../../Common/node/lfs.js');

var me, auth = {};
var facebookClient = require('facebook-js')();
var lockerUrl;
var permServiceID;

app.get('/', function(req, res) {
    if(!req.param('permServiceID')) {
        res.writeHead(500);
        res.end();
        return;
    }
    res.writeHead(200, {'Content-Type': "text/html"});
    res.end("<html>Enter your personal FaceBook app info that will be used to sync your data" + 
            " (create a new one at <a href='http://www.facebook.com/developers/createapp.php'>" + 
            "http://www.facebook.com/developers/createapp.php</a> using the callback url of " +
            "http://" + url.parse(me.uri).host + "/) " +
            "<form method='post' action='init'>" +
                "App ID: <input name='appID'><br>" +
                "App Secret: <input name='appSecret'><br>" +
                "<input type='hidden' name='permServiceID' value='" + req.param('permServiceID') + "'><br>" +
                "<input type='submit' value='Start'>" +
            "</form></html>");
});

app.post('/init',
function(req, res) {
    auth.appID = req.param('appID');
    auth.appSecret = req.param('appSecret');
    permServiceID = req.param('permServiceID');
    sys.debug('permServiceID = ' + permServiceID);
    res.redirect(facebookClient.getAuthorizeUrl({
        client_id: auth.appID,
        redirect_uri: me.uri + 'auth',
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
//                res.writeHead(200);
                auth.token = access_token;
                var redURL = lockerUrl + '/auth/save?' + querystring.stringify({'permServiceID': permServiceID, 'authServiceID':me.id, 'creds':JSON.stringify(auth), 'meta':null});
                sys.debug('FB auth done, redirecting to: ' + redURL);
                res.redirect(redURL);
                res.end();
            }
        });
});


var stdin = process.openStdin();
stdin.setEncoding('utf8');
stdin.on('data', function (chunk) {
    var processInfo = JSON.parse(chunk);
    locker.initClient(processInfo);
    process.chdir(processInfo.workingDirectory);
    app.listen(processInfo.port);
    lockerUrl = processInfo.lockerUrl;
    me = lfs.loadMeData();
//    auth.apiKey = processInfo.apiKey;
//    auth.apiSecret = processInfo.apiSecret;
    var returnedInfo = {port: processInfo.port};
    console.log(JSON.stringify(returnedInfo));
});
