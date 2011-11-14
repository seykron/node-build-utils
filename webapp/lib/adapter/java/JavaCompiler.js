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

/** Node's util library. */
var util = require("util");

/**
 * Java compiler facade.
 *
 * @author Matias Mirabelli <lumen.night@gmail.com>
 * @since 0.0.1
 */
VM.JavaCompiler = Class.create({

  /**
   * Compiles the specified list of files. Files will be compiled in the same
   * context.
   *
   * @param {String[]} Java source files to compile. Cannot be null.
   * @param {Function} diagnosticCollectorCallback Function invoked when
   *    the compiler finishes. The list of errors will be passed as parameter.
   *    Cannot be null.
   */
  compile : function(files, diagnosticCollectorCallback) {
    var compilerBin = VM.io.getToolCommand("java-compiler",
      "-jar-with-dependencies");
    var result = "";

    console.log("Invoking javac: " + ["-jar", compilerBin].concat(files)
        .join(" "));

    java = spawn("java", ["-jar", compilerBin].concat(files));

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
          console.debug("Compilation failed with errors: ");
          errors.each(function(error) {
            console.debug(util.inspect(error));
          });
        } else {
          console.debug("Compilation succeed without errors.");
        }
        diagnosticCollectorCallback(errors);
      } else {
        console.error('child process exited with code ' + code);
      }
    });
  }
});

}());

