
$(document).ready(function() {
  var compiler = new make.Compiler();

  $("#compile-button").click(function(event) {
    var workspace = new make.Workspace({
      lang : make.lang.JAVA
    });

    var buffers = make.Test.buffers;

    for (var i = 0; i < buffers.length; i++) {
      workspace.addBuffer(buffers[i].buffer);
    }

    make.Test.buffers[0].session.clearAnnotations();

    compiler.build(workspace, function(workspace, errors) {
      var session = make.Test.buffers[0].session;
      var error;

      console.log(workspace);

      if (errors.length) {
        for (var i = 0;  i < errors.length; i++) {
          error = errors[i];

          session.setAnnotations([{
            row : error.lineNumber - 1,
            column: error.columnNumber,
            text : error.message,
            type : "error",
            lint: {}
          }]);
        }
      }
    });
  });

  $("add-buffer-button").click(function(event) {
    var bufferName =  prompt("Enter a valid buffer name");

    if (bufferName) {
      make.Test.switchBuffer(make.Test.createBuffer(bufferName));
    }
  });

  make.Test.switchBuffer(make.Test.createBuffer("com.test.app.EntryPoint"));

  console.log("Ready.");
});

make.Test = {
  /**
   * List of buffer descriptors.
   * @type Object[]
   */
  buffers : [],

  /**
   * Creates a new source code buffer with the specified name.
   *
   * @param {String} aName Buffer name. Cannot be null or empty.
   * @return {Number} The unique identifier of the new buffer.
   */
  createBuffer : function(aName) {
    var id = Math.floor(new Date().getTime() * Math.random());
    var bufferArea = $("<pre />", { id : "buffer-area-" + id });
    var bufferSwitch = $("<li />").html($("<a />", {
      id : "buffer-switch-" + id,
      href : "#"
    }).html(aName));

    $("#buffer-switcher").append(bufferSwitch).attr("title", aName);
    $("#content").append(bufferArea);

    var editor = ace.edit(bufferArea[0]);
    editor.setTheme("ace/theme/twilight");

    var Mode = require("ace/mode/java").Mode;
    editor.getSession().setMode(new Mode());

    $("#buffer-switch-" + id).click(this.switchBuffer.bind(this, id));

    var buffer = new make.Buffer({
      sourceCode : null,
      name : aName
    });

    this.buffers.push({
      id : id,
      buffer: buffer,
      switchEl : bufferSwitch,
      areaEl : bufferArea,
      session : editor.getSession()
    });

    bufferArea.keyup(function(event) {
      buffer.sourceCode = editor.getSession().getValue();
    });

    return id;
  },

  /**
   * Changes the focus to the specified buffer.
   *
   * @param {Number} bufferId Unique buffer identifier. Cannot be null.
   */
  switchBuffer : function(bufferId) {
    var buffer = this.getBufferById(bufferId);

    if (!buffer) {
      return;
    }

    this.resetSelection();

    buffer.areaEl.css({ display : "block" });
    buffer.switchEl.addClass("selected");
  },

  /**
   * Searches for the buffer containing the specified id.
   *
   * @param {Number} bufferId Buffer's unique id.
   * @return Returns the buffer object or <code>null</code> if it doesn't exist.
   */
  getBufferById : function(bufferId) {
    for (var i = 0; i < this.buffers.length; i++) {
      if (this.buffers[i].id === bufferId) {
        return this.buffers[i];
      }
    }

    return null;
  },

  /**
   * Removes the focus from the current active buffer.
   */
  resetSelection : function() {
    for (var i = 0; i < this.buffers.length; i++) {
      this.buffers[i].areaEl.css({ display : "none" });
      this.buffers[i].switchEl.removeClass("selected");
    }
  }
};

