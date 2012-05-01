
/** Represents a workspace that contains the source code tree as buffers.
 *
 * A workspace manages buffers for a programming language.
 *
 * @param {Object} configuration Wokspace configuration. Cannot be null.
 * @param {String} configuration.lang Programming language of the buffers in
 *   this workspace. Cannot be null or empty.
 * @param {Object} [buffers] Object containing a mapping of initial buffers.
 *   The key must be the buffer name and the value the VM.Buffer object. Can
 *   be null.
 * @constructor
 */
VM.Workspace = function (configuration) {

  /** Checks constructor preconditions.
   * @return {Boolean} Returns true if all preconditions passed.
   * @private
   */
  var checkPreconditions = (function () {
    if (!configuration.lang) {
      throw new Error("Programming language is required.");
    }
    return true;
  }());

  /** Open connection to the compiler service.
   * @type {WebSocket}
   * @private
   * @memberOf VM.Workspace
   */
  var connection = null;

  /** Mapping of existing buffers in the workspace.
   * @type {Object}
   * @private
   * @memberOf VM.Workspace
   */
  var buffers = configuration.buffers || {};

  return {

    /** Connects this workspace to the remote compiler service.
     *
     * @param {String} url Url of the remote service. Cannot be null or
     *   empty.
     * @param {Function} callback Function invoked when messages comes from
     *   the server.
     */
    connect: function (url, callback) {
      connection = new WebSocket(url);

      connection.onmessage = function (event) {
        callback(JSON.parse(event.data));
      };

      connection.onclose = function (event) {
        connection = null;
      };
    },

    /** Invokes the remote service to build this workspace.
     *
     * The result is notified to the callback provided in the
     * <code>connect()</code> method. If the workspace isn't connected
     * to a remote service this method will throw an error.
     */
    build: function () {
      if (!connection) {
        throw new Error("Workspace not connected to a remote service.");
      }

      // Sends the workspace.
      connection.send(JSON.stringify({
        lang: configuration.lang,
        buffers: buffers
      }));
    },

    /** Adds a new buffer to this workspace.
     *
     * If a buffer with the same name already exists it will throw an error.
     *
     * @param {VM.Buffer} buffer Buffer to add. Cannot be null.
     */
    addBuffer: function (buffer) {
      if (buffers.hasOwnProperty(buffer.name)) {
        throw new Error("Buffer " + buffer.name + " already exist.");
      }
      buffers[buffer.name] = buffer;
    }
  };
};
