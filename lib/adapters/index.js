
/** @namespace Namespace where adapters must register workspace handlers. A
 * workspace handler must extend <code>VM.AbstractWorkspace</code>.
 */
VM.workspace = {};

// Path API.
var path = require("path");

// File system API.
var fs = require("fs");

// Loads all existing adapters.
fs.readdir(__dirname, function (err, files) {
  if (err) {
    console.error("Error listing directory: " + __dirname);
    throw err;
  }

  for (var i = 0; i < files.length; i++) {
    var file = fs.statSync(path.join(__dirname, files[i]));

    if (file.isDirectory()) {
      require(path.join(__dirname, files[i]));
    }
  }
});
