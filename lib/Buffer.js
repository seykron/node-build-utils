
/** Represents a buffer that contains source code.
 *
 * A buffer determines the lifecycle of a piece of code. This implementation
 * operates over memory.
 *
 * @param {Object} options Initialization options for the buffer. Cannot be
 *   null.
 * @param {String} options.name Buffer name. Cannot be null or empty.
 * @constructor
 */
VM.Buffer = function (options) {

  return {
    /**
     * Source code represented by this buffer. Cannot be null.
     * @type String
     */
    sourceCode: null,

    /**
     * Buffer name. It must be unique in a single context. Cannot be null.
     * @type String
     */
    name: options.name,

    /**
     * An object describing a set of flags for this buffer. Some flags are
     * compiler-specific. The following common flags are allowed:
     * <ul>
     *  <li><strong>main</strong>: A boolean value indicating whether this
     *    source code is the application's entry point or not.</li>
     * </ul>
     */
    flags: null
  };
};
