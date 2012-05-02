#!/usr/bin/env node

var Service = require("./lib/Service");
var fs = require("fs");

var server = Service.listen(8000, "/shared");
var MIME_TYPES = {
  "html": "text/html",
  "js": "text/javascript",
  "css": "text/css",
  "jpg": "image/jpeg",
  "jpeg": "image/jpeg",
  "gif": "image/gif",
  "png": "image/png"
};

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
