var express = require('express');
var socketIO = require('socket.io');

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
  var workspaceType = lang.substr(0, 1).toUpperCase() +
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
 * @param {String} publicUri URI where public static resources will be mapped.
 *   cannot be null or empty.
 * @return {Object} Returns the ExpressJS server. Never returns null.
 */
exports.listen = function (port, publicUri) {
  var server = express.createServer();
  var io = socketIO.listen(server);

  server.use(publicUri, express.static(__dirname + '/shared'));
  server.listen(port);

  io.sockets.on('connection', function (socket) {
    socket.on('message', function (data) {
      var message = JSON.parse(data);
      var workspace = createWorkspaceFromMessage(message);

      workspace.build(function (result) {
        socket.send(JSON.stringify({
          workspace: message,
          errors: result.errors
        }));
      });
    });
  });

  return server;
};
