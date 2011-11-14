
// Loads prototype library.
Object.extend(global, require("prototype"));

// Loads core objects.
require("../shared/js/VM");

// Loads all components.
require("../shared/js/Context");
require("./FileBuffer");
require("./IO");
require("./Console");

// Loads adapters.
VM.io.requireDir(__dirname + "/adapter/");

// Exports loaded components.
for (var property in VM) {
  exports[property] = VM[property];
}

