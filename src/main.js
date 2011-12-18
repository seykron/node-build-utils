// Loads static content server and drops any privilege.
var express = require("express");
var Make = require("make");

// Creates the appserver.
var app = express.createServer();

// Maps static resources.
app.use("/asset", express.static(__dirname + '/view/asset'));
app.use("/app", express.static(Make.getStaticPath()));

// Configures the rendering engine.
app.set('view engine', 'mustache');
app.set("views", __dirname + '/view');
app.register(".html", require('stache'));

// General configuration.
app.configure(function () {
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(app.router);
});

module.exports = {
  listen : function(port) {
    app.listen(port);
    console.log('Application running on port ' + port);
  }
};

app.get("/", function(req, res) {
  res.render("index.html", {});
});
