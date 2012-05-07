#!/usr/bin/env node

// Requires the root service lib.
var Service = require("./lib/Service");

/** Contains the supported server handlers.
 * @type {Object}
 */
var ServerHandler = {

  /** Initializes the HTTP server handler.
   *
   * @param  {HttpServer} server HTTP server. Cannot be null.
   */
  http: function (server) {
    var fs = require("fs");

    var MIME_TYPES = {
      "html": "text/html",
      "js": "text/javascript",
      "css": "text/css",
      "jpg": "image/jpeg",
      "jpeg": "image/jpeg",
      "gif": "image/gif",
      "png": "image/png"
    };

    console.log("Using standard HTTP server.");

    server.on("request", function (req, res) {
      var resource;

      if (req.method === "GET" && req.url.indexOf("/asset") === 0) {
        resource = __dirname + '/example/' + req.url;
      } else if (req.method === "GET" && req.url === "/") {
        resource = __dirname + '/example/index.html';
      }

      if (resource) {
        fs.readFile(resource, function (err, data) {
          var extension = resource.substr(resource.lastIndexOf(".") + 1);
          var contentType = MIME_TYPES[extension];

          if (err) {
            res.writeHead(404);
            return res.end("NOT_FOUND: " + resource);
          }
          if (!contentType) {
            res.writeHead(500);
            return res.end("UNSUPPORTED_CONTENT_TYPE: " + extension);
          }

          res.setHeader("Content-Type", contentType);
          res.writeHead(200);
          res.end(data);
        });
      }
    });
  },

  /** Initializes the express server handler.
   * @param  {Express} server Express server instance. Cannot be null.
   */
  express: function (server) {
    var express = require("express");

    console.log("Using Express server.");

    // Disable layout
    server.set("view options", { layout: false });
    server.set('views', __dirname + '/example');
    server.use(express.static(__dirname + '/example/'));

    // Simple renderer.
    server.register('.html', {
      compile: function(str, options){
        return function(locals){
          return str;
        };
      }
    });

    server.get("/", function (req, res) {
      res.render("index.html");
    });
  }
};
var serverType = process.argv[2] || "http";
// Creates the server.
var server = Service.listen(8000, "/shared", serverType);
// Initializes the server according to the server type.
var handler = ServerHandler[serverType];

handler(server);
