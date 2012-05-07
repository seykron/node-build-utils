var http = require('http');

/** Causes this service to listen for connections in the specified port.
 *
 * @param {Number} port Port number to listen on. Cannot be null.
 * @param {String} publicUri URI where public static resources will be mapped.
 *   cannot be null or empty.
 * @return {Object} Returns the ExpressJS server. Never returns null.
 */
exports.create = function (port, publicUri) {
  var server = http.createServer(function (req, res) {

    if (req.method === "GET" &&
        req.url.indexOf(publicUri) === 0) {

      if (req.url.substr(-5) === "VM.js") {
        VM.getJsBundle(function (data) {
          res.setHeader("Content-Type", "text/javascript");
          res.writeHead(200);
          res.end(data);
        });
      } else {
        res.writeHead(400);
        res.end("NOT_FOUND: " + req.url);
      }
    }
  });

  server.listen(port);

  return server;
};
