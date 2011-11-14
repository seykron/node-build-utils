
$(document).observe("dom:loaded", function() {
  $("compile-button").observe("click", function(event) {
    var context = VM.Context.instance(VM.lang.JAVA);

    VM.Test.buffers.each(function(buffer) {
      context.addBuffer(buffer);
    });

    context.compile();
  });

  $("add-buffer-button").observe("click", function(event) {
    var bufferName =  prompt("Enter a valid buffer name");

    if (bufferName) {
      VM.Test.switchBuffer(VM.Test.createBuffer(bufferName));
    }
  });

  VM.Test.switchBuffer(VM.Test.createBuffer("com.test.app.EntryPoint"));

  console.log("Ready.");
});

VM.Test = {
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
    var template = new Template(
        '<a id="buffer-switch-#{id}" href="#">#{name}</a>');
    var id = Math.floor(new Date().getTime() * Math.random());
    var bufferSwitch = new Element("li");
    var bufferArea = new Element("textarea");

    bufferArea.id = "buffer-area-" + id;
    bufferSwitch.update(template.evaluate({ id : id, name : aName}));

    $("buffer-switcher").insert(bufferSwitch).title = aName;
    $("content").insert(bufferArea);

    $("buffer-switch-" + id).observe("click", this.switchBuffer.bind(this, id));

    var buffer = new VM.Buffer({
      sourceCode : null,
      name : aName
    });

    this.buffers.push(Object.extend(buffer, {
      id : id,
      switchEl : bufferSwitch,
      areaEl : bufferArea
    }));

    bufferArea.observe("keyup", function(event) {
      buffer.sourceCode = Event.element(event).value;
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

    buffer.areaEl.setStyle({ display : "block" });
    buffer.switchEl.addClassName("selected");
  },

  /**
   * Searches for the buffer containing the specified id.
   *
   * @param {Number} bufferId Buffer's unique id.
   * @return Returns the buffer object or <code>null</code> if it doesn't exist.
   */
  getBufferById : function(bufferId) {
    var buffers = this.buffers.collect(function(buffer) {
      if (buffer.id === bufferId) {
        return buffer;
      }
    });
    return buffers.compact().shift() || null;
  },

  /**
   * Removes the focus from the current active buffer.
   */
  resetSelection : function() {
    this.buffers.each(function(buffer) {
      buffer.areaEl.setStyle({ display : "none" });
      buffer.switchEl.removeClassName("selected");
    });
  }
};

