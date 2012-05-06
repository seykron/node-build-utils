
/** Workspace to compile Java source files.
 *
 * @param {Object} rawWorkspace Websocket message received from the client.
 *
 * @augments {VM.AbstractWorkspace}
 * @constructor
 */
VM.JavaWorkspace = function (rawWorkspace) {

  /** Workspace working directory.
   * TODO (matias.mirabelli): define a strategy to generalize this directory.
   * @constant
   */
  var WORKING_DIR = "/tmp/node-build-utils/java";

  /** RegExp that matches whether a class name is valid.
   * @constant
   */
  var CLASS_NAME_MATCHER = /^(([a-z0-9])+.)+[A-Z0-9]([A-Za-z0-9])+$/;

  /** NodeJS File System library. Cannot be null.
   */
  var fs = require("fs");

  /** NodeJS Path library. Cannot be null.
   */
  var path = require("path");

  /** Creates the buffer from its plain object representation.
   *
   * @param {Object} rawBuffer Object containing the buffer information. Cannot
   *   be null.
   * @return {VM.JavaFileBuffer} Returns a valid Java buffer. Never returns
   *   null.
   */
  var createBuffer = function (rawBuffer) {
    var file = path.join(WORKING_DIR,
        rawBuffer.name.replace(/\./ig, "/")) + ".java";

    if (!CLASS_NAME_MATCHER.test(rawBuffer.name)) {
      throw new Error("The buffer name isn't a valid Java class name.");
    }

    return new VM.FileBuffer(rawBuffer, file);
  };

  /** Deletes all generated class files related to the specified source files,
   * if they exist.
   *
   * @param {String[]} buffers List of buffers in this workspace. Cannot be
   *   null.
   * @param {Function} callback Function that must be invoked once the
   *   cleaning up process finished. Cannot be null.
   */
  var clear = function (buffers, callback) {
    buffers.forEach(function (buffer) {
      var file = buffer.getFile();
      var binaryFile = file.replace(".java", ".class");

      console.log("Removing file: " + binaryFile);

      try {
        fs.unlinkSync(binaryFile);
      } catch (cause) {
        console.log("Class file doesn't exist. Resuming...");
      }
    });
    callback();
  };

  /** Base class to inherit from. */
  var base = new VM.AbstractWorkspace(rawWorkspace, {
    clear: clear,
    createBuffer: createBuffer
  });

  return Object.extend(base, {

    /** Compiles the Java workspace by using a <code>VM.JavaCompiler</code>.
     *
     * @param {Function} callback Function invoked after processing the
     *   workspace. It receives a result object that contains the list of
     *   <code>errors</code> reported by the Java compiler. Cannot be null.
     */
    build: function (callback) {
      this.prepare(function (buffers) {
        var files = buffers.map(function (buffer) {
          return buffer.getFile();
        });
        var compiler = new VM.JavaCompiler();

        compiler.compile(files, function (errors) {
          errors.forEach(function (error) {
            if (error.source) {
              error.source = error.source.replace("file:" + WORKING_DIR, "");
            }
          });

          callback({
            errors: errors
          });
        });
      });
    }
  });
};
