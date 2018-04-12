var app = require('express')()
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;

//var api_url = 'http://damp-fjord-22544.herokuapp.com/api/'

io.on('connection', socket => {
    socket.on('set-nickname', function(data) {
        if (data.username) {
            socket.nickname = data.username;
            console.log(`${ socket.nickname } joined`);
        }
    });

    socket.on('add-message', function(data) {


        var sendNotification = function(data) {
            var headers = {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": "Basic MGVlYzUzMWItZWYzZS00NjUwLTgwNDgtYjdiNjNlOTMwMDlh"
            };

            var options = {
                host: "onesignal.com",
                port: 443,
                path: "/api/v1/notifications",
                method: "POST",
                headers: headers
            };

            var https = require('https');
            var req = https.request(options, function(res) {
                res.on('data', function(data) {
                    console.log("Response:");
                    console.log(JSON.parse(data));
                });
            });

            req.on('error', function(e) {
                console.log("ERROR:");
                console.log(e);
            });

            req.write(JSON.stringify(data));
            req.end();
        };

        var message = {
            app_id: "41cb1d6c-4d5a-4074-804e-11c1c3a42a36",
            headings: {
                "en": "Message from " + data.name,
            },
            contents: {
                "en": data.text,
                "data": data.text,
            },
            include_player_ids: [data.oneSignal],
            android_accent_color: "FF0000FF",
            android_visibility: 0
        };

        console.log(message)

        sendNotification(message);

        console.log(`${ socket.nickname } sent: ${ data.text }`);
        console.log(data.socketid)
        socket.id = data.socketid
        socket.broadcast.emit('message', { text: data.text, from: socket.nickname, created: new Date(), chatid: socket.id });
        console.log({ text: data.text, from: socket.nickname, created: new Date(), chatid: data.socketid })
    });

    socket.on('disconnect', function() {
        if (socket.nickname) {
            console.log(`${ socket.nickname } left`);
        }
    });
});

http.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});
