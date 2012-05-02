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

  server.use(publicUri, express.static(__dirname + '/shared'));
  server.listen(port);

  return server;
};
