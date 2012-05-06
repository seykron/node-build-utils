/** Syntax checker for PHP source files.
 */
VM.php.Lint = function () {

  /**
   * Wrapper function for the native process#spawn. It launches a new process
   * and returns a ChildProcess object.
   *
   * @param {String} command Command line to execute. Cannot be null or empty.
   * @param {String[]} [args] List of arguments passed to the command. Can be
   *    null.
   * @param {Object} [options] Options for the new process. Can be null.
   */
  var exec = require("child_process").exec;

  /** NodeJS Path library. Cannot be null.
   */
  var path = require("path");

  return {
    /** Invokes the PHP lint process for all files in the specified directory
     * and subdirectories.
     *
     * @param {String} workingDir Base directory where files to check are
     *   located. Cannot be null.
     * @param {Function} callback Function invoked to notify results. Cannot be
     *   null.
     */
    check: function (workingDir, callback) {
      var PARSE_ERROR = /PHP Parse error: (.+) in (.+) on line (\d+)/;
      var commandLine = "find " + workingDir +
        " -type f -name \\*.php -exec php -l {} \\;";
      var php = exec(commandLine, function (execError, stdout, stderr) {
        var errors = [];
        var lines = stderr.split("\n");
        var matcher;

        if (execError !== null) {
          throw new Error('child process exited with error: ' + execError);
        }

        // Searches for lines that matches PHP error output.
        lines.forEach(function (line) {
          if (PARSE_ERROR.test(line)) {
            matcher = PARSE_ERROR.exec(line);
            errors.push({
              kind: "ERROR",
              message: matcher[1],
              source: matcher[2],
              lineNumber: matcher[3]
            });
          }
        });

        errors.forEach(function (error) {
          if (error.source) {
            error.source = path.basename(error.source);
          }
        });
        callback(errors);
      });

      console.log("Executing: " + commandLine);
    }
  };
};
