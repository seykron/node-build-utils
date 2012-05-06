
jQuery(function () {
  var resolvers = {
    java: function (buffer, error) {
      var name = "/" + buffer.name.replace(/\./ig, "/") + ".java";

      if (name === error.source) {
        return error;
      }

      return null;
    },
    php: function (buffer, error) {
      if (error.source.indexOf(buffer.name) === 0) {
        return error;
      }

      return null;
    }
  };

  /** Constructs an error handler with the specified error resolver.
   *
   * @param {Function} resolver Error resolver function. It takes the buffer
   *   and the error as parameter and it must return the resolved error. Must
   *   return null if the error cannot be resolved.
   */
  var errorHandler = function (resolver) {
    return function (buffer, result) {
      var error;

      if (result.errors.length) {
        for (var i = 0;  i < result.errors.length; i++) {
          error = resolver(buffer, result.errors[i]);

          if (error) {
            buffer.mark(error.lineNumber - 1, error.columnNumber,
              error.message, "error");
          }
        }
      }
    };
  };
  var lang = VM.lang.PHP;
  var editor = new VM.SourceEditor(jQuery("#editor"), "ws://localhost:8000",
    lang, errorHandler(resolvers[lang]));

  editor.render();
  editor.createBuffer("com.test.app.EntryPoint").bringToFront();

  jQuery("#compile-button").click(function (event) {
    editor.build();
  });

  jQuery("#add-buffer-button").click(function (event) {
    var bufferName =  prompt("Enter a valid buffer name");
    var buffer;

    if (bufferName) {
      buffer = editor.createBuffer(bufferName);
      buffer.bringToFront();
    }
  });
});
