
/** @namespace Node build utils top-level namespace.
 */
VM = {
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

/** Extends an object with the methods and attributes from another. It
 * includes the full prototype chain. This performs only a shallow copy.
 *
 * @param  {Object} to   Object to augment. Cannot be null.
 * @param  {Object} from Object to copy. Cannot be null.
 * @return {Object}      Returns the target object, for convenience.
 */
Object.extend = function (to, from) {
  for (var property in from) {
    to[property] = from[property];
  }
  return to;
};
