/** Represents a source code editor.
 *
 * @param {Element} container Source editor container element. Cannot be null.
 * @param {String} serviceUrl URL of the build service. Cannot be null or
 *    empty.
 * @param {String} lang Programming language supported by this editor.
 * @param {Function} processResult Function invoked to process build results.
 *   It can be used to display errors, warning, etc. It receives the editor
 *   Buffer object as first parameter, and the result object as second
 *   parameter.
 * @constructor
 */
VM.SourceEditor = function (container, serviceUrl, lang, processResult) {

  /** Workspace for this editor.
   *
   * @type {VM.Workspace}
   * @private
   * @memberOf VM.SourceEditor
   */
  var workspace = new VM.Workspace(lang);

  /** Map of internal buffer objects.
   * @type {Object}
   * @private
   * @memberOf VM.SourceEditor
   */
  var buffers = {};

  /** List that contains the items that represent each buffer.
   * @type {Element}
   * @private
   * @memberOf VM.SourceEditor
   */
  var bufferSwitcher = jQuery("<ul />", {
    "class": "buffer-switcher"
  }).html('<li class="shadow"><!-- --></li>');

  /** Element that contains the buffers editors.
   * @type {Element}
   */
  var editorContainer = jQuery("<div />", {
    "class": "editor-container"
  });

  /** Editor mode according to the programming language.
   * @type {Mode}
   */
  var Mode = require("ace/mode/" + lang).Mode;

  /** Callback invoked after the workspace is built.
   * @param  {Object} result Remote service result.
   * @private
   * @memberOf VM.SourceEditor
   */
  var onBuild = function (result) {
    var incomingBuffers = result.workspace.buffers;

    for (var name in buffers) {
      if (buffers.hasOwnProperty(name)) {
        buffers[name].clear();
        processResult(buffers[name], result);
      }
    }
  };

  /** Changes the editor focus to the specified buffer.
   *
   * @param {Buffer} buffer Buffer to display. Cannot be null.
   */
  var displayBuffer = function (buffer) {
    for (var name in buffers) {
      if (buffers.hasOwnProperty(name)) {
        buffers[name].hide();
      }
    }
    buffer.show();
  };

  /** Represents an internal editor buffer.
   *
   * @param {VM.Buffer} buffer Service buffer. Cannot be null.
   */
  var Buffer = function (buffer) {

    /** ACE editor for this buffer.
     * @type {Object}
     * @private
     * @memberOf Buffer
     */
    var editor = null;

    /** Element to bring this buffer to front.
     * @type {Element}
     * @private
     * @memberOf Buffer
     */
    var switcher = null;

    /** Element that contains the buffer content.
     * @type {Element}
     * @private
     * @memberOf Buffer
     */
    var area = null;

    /** List of annotations in this buffer.
     * @type {Object[]}
     * @private
     * @memberOf Buffer
     */
    var annotations = [];

    return {
      /** Buffer name.
       * @type {String}
       */
      name: buffer.name,

      /** Renders this buffer.
       */
      render: function () {
        area = jQuery("<pre />");
        switcher = jQuery("<a />", {
          href: "#",
          title: buffer.name
        }).html(buffer.name);

        bufferSwitcher.append(jQuery("<li />").html(switcher));
        editorContainer.append(area);

        editor = ace.edit(area[0]);
        editor.setTheme("ace/theme/twilight");
        editor.getSession().setMode(new Mode());

        switcher.click(this.bringToFront.bind(this));
        area.keyup(function (event) {
          buffer.sourceCode = editor.getSession().getValue();
        });
      },

      /** Brings this buffer to front.
       */
      bringToFront: function () {
        displayBuffer(this);
      },

      /** Hides this buffer.
       */
      hide: function () {
        jQuery(switcher).removeClass("selected");
        jQuery(area).css({ display : "none" });
      },

      /** Shows this buffer. Z-index is not guaranteed.
       */
      show: function () {
        jQuery(switcher).addClass("selected");
        jQuery(area).css({ display : "block" });
      },

      /** Clears all markers in the buffer.
       */
      clear: function () {
        editor.getSession().clearAnnotations();
        annotations = [];
      },

      /** Add a marker to the buffer.
       *
       * @param {Number} row Row number where to set the marker. Cannot be
       *    null.
       * @param {Number} column Column number where to set the marker. Cannot
       *    be null.
       * @param {String} text Marker text. Cannot be null or empty.
       * @param {String} [type] Marker type. Can be error, info or warn.
       *    Default is error.
       */
      mark: function (row, column, text, type) {
        annotations.push({
          row: row,
          column: column,
          text: text,
          type: type || "error",
          lint: {}
        });
        editor.getSession().setAnnotations(annotations);
      }
    };
  };

  return {
    /** Renders this editor.
     */
    render: function () {
      jQuery(container)
        .empty()
        .addClass("sourceEditor")
        .append(bufferSwitcher)
        .append(editorContainer);
      workspace.connect(serviceUrl, onBuild);
    },

    /** Builds the current workspace and display results in buffers.
     */
    build: function () {
      workspace.build();
    },

    /** Creates a new source code buffer with the specified name.
     *
     * This method delegates the VM.Buffer creation to the provided callback.
     *
     * @param {String} aName Buffer name. Cannot be null or empty.
     * @return {Buffer} Returns the created editor buffer. Never returns null.
     */
    createBuffer: function (aName) {
      var checkPreconditions = (function () {
        if (buffers.hasOwnProperty(aName)) {
          throw new Error("A buffer with the same name already exist.");
        }
        return true;
      }());

      var buffer = new VM.Buffer({
        sourceCode : null,
        name : aName
      });
      var editorBuffer = new Buffer(buffer);

      editorBuffer.render();
      buffers[aName] = editorBuffer;
      workspace.addBuffer(buffer);

      return editorBuffer;
    }
  };
};
