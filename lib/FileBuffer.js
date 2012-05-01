
/** Represents a buffer stored in the hard disk.
 * @constructor
 * @augments {VM.Buffer}
 */
VM.FileBuffer = function (options) {

  /** Base class to inherit from. */
  var base = new VM.Buffer(options);

  /** NodeJS Path library. Cannot be null.
   */
  var path = require("path");

  /** NodeJS File System library. Cannot be null.
   */
  var fs = require("fs");

  /** Creates the specified path if it's needed.
   *
   * @param {String} file File to build path for. Cannot be null or empty.
   * @param {Function} callback Function invoked when the path is created. It's
  '*    also invoked whether the directory exists. Cannot be null.
   */
  var buildFilePath = function (file, callback) {
    var dirname = path.dirname(file);

    console.info("Validating directory: " + dirname);

    path.exists(dirname, function (exists) {
      if (!exists) {
        console.info("Path doesn't exist, creating: " + dirname);

        VM.io.mkdirs(dirname, 0755, function (err) {
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

  return Object.extend(base, {

    /** Writes this buffer to the file system in the working directory.
     *
     * @param {Function} callback Function invoked once the buffer is written
     *   to the disk. Cannot be null.
     */
    save: function (callback) {
      var file = this.getFile();

      buildFilePath(file, function () {
        console.info("Writing buffer: " + options.name + " to " + file);

        fs.writeFile(file, options.sourceCode, function (err) {
          if (err) {
            throw err;
          }
          console.info("Buffer saved to: " + file);
          callback();
        });
      });
    },

    /** Returns the full path and file name related to this buffer.
     */
    getFile: function() {
      return path.join(options.workingDir, options.name);
    }
  });
};
