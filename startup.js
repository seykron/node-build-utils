var Service = require("./lib/Service");
var express = require('express');

if (!process.env.NODE_UID) {
  console.warn("The NODE_UID environment variable isn't set.");
}
if (!process.env.NODE_GID) {
  console.warn("The NODE_GID environment variable isn't set.");
}

process.setgid(process.env.NODE_GID || process.getgid());
process.setuid(process.env.NODE_UID || process.getuid());

var server = Service.listen(process.env.WEBSOCKET_PORT || 8000, "/shared");

// Configures the rendering engine.
server.set('view engine', 'mustache')
server.set("views", __dirname + '/example');
server.register(".html", require('stache'));
server.use("/asset", express.static(__dirname + '/example/asset'));
server.get('/', function (req, res) {
  res.render("index.html");
});
