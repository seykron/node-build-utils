
/** @namespace Node build utils top-level namespace.
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
