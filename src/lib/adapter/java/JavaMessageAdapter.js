(function() {

/**
 * Wrapper function for the native process#spawn. It launches a new process
 * and returns a ChildProcess object.
 *
 * @param {String} command Command line to execute. Cannot be null or empty.
 * @param {String[]} [args] List of arguments passed to the command. Can be
 *    null.
 * @param {Object} [options] Options for the new process. Can be null.
 */
var spawn = require("child_process").spawn;

/**
 * NodeJS Path library. Cannot be null.
 */
var path = require("path");

/**
 * NodeJS File System library. Cannot be null.
 */
var fs = require("fs");

/**
 *
 * @author Matias Mirabelli <lumen.night@gmail.com>
 * @since 0.0.1
 */
VM.JavaMessageAdapter = Class.create(VM.MessageAdapter, {

  /**
   * Processes the specified query and populates the results in the same
   * object. This operation is asynchronous.
   *
   * @param {VM.Query} query Query to process. Cannot be null.
   * @param {Function} [callback] Function invoked after processing. Can
   *    be null.
   */
  process : function($super, query, callback) {
    this.prepare(query, function(files, error) {
      if (error) {
        callback(query, error);
      }

      var compiler = new VM.JavaCompiler();

      compiler.compile(files, function(errors) {
        errors.each(function(error) {
          if (error.source) {
            error.source = path.basename(error.source);
          }
        });

        callback(query, errors);
      }.bind(this));
    });
  },

  /**
   * Determines the working root path for the query.
   *
   * @param {VM.Query} query Query to get the root working directory. Cannot
   *    be null.
   * @return {String} A valid directory to write query information and buffers.
   */
  getRootPath : function(query) {
    return "/tmp/common-vm";
  },

  /**
   * Prepares the specified query to invoke the compiler performing the
   * following actions:
   * <ul>
   *  <li>Deletes old generated files.</li>
   *  <li>Creates or replaces source files in the query working directory.</li>
   *  <li>Prepares the classpath.</li>
   * </ul>
   */
  prepare : function(query, callback) {
    var rootDir = this.getRootPath(query);
    var listeners = $A(query.messageListeners);
    var files = [];

    var prepare = function(listener) {
      if (!listener) {
        this.deleteOldBinaries(files);
        callback(files);

        return;
      }

      try {
        var buffer = VM.Buffer.newInstance(VM.JavaFileBuffer, listener.buffer);

        files.push(buffer.getFile(rootDir));

        buffer.save(rootDir, prepare.curry(listeners.shift()));
      } catch(cause) {
        callback([], cause);
      }
    }.bind(this);

    prepare(listeners.shift());
  },

  /**
   * Deletes all generated class files related to the specified source files,
   * if they exists.
   *
   * @param {VM.Query} query Query containing the list of source files. Cannot
   *    be null.
   */
  deleteOldBinaries : function(files) {
    files.each(function(file) {
      var binaryFile = path.join(path.dirname(file),
        path.basename(file, ".java") + ".class");

      console.info("Removing file: " + binaryFile);

      try {
        fs.unlinkSync(binaryFile);
      } catch(ex) {
        console.error("Couldn't remove file: " + binaryFile +
            " (" + ex.message + ")");
      }
    });
  }
});

}());

