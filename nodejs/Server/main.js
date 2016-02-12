/** 
* @author Naveen Kumar <imnaveenyadav@gmail.com> 
* version: 1.0.0 
* https://github.com/NaveenKY/Messages/
*/ 

var webSocketsServerPort = 7000;

var webSocketServer = require('websocket').server;
var http = require('http');

var clients = {};

var server = http.createServer(function (request, response) {
    // Any processing related to request can be done here
});
server.listen(webSocketsServerPort, function (req) {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

var wsServer = new webSocketServer({
    httpServer: server
});

wsServer.on('request', function (request) {
    if (request.resourceURL.pathname === "/message") {
        console.log((new Date()) + ' Connection from origin ' + request.resourceURL.query.user + '.');
        var userName = request.resourceURL.query.user;
        var connection = request.accept(null, request.origin);
        if (clients[userName]) {
            clients[userName].push(connection);
        } else {
            clients[userName] = [connection];
        }
        console.log((new Date()) + ' Connection accepted.');
        var userList = {'type': 'USER_LIST', 'users': Object.keys(clients)};
        Object.keys(clients).forEach(function (user) {
            clients[user].forEach(function (conn) {
                conn.sendUTF(JSON.stringify(userList));
            });
        });

        // user sent some message
        connection.on('message', function (message) {
            if (message.type === 'utf8') {
                console.log((new Date()) + ' Received Message from '
                        + userName + ': ' + message.utf8Data);
                var obj = JSON.parse(message.utf8Data);

                var json = JSON.stringify({type: 'NEW_MESSAGE', message: obj.message, from:userName});
                if (clients[obj.to]) {
                    for (var i = 0; i < clients[obj.to].length; i++) {
                        clients[obj.to][i].sendUTF(json);
                    }
                }
            }
        });

        connection.on('close', function (conn) {
            console.log((new Date()) + " Peer "
                    + connection.remoteAddress + " disconnected.");
            clients[userName].splice(clients[userName].indexOf(connection));
            if (clients[userName].length === 0) {
                delete clients[userName];
            }
            var userList = {'type': 'USER_LIST', 'users': Object.keys(clients)};
            Object.keys(clients).forEach(function (user) {
                clients[user].forEach(function (conn) {
                    conn.sendUTF(JSON.stringify(userList));
                });
            });
        });

    }
});