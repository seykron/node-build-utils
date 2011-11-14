/**
 * Extends the native console object to support basic log levels.
 *
 * @author Matías Mirabelli <lumen.night@gmail.com>
 * @since 0.0.1
 */
(function() {
  var warn = console.warn || console.log;
  var error = console.error || console.log;
  var info = console.info || console.log;
  var debug = console.info || console.log;

  console.logLevel = {
    WARN : {
      name : "warn",
      order : 0
    },
    ERROR : {
      name : "error",
      order : 1
    },
    INFO : {
      name : "info",
      order : 2
    },
    DEBUG : {
      name : "debug",
      order : 3
    },
    TRACE : {
      name : "trace",
      order : 4
    }
  };

  var currentLogLevel = console.logLevel.INFO;

  console.setLogLevel = function(level) {
    if (typeof level === "string" ||
      level instanceof String) {
      currentLogLevel = console.logLevel[level.toUpperCase()] ||
          console.logLevel.INFO;
    } else if(!Object.isUndefined(level) && level.name &&
        Object.isNumber(level.order)) {
      currentLogLevel = level;
    }
  };

  console.warn = function(msg) {
    if (currentLogLevel.order >= 0) {
      warn("WARN: " + msg);
    }
  };

  console.error = function(msg) {
    if (currentLogLevel.order >= 1) {
      error("ERROR: " + msg);
    }
  };

  console.info = function(msg) {
    if (currentLogLevel.order >= 2) {
      info("INFO: " + msg);
    }
  };

  console.debug = function(msg) {
    if (currentLogLevel.order >= 3) {
      debug("DEBUG: " + msg);
    }
  };
}());

