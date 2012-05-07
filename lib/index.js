// Node FileSystem API.
var fs = require('fs');

// Loads core components.
require("./shared/VM");
require("./shared/Buffer");
require("./FileBuffer");
require("./AbstractWorkspace");

// Loads language adapters.
require("./adapters");

// List of files included in the bundle.
var JS_BUNDLE = [
  "/shared/VM.js",
  "/shared/Workspace.js",
  "/shared/Buffer.js"
];

// JavaScript source files bundle.
var jsBundle = "";

// Extends the global namespace with server-specific information.
Object.extend(VM, {

  /** Returns the bundle of shared source files.
   *
   * The content is cached forever until the server is restarted.
   *
   * @return {String} A bundle with the shared JavaScript source files.
   */
  getJsBundle: function (callback) {
    var read = function (resource) {
      if (!resource) {
        callback(jsBundle);
        return;
      }

      fs.readFile(__dirname + resource, function (err, data) {
        if (err) {
          throw new Error("Cannot read: " + resource + ". " + err);
        }
        jsBundle += data;
        read(JS_BUNDLE.shift());
      });
    };
    read(JS_BUNDLE.shift());
  }
});
