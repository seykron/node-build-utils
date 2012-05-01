(function () {
var path = require("path");
var fs = require("fs");

VM.io = {

  /**
   * Recursivelly creates a directory. This operation is asynchronous.
   *
   * @param {String} directory Path to create. Cannot be null or empty.
   * @param {Integer} mode Directory permissions. Cannot be null.Must be a valid
   *    umask.
   * @param {Function} [resultProc] Callback to notify when the operation
   *    finishes. The only accepted parameter is an Error object if the
   *    directory couldn't be created. Can be null.
   */
  mkdirs : function(directory, mode, resultProc) {
    var callback = resultProc || function () {};

    if (directory.charAt(0) != '/') {
      callback('Relative path: ' + directory);
      return;
    }

    var ps = path.normalize(directory).split('/');

    path.exists(directory, function (exists) {
      if (exists) {
        callback(null);
      } else {
        VM.io.mkdirs(ps.slice(0,-1).join('/'), mode, function (err) {
          if (err && err.errno != process.EEXIST) {
            callback(err);
          } else {
            fs.mkdir(directory, mode, callback);
          }
        });
      }
    });
  },

  /**
   * Loads all files by invoking <code>require</code> for each file
   * (non-directory) in the specified path.
   *
   * @param {String} directory Path containing the files to load. Cannot be null
   *    or empty.
   * @param {Function} [callback] Callback invoked when the file loading
   *    finishes. The list of loaded files will be passed as argument. It
   *    can be null.
   */
  requireDir : function(directory, callback) {
    var loaded = [];
    var includePath = path.normalize(directory);

    fs.readdir(includePath, function (err, files) {
      if (err) {
        console.error("Error listing directory: " + includePath);
        throw err;
      }

      for (var i = 0; i < files.length; i++) {
        var file = fs.statSync(includePath + files[i]);

        if (!file.isDirectory()) {
          require(path.join(includePath, files[i]));
          loaded.push(files[i]);
        }
      }

      if (callback) {
        callback(loaded);
      }
    });
  },

  /**
   * Returns the executable file for the specifie tool.
   *
   * @param {String} toolName Name of the required tool. Cannot be null or
   *    empty.
   * @param {String} [descriptor] Descriptor used to append to the end of the
   *    tool executable name. Can be null.
   */
  getToolCommand : function(toolName, descriptor) {
    var toolDir = path.join(process.cwd(), "tools", toolName);
    var bin = path.join(toolDir, toolName + "-" + VM.version +
        descriptor + ".jar");

    return bin;
  }
};
}());

