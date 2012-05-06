
/** Represents a workspace that contains a resource tree to build.
 *
 * @param {Object} workspace Raw workspace object sent from the client. Cannot
 *   be null.
 * @param {Object} callbacks Object containing callbacks invoked during the
 *   workspace lifecycle. Cannot be null.
 * @param {Function} callbacks.createBuffer Callback invoked in order to build
 *   a new concrete buffer for a resource in this workspace. Cannot be null.
 * @param {Function} callbacks.clear Cleans up the workspace's resource tree.
 *   This method is invoked before starting a new build process. It receives
 *   the list of buffers in the workspace and a callback that must be invoked
 *   in order to notify that the cleaning up process finished. Can be null.
 * @constructor
 */
VM.AbstractWorkspace = function (workspace, callbacks) {

  /** Plain list of buffers to compile.
   * @type {VM.Buffer[]}
   */
  var buffers = (function () {
    var rawBuffers = workspace.buffers || {};
    var result = [];
    var buffer;

    for (var bufferName in rawBuffers) {
      if (rawBuffers.hasOwnProperty(bufferName)) {
        buffer = callbacks.createBuffer(rawBuffers[bufferName]);

        result.push(buffer);
      }
    }
    return result;
  }());

  /** Cleaning up function.
   *
   * @param {VM.Buffer[]} buffers List of buffers that represents resources
   *   in this workspace. It's never null.
   * @param  {Function} callback Function that must be invoked in order
   *   to notify that the cleaning up process finished.
   */
  var clear = callbacks.clear || function (buffers, callback) {
    callback();
  };

  return {

    /** Builds this workspace and notifies results.
     *
     * @param {Function} callback Function invoked to notify results. Cannot
     *   be null.
     */
    build: function (callback) {
      throw new Error("Must be implemented.");
    },

    /** Prepares the workspace to start the building process.
     *
     * This method cleans up the workspace and it writes buffers to the
     * storage. It invokes <code>callbacks.clear</code> if that's defined.
     *
     * @param {Function} callback Function invoked once workspace is already
     *   prepared. It receives the list of buffers that represents resources
     *   in this workspace. Cannot be null.
     */
    prepare: function (callback) {
      clear(buffers, function () {
        var doPrepare = function (index) {
          var buffer = buffers[index];

          if (!buffer) {
            callback(buffers);
            return;
          }

          buffer.save(doPrepare.bind(this, index + 1));
        };

        doPrepare(0);
      });
    }
  };
};
