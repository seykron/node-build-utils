/**
 * Represents a buffer that contains Java source code.
 *
 * @author Matias Mirabelli <lumen.night@gmail.com>
 * @since 0.0.1
 */
VM.JavaFileBuffer = Class.create(VM.FileBuffer, {

  /** RegExp that matches whether a class name is valid. */
  classNameMatcher : /^(([a-z0-9])+.)+[A-Z0-9]([A-Za-z0-9])+$/,

  initialize : function($super, templateObj) {
    $super(templateObj);

    if (!this.classNameMatcher.test(this.name)) {
      throw new Error("Invalid class name: " + this.name);
    }
  },

  /**
   * Builds the full file name for this buffer using the specified source code
   * path and buffer's name.
   * <p>
   * Java buffers are named using the full classpath and class name. e.g:
   * com.test.app.MyClass.
   * </p>
   */
  getFile : function($super, sourcePath) {
    return this.path.join(sourcePath, this.name.replace(/\./ig, "/")) + ".java";
  }
});

