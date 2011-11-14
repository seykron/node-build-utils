/**
 *
 * @author Matias Mirabelli <lumen.night@gmail.com>
 * @since 0.0.1
 */
VM.FileBuffer = Class.create(VM.Buffer, {

  /**
   * Access to Node's File System API. Cannot be null.
   */
  fs : null,

  /**
   * Access to Node's Path API. Cannot be null.
   */
  path : null,

  /**
   * Creates a new buffer and initialize properties from a template object.
   *
   * @param {Object} [templateObj] Optional. Set of properties to
   *    initialize in this buffer. Can be null.
   */
  initialize : function($super, templateObj) {
    $super(templateObj);

    this.fs = require("fs");
    this.path = require("path");
  },

  /**
   * Writes this buffer in the specified path.
   *
   * @param {String} sourcePath Directory where buffer will be saved. Cannot
   *    be null.
   */
  save : function($super, sourcePath, callback) {
    this._buildFilePath(sourcePath, function(file) {
      console.info("Writing buffer: " + this.name + " to " + file);

      this.fs.writeFile(file, this.sourceCode, function(err) {
        if (err) {
          throw err;
        }
        console.info("Buffer saved to: " + file);
        callback();
      });
    }.bind(this));
  },

  /**
   * Returns the full path and file name related to this buffer. 
   */
  getFile : function(sourcePath) {
    return this.path.join(sourcePath, this.name);
  },

  /** Creates the specified path if it's needed.
   *
   * @param {String} sourcePath Directory to create. Cannot be null.
   * @param {Function} callback Function invoked when the path is created. It's
  '*    also invoked whether the directory exists. Cannot be null.
   */
  _buildFilePath : function(sourcePath, callback) {
    var file = this.getFile(sourcePath);
    var dirname = this.path.dirname(file);

    console.info("Validating directory: " + dirname);

    this.path.exists(dirname, function(exists) {
      if (!exists) {
        console.info("Path doesn't exist, creating: " + dirname);

        VM.io.mkdirs(dirname, 0755, function(err) {
          if (err) {
            throw err;
          }

          callback(file);
        });
      } else {
        callback(file);
      }
    });
  }
});

