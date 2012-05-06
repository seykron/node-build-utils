
/** Represents a buffer stored in the hard disk.
 *
 * @param {Object} buffer Initial values for the buffer. Cannot be null.
 * @param {String} file Full path and file name designated to this buffer.
 *   May not exist. Cannot be null or empty.
 * @augments {VM.Buffer}
 * @constructor
 */
VM.FileBuffer = function (buffer, file) {

  /** Base class to inherit from. */
  var base = new VM.Buffer(buffer);

  /** NodeJS Path library. Cannot be null.
   */
  var path = require("path");

  /** NodeJS File System library. Cannot be null.
   */
  var fs = require("fs");

  /** Creates the directory for the file if it doesn't exist.
   *
   * @param {Function} callback Function invoked when the path is created. It's
  '*    also invoked whether the directory exists. Cannot be null.
   * @private
   * @memberOf VM.FileBuffer
   */
  var initFilePath = function (callback) {
    var dirname = path.dirname(file);

    console.info("Validating directory: " + dirname);

    path.exists(dirname, function (exists) {
      if (!exists) {
        console.info("Path doesn't exist, creating: " + dirname);

        mkdirs(dirname, 0755, function (err) {
          if (err) {
            throw err;
          }

          callback();
        });
      } else {
        callback();
      }
    });
  };

  /**
   * Recursivelly creates a directory. This operation is asynchronous.
   *
   * @param {String} directory Path to create. Cannot be null or empty.
   * @param {Integer} mode Directory permissions. Cannot be null. Must be a
   *   valid umask.
   * @param {Function} [resultProc] Callback to notify when the operation
   *    finishes. The only accepted parameter is an Error object if the
   *    directory couldn't be created. Can be null.
   * @private
   * @memberOf VM.FileBuffer
   */
  var mkdirs = function (directory, mode, resultProc) {
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
        mkdirs(ps.slice(0,-1).join('/'), mode, function (err) {
          if (err && err.errno != process.EEXIST) {
            callback(err);
          } else {
            fs.mkdir(directory, mode, callback);
          }
        });
      }
    });
  };

  return Object.extend(base, {

    /** Writes this buffer to the file system.
     *
     * @param {Function} callback Function invoked once the buffer is written
     *   to the disk. Cannot be null.
     */
    save: function (callback) {
      console.log("Verifying path for file: " + file);

      initFilePath(function () {
        console.info("Writing buffer: " + buffer.name + " to " + file);

        fs.writeFile(file, buffer.sourceCode, function (err) {
          if (err) {
            throw err;
          }
          console.info("Buffer saved to: " + file);
          callback();
        });
      });
    },

    /** Returns the full path and file name related to this buffer.
     * @return {String} A valid file path. Never returns null.
     */
    getFile: function () {
      return file;
    }
  });
};
