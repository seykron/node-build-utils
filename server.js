
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
    console.log("Message received: ");
    console.log(msg);
    var incomingWorkspace = JSON.parse(msg.utf8Data);
    console.log("Message parsed: ");
    console.log(incomingWorkspace);

    var workspace = new Make.Workspace(incomingWorkspace);
    var compiler = Make.Compiler.newInstance(workspace);

    console.log("Resolved workspace: ");
    console.log(workspace);

    compiler.build(workspace, function(workspace, errors) {
      server.broadcast(JSON.stringify({
        workspace : workspace,
        errors : errors
      }));
    });
  });
});

App.listen(8000);
