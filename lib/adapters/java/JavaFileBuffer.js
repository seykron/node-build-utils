/** Represents a buffer that contains Java source code.
 *
 * @param {Object} buffer Initial values for the buffer. Cannot be null.
 * @param {Object} options Configuration for the file buffer. Cannot be null.
 * @param {String} options.workingDir Working directory for this buffer. Cannot
 *   be null or empty.
 * @constructor
 * @augments {VM.FileBuffer}
 */
VM.JavaFileBuffer = function (buffer, options) {

  /** RegExp that matches whether a class name is valid.
   * @constant
   */
  var CLASS_NAME_MATCHER = /^(([a-z0-9])+.)+[A-Z0-9]([A-Za-z0-9])+$/;

  /** Checks constructor preconditions.
   * @return {Boolean} Returns true if all preconditions passed.
   * @private
   */
  var checkPreconditions = (function () {
    if (!CLASS_NAME_MATCHER.test(buffer.name)) {
      throw new Error("The buffer name isn't a valid Java class name.");
    }
    return true;
  }());

  /** Base class to inherit from. */
  var base = new VM.FileBuffer(buffer, options);

  /** NodeJS Path library. Cannot be null.
   */
  var path = require("path");

  return Object.extend(base, {
    /** Builds the full file name for this buffer.
     *
     * <p>
     * Java buffers are named using the full classpath and class name. e.g:
     * com.test.app.MyClass.
     * </p>
     */
    getFile : function () {
      return path.join(options.workingDir,
        buffer.name.replace(/\./ig, "/")) + ".java";
    }
  });
};
