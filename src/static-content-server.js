var
  path = require('path'),
  http = require('http'),
  paperboy = require('paperboy'),
  PORT = 80,
  WEBROOT = path.join(path.dirname(__filename), './shared');

// Is it root?
if (process.getgid() !== 0) {
  PORT = process.env.ALT_PORT || 9090;
  console.log("Cannot bind static content server to HTTP port. Binding to" +
      " port " + PORT + " instead.");
}

module.exports = http.createServer(function(req, res) {
  var ip = req.connection.remoteAddress;
  paperboy
    .deliver(WEBROOT, req, res)
    .addHeader('Expires', 300)
    .addHeader('X-PaperRoute', 'Node')
    .before(function() {
      console.info('Received Request');
    })
    .after(function(statCode) {
      log(statCode, req.url, ip);
    })
    .error(function(statCode, msg) {
      res.writeHead(statCode, {'Content-Type': 'text/plain'});
      res.end("Error " + statCode);
      log(statCode, req.url, ip, msg);
    })
    .otherwise(function(err) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end("Error 404: File not found");
      log(404, req.url, ip, err);
    });
}).listen(PORT);

function log(statCode, url, ip, err) {
  var logStr = statCode + ' - ' + url + ' - ' + ip;
  if (err)
    logStr += ' - ' + err;
  console.info(logStr);
}

console.info("Static content server listening on port " + PORT +
    ", running with user '" + process.getuid() + "', group '" +
    process.getgid() + "'.");
