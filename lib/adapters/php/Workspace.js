
/** Workspace to hold PHP source files.
 *
 * @param {Object} rawWorkspace Websocket message received from the client.
 *   Cannot be null.
 * @augments {VM.AbstractWorkspace}
 * @constructor
 */
VM.php.Workspace = function (rawWorkspace) {

  /** Workspace working directory.
   * TODO (matias.mirabelli): define an strategy to generalize this directory.
   * @constant
   */
  var WORKING_DIR = "/tmp/node-build-utils/php";

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
    var file = rawBuffer.name;

    // Don't be evil.
    if (file.indexOf(".") === 0 || file.indexOf("..") === 0) {
      throw new Error("Invalid PHP file name: " + file);
    }
    // Believe me, I'm a PHP script.
    if (file.substr(-4) !== ".php") {
      file += ".php";
    }

    return new VM.FileBuffer(rawBuffer, path.join(WORKING_DIR, file));
  };

  /** Base class to inherit from. */
  var base = new VM.AbstractWorkspace(rawWorkspace, {
    createBuffer: createBuffer
  });

  return Object.extend(base, {

    /** Checks syntax on all files in this workspace.
     *
     * @param {Function} callback Function invoked after processing the
     *   workspace. It receives a result object that contains the list of
     *   <code>errors</code> reported by the PHP lint. Cannot be null.
     */
    build: function (callback) {
      this.prepare(function (buffers) {
        var lint = new VM.php.Lint();

        lint.check(WORKING_DIR, function (errors) {
          callback({
            errors: errors
          });
        });
      });
    }
  });
};
