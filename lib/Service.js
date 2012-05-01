var util = require("util");
var http = require("http");
var WebSocketServer = require("websocket").server;

/** Initializes the service.
 */
var createServer = function (port) {
  var server = new WebSocketServer({
    httpServer: http.createServer(function (request, response) {
      response.writeHead(404);
      response.end();
    }).listen(port, function () {
      console.log((new Date()) + " Server is listening on port " + port);
    }),
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
  });

  // Initializes the server.
  server.on("request", function (request) {
    var connection = request.accept(null, request.origin);

    connection.on("message", function (msg) {
      console.debug("Message received: ");
      console.debug(util.inspect(msg));

      var message = JSON.parse(msg.utf8Data);
      var workspace = createWorkspaceFromMessage(message);

      workspace.build(function (result) {
        server.broadcast(JSON.stringify({
          workspace: workspace,
          errors: result.errors
        }));
      });
    });
  });
};

/** Factory method to create a workspace for the specified websocket message.
 *
 * The workspace is resolved from the programming language specified in the
 * message. It relies in the following convention to instantiate
 * the concrete workspace:
 * <ul>
 *   <li>Capitalizes the first letter of the message programming
 *    language.</li>
 *   <li>Appends the suffix <strong>Workspace</strong> to the
 *    capitalized name.</li>
 *   <li>Search for the class in the VM namespace.</li>
 * </ul>
 * <p>
 * For example, for the Java programming language it will try to instantiate
 * a VM.JavaWorkspace class.
 * </p>
 *
 * @param  {Object} msg WebSocket message object. Cannot be null.
 * @return {VM.Workspace} Returns a new workspace object.
 */
var createWorkspaceFromMessage = function (msg) {
  var lang = msg.lang;
  var workspaceType = lang.subtr(0, 1).toUpperCase() +
    lang.substr(1) + "Workspace";

  if (!VM.hasOwnProperty(workspaceType)) {
    throw new Error("Language " + lang + " not supported yet.");
  }

  return new VM[workspaceType](msg);
};

// Adds the main lib dependency.
require("./index");

/** Causes this service to listen for connections in the specified port.
 *
 * @param {Number} port Port number to listen on. Cannot be null.
 */
exports.listen = function (port) {
  createServer(port);
};
