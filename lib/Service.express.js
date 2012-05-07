var express = require('express');

/** Causes this service to listen for connections in the specified port.
 *
 * @param {Number} port Port number to listen on. Cannot be null.
 * @param {String} publicUri URI where public static resources will be mapped.
 *   cannot be null or empty.
 * @return {Object} Returns the ExpressJS server. Never returns null.
 */
exports.create = function (port, publicUri) {
  var server = express.createServer();
  var path = publicUri;

  if (path.substr(-1) !== "/") {
    path += "/";
  }

  server.listen(port);
  server.get(path + "VM.js", function (req, res) {
    VM.getJsBundle(function (data) {
      res.contentType("text/javascript");
      res.send(data);
    });
  });

  return server;
};
