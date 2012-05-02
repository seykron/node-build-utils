
jQuery(function () {
  /** Processes Java results.
   */
  var processResult = function (buffer, result) {
    var error;
    var matches = function (error) {
      var name = buffer.name;
      name = name.substr(name.lastIndexOf(".") + 1) + ".java";
      return name === error.source;
    };

    if (result.errors.length) {
      for (var i = 0;  i < result.errors.length; i++) {
        error = result.errors[i];

        if (matches(error)) {
          buffer.mark(error.lineNumber - 1, error.columnNumber, error.message,
            "error");
        }
      }
    }
  };

  var editor = new VM.SourceEditor(jQuery("#editor"), "ws://localhost:8000",
    VM.lang.JAVA, processResult);

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
