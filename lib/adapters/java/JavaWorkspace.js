
/** Workspace to compile Java source files.
 *
 * @param {Object} msg Websocket message received from the client.
 *
 * @constructor
 */
VM.JavaWorkspace = function (msg) {

  /** NodeJS Path library. Cannot be null.
   */
  var path = require("path");

  /** NodeJS File System library. Cannot be null.
   */
  var fs = require("fs");

  /** Plain list of buffers to compile.
   * @type {VM.Buffer[]}
   */
  var buffers = (function () {
    var rawBuffers = msg.buffers || {};
    var result = [];
    var buffer;

    for (var bufferName in rawBuffers) {
      if (rawBuffers.hasOwnProperty(bufferName)) {
        buffer = new VM.JavaFileBuffer(rawBuffers[bufferName], {
          workingDir: "/tmp/node-build-utils"
        });

        result.push(buffer);
      }
    }
    return result;
  }());

  /** Deletes all generated class files related to the specified source files,
   * if they exists.
   *
   * @param {String[]} files List of files to remove. Cannot be null.
   */
  var deleteOldBinaries = function () {
    buffers.forEach(function (buffer) {
      var file = buffer.getFile();
      var binaryFile = path.join(path.dirname(file),
        path.basename(file, ".java") + ".class");

      console.log("Removing file: " + binaryFile);
      try {
        fs.unlinkSync(binaryFile);
      } catch (cause) {
        console.log("Class file doesn't exist. Resuming...");
      }
    });
  };

  /**
   * Prepares this workspace to invoke the compiler performing the
   * following actions:
   * <ul>
   *  <li>Deletes old generated files.</li>
   *  <li>Creates or replaces source files in the workspace working
   *    directory.</li>
   *  <li>Prepares the classpath.</li>
   * </ul>
   * @param {Function} callback Function invoked once workspace is prepared.
   *   It receives the list of String values that represent the files to
   *   compile.
   */
  var prepare = function (callback) {
    var workingBuffers = [].concat(buffers);
    var files = [];

    var doPrepare = function (buffer) {
      if (!buffer) {
        deleteOldBinaries();
        callback(files);

        return;
      }

      files.push(buffer.getFile());
      buffer.save(doPrepare.bind(this, workingBuffers.shift()));
    };

    doPrepare(workingBuffers.shift());
  };

  return {
    /** Compiles the Java workspace by using a <code>VM.JavaCompiler</code>.
     *
     * @param {Function} callback Function invoked after processing the
     *   workspace. It receives a result object that contains the list of
     *   <code>errors</code> reported by the Java compiler. Cannot be null.
     */
    build: function (callback) {
      prepare(function (files) {
        var compiler = new VM.JavaCompiler();

        compiler.compile(files, function (errors) {
          errors.forEach(function (error) {
            if (error.source) {
              error.source = path.basename(error.source);
            }
          });

          callback({
            errors: errors
          });
        });
      });
    }
  };
};
