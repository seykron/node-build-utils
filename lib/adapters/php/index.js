/** @namespace Top-level namespace for the PHP adapter. */
VM.php = {};

// Loads PHP workspace and linter dependencies.
require("./Workspace");
require("./Lint");

// Registers the PHP workspace handler.
VM.workspace["php"] = VM.php.Workspace;
