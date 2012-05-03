/** Java compiler facade.
 */
VM.JavaCompiler = function () {

  /** Current builder version.
   * @constant
   */
  var VERSION = "0.0.1";

  // Path API.
  var path = require("path");

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

  /** Returns the Java builder path.
   * @return {String} The builder path. Never returns null.
   * @private
   * @memberOf VM.JavaCompiler
   */
  var builderPath = function () {
    return path.join(__dirname, "build", "dist",
        "java-compiler-" + VERSION + ".jar");
  };

  return {
    /**
     * Compiles the specified list of files. Files will be compiled in the same
     * context.
     *
     * @param {String[]} Java source files to compile. Cannot be null.
     * @param {Function} diagnosticCollectorCallback Function invoked when
     *    the compiler finishes. The list of errors will be passed as
     *    parameter. Cannot be null.
     */
    compile: function (files, diagnosticCollectorCallback) {
      var commandLine = ["-jar", builderPath()].concat(files);
      var result = "";

      console.log("Invoking javac: " + commandLine);

      java = spawn("java", commandLine);

      java.stdout.on('data', function (data) {
        result += data;
      });

      java.stderr.on('data', function (data) {
        console.error('stderr: ' + data);
        result = JSON.stringify([ new Error(data) ] );
      });

      java.on('exit', function (code) {
        if (code === 0) {
          var errors = JSON.parse(result);
          if (errors.length) {
            console.log("Compilation failed with errors: ");
            errors.forEach(function (error) {
              console.log(error);
            });
          } else {
            console.log("Compilation succeed without errors.");
          }
          diagnosticCollectorCallback(errors);
        } else {
          console.error('child process exited with code ' + code);
        }
      });
    }
  };
};
