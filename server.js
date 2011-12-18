
if (!process.env.NODE_UID) {
  console.warn("The NODE_UID environment variable isn't set.");
}
if (!process.env.NODE_GID) {
  console.warn("The NODE_GID environment variable isn't set.");
}

process.setgid(process.env.NODE_GID || process.getgid());
process.setuid(process.env.NODE_UID || process.getuid());

// Initializes dependencies.
Object.extend(global, require('prototype'));

var util = require("util");
var http = require("http");
var Make = require("make");
var App = require("./src");

var WebSocketServer = require("websocket").server;
var server = new WebSocketServer({
  httpServer: http.createServer(function(request, response) {
    response.writeHead(404);
    response.end();
  }).listen(process.env.WEBSOCKET_PORT || 8080, function() {
    console.log((new Date()) + " Server is listening on port " +
      (process.env.WEBSOCKET_PORT || 8080));
  }),
  // You should not use autoAcceptConnections for production
  // applications, as it defeats all standard cross-origin protection
  // facilities built into the protocol and the browser.  You should
  // *always* verify the connection's origin and decide whether or not
  // to accept it.
  autoAcceptConnections: false
});

// Initializes the server.
server.on("request", function(request){
  var connection = request.accept(null, request.origin);

  connection.on("message", function(msg) {
    console.debug("Message received: ");
    console.debug(util.inspect(msg));

    var query = new Make.Query(JSON.parse(msg.utf8Data));
    var messageAdapter = Make.MessageAdapter.fromQuery(query);

    console.log("Resolved Query: ");
    console.debug(util.inspect(query));

    messageAdapter.process(query, function(query, error) {
      server.broadcast(JSON.stringify({ query : query, error : error }));
    });
  });
});

App.listen(8000);
