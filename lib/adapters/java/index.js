// Loads java workspace and compiler dependencies.
require("./JavaCompiler");
require("./JavaWorkspace");

// Registers the Java workspace handler.
VM.workspace["java"] = VM.JavaWorkspace;
