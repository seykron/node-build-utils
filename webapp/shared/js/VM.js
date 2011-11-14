
(function() {

  /**
   * JavaScript CommonVM Facade top-level namespace.
   *
   * @namespace
   */
  VM = {
    /**
     * Current VM version.
     * @constant
     */
    version : "0.0.1-SNAPSHOT",

    /**
     * Location of the remote CommonVM service. Must not be null or empty.
     * @type String
     */
    serviceUrl : "ws://localhost:8085",

    /**
     * Enumeration of supported programming languages.
     */
    lang : {
      /**
       * Source code is Java-compliant code.
       */
      JAVA : "java",

      /**
       * Source code is PHP-compliant code.
       */
      PHP : "php"
    }
  };

  /**
   * Represents a query that can be send to the server using a
   * <code>MessageAdapter</code>.
   * <p>
   * Queries works as transient workspaces mapping a set of resources and their
   * relationships, as well as any result of operations performed over them.
   * </p>
   *
   * @since 0.0.1
   */
  VM.Query = Class.create({

    /**
     * Buffers that will be waiting for query processing. Cannot be null.
     * @type VM.MessageListener[]
     */
    messageListeners : null,

    /**
     * Source code programming language. One of defined languages in the
     * <code>VM.lang</code> enumeration. Cannot be null or empty.
     * @type String
     */
    lang : null,

    /**
     * Creates a new Query and initializes fields from the specified plain
     * object, if specified.
     *
     * @param {Object} [query] Object to initialize query fields. Can be null.
     */
    initialize : function(query) {
      if (query) {
        for (var prop in query) {
          if (query.hasOwnProperty(prop)) {
            this[prop] = query[prop];
          }
        }
      }
    }
  });

  /**
   * A <code>MessageAdapter</code> is a strategy that allows to transform
   * queries into compilation commands in order to send them for execution to
   * the server.
   * <p>
   * <code>MessageAdapter</code>s manages the full lifecycle of queries. Queries
   * are such workspaces, which means that can handle a set resources and their
   * relationships.
   * </p>
   *
   * @since 0.0.1
   */
  VM.MessageAdapter = Class.create({

    /**
     * List of active connections to the service. Class-level property.
     *
     * @type Object[id => WebSocket]
     */
    _connections : {},

    /**
     * Contains the connection opened by this instance.
     * @type WebSocket
     */
    _currentConnection : null,

    /**
     * Opens an existing connection or creates a new one to the configured
     * CommonVM remote service. If connectionId isn't specified or if this
     * parameter is an invalid connection id, a new connection is created.
     *
     * @param {Number} connectionId Identifier of the connection about to open.
     *    Can be null.
     * @param {Function} callback Function that receives notifications about
     *    connection events. Cannot be null.
     * @return {Number} The unique identifier of the connection.
     */
    openConnection : function(connectionId, callback) {
      var id = connectionId;
      var connections = this._connections;
      var conn;

      if (connections.hasOwnProperty(id)) {
        conn = connections[id];
        callback(conn, "attach", null);
      } else {
        id = Math.floor(Math.random() * new Date().getTime());
        conn = new WebSocket(VM.serviceUrl);

        conn.onopen = function (event) {
          connections[id] = conn;

          callback(conn, "open", event);
        };

        conn.onmessage = function (event) {
          callback(conn, "message", event);
        };
        
        conn.onclose = function (event) {
          delete connections[id];

          callback(conn, "close", event);
        };
      }

      return id;
    },

    /**
     * Sends a query to the server. The query will be populated with results
     * when the request.returns.
     *
     * @param {Function} callback This operation is asynchronous, 
     */
    send : function(query, callback) {
      this._currentConnection = this.openConnection(this._currentConnection,
      function(conn, type, event) {
        if (type === "open" || type === "attach") {
          conn.send(Object.toJSON(query));
        }

        callback(type, event);
      });
    },

    /**
     * Processes the specified query and populates the results in the same
     * object. This operation is asynchronous.
     *
     * @param {VM.Query} query Query to process. Cannot be null.
     * @param {Function} [callback] Function invoked after processing. Can
     *    be null.
     */
    process : function(query, callback) {
      throw new Error("Must be implemented by adapters!");
    }
  });

  /**
   * Factory method to create the proper MessageAdapter according to the query
   * programming language. It relies in the following convention to instantiate
   * the message adapter:
   * <ul>
   *   <li>Capitalizes the first letter of the query's programming
   *    language.</li>
   *   <li>Appends the suffix <strong>MessageAdapter</strong> to the
   *    capitalized name </li>
   *   <li>Search for the class in the VM namespace.</li>
   * </ul>
   * <p>
   * For example, for the Java programming language it will try to instantiate
   * a VM.JavaMessageAdapter class.
   * </p>
   *
   * @param {VM.Query} query Query to instantiate the message adapter from. It
   *    cannot be null.
   * @return {VM.MessageAdapter} A valid instance of a message adapter.
   * @throws Error if the class isn't found.
   */
  VM.MessageAdapter.fromQuery = function(query) {
    var className = query.lang.capitalize() + "MessageAdapter";

    if (!Object.isFunction(VM[className])) {
      throw new Error("Class not found: " + className);
    }

    return new VM[className]();
  };

  VM.ResourceTree = Class.create({
    
  });

  VM.MessageListener = Class.create({
    buffer : null,

    initialize : function(theBuffer) {
      this.buffer = theBuffer;
    },

    onMessage : function(messageId, data) {
      
    }
  });

  /**
   * Represents a buffer that contains source code. A buffer determines the
   * lifecycle of a piece of code. This implementation operates over memory.
   *
   * @author Matias Mirabelli <lumen.night@gmail.com>
   * @since 0.0.1
   */
  VM.Buffer = Class.create({
    /**
     * Source code represented by this buffer. Cannot be null.
     * @type String
     */
    sourceCode : null,

    /**
     * Buffer name. It must be unique in a single context. Cannot be null.
     * @type String
     */
    name : null,

    /**
     * An object describing a set of flags for this buffer. Some flags are
     * compiler-specific. The following common flags are allowed:
     * <ul>
     *  <li><strong>main</strong>: A boolean value indicating whether this
     *    source code is the application's entry point or not.</li>
     * </ul>
     */
    flags : null,

    /**
     * Creates a new buffer and initialize properties from a template object.
     *
     * @param {Object} [templateObj] Optional. Set of properties to
     *    initialize in this buffer. Can be null.
     */
    initialize : function(templateObj) {
      var mixin = templateObj || {};

      for (var property in mixin) {
        if (mixin.hasOwnProperty(property)) {
          this[property] = mixin[property];
        }
      }
    },

    /**
     * Writes this buffer in the specified path.
     *
     * @param {String} sourcePath Directory where buffer will be saved. Cannot
     *    be null.
     */
    save : function(sourcePath) {
      throw new Error("Not supported by memory buffers.");
    }
  });

  /**
   * Factory method to construct a new buffer. Default implementation creates
   * creates a single <code>VM.Buffer</code>.
   *
   * @param {Function} aBufferClass Class of the buffer to instantiate. Must
   *    be a valid <code>VM.Buffer</code> type.
   * @param {Object} [templateObj] Optional. Set of properties to
   *    initialize in this buffer. Can be null.
   */
  VM.Buffer.newInstance = function(aBufferClass, templateObj) {
    var buffer = new aBufferClass(templateObj);

    if (!(buffer instanceof VM.Buffer)) {
      throw new Error("Invalid buffer instance.");
    }
    
    return buffer;
  };
}());

