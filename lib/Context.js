
(function () {

/**
 * Singleton instance of VM.Context class. Support different backends.
 * @type Object[VM.lang => VM.Context]
 */
var instance = {};

VM.Context = Class.create({
  _bufferCache : null,

  _lang : null,

  _messageAdapter : null,

  initialize : function(lang) {
    this._lang = lang;
    this._bufferCache = {};
    this._messageAdapter = new VM.MessageAdapter(this._lang);
  },

  addBuffer : function(buffer) {
    this._bufferCache[buffer.name] = new VM.MessageListener(buffer);
  },

  compile : function(options, callback) {
    var query = new VM.Query({
      lang : this._lang,
      messageListeners : $H(this._bufferCache).values()
    });
    this._messageAdapter.send(query, function(message, event) {
      if (message === "message") {
        callback(JSON.parse(event.data));
      }
    });
  }
});

/**
 * Returns a unique instance of Context for the specified backend adapter.
 *
 * @param {String} [lang] Programming language backend processor. One of defined
 *    constants in <code>VM.lang</code>. Default is Java. Can be null.
 */
VM.Context.instance = function(lang) {
  if (!lang) {
    lang = VM.lang.JAVA;
  }

  if (!instance.hasOwnProperty(lang)) {
    instance[lang] = new VM.Context(lang);
  }

  return instance[lang];
};

}());
