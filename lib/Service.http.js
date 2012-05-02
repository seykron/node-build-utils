var http = require('http');
var fs = require('fs');

/** Causes this service to listen for connections in the specified port.
 *
 * @param {Number} port Port number to listen on. Cannot be null.
 * @param {String} publicUri URI where public static resources will be mapped.
 *   cannot be null or empty.
 * @return {Object} Returns the ExpressJS server. Never returns null.
 */
exports.create = function (port, publicUri) {
  var server = http.createServer(function (req, res) {
    var resource;
    var extension;

    if (req.method === "GET" &&
        req.url.indexOf(publicUri) === 0) {
      resource = __dirname + "/shared/" + req.url.substr(publicUri.length);
      extension = req.url.substr(req.url.lastIndexOf(".") + 1);

      // Only JS files are served as static content.
      if (extension.substr(0, 2) !== "js") {
        res.writeHead(404);
        return res.end('NOT_FOUND');
      }

      fs.readFile(resource, function (err, data) {
        if (err) {
          res.writeHead(400);
          return res.end('NOT_FOUND');
        }

        res.setHeader("Content-Type", "text/javascript");
        res.writeHead(200);
        res.end(data);
      });
    }
  });

  server.listen(port);

  return server;
};
