Node Build Utils
================
This library started (and it's moving forward!) as a minimalist proof of concept to demostrate how easily can be to build SaaS-like applications with node.

The library goal is to set the base for building projects in different programming languages purely in JavaScript from client side applications. A use case could be to build projects directly from version control systems or github, just specifying a URL.

Getting started
---------------
This project is built on top of [socket.io](http://socket.io/) transport system, so that's a mandatory dependency. In order to give a try to the source-code-editor example just clone the repo, install the dependency and let's begin!

1. Get the code and install dependency:
```bash
  git clone git://github.com/seykron/node-build-utils.git
  cd node-build-utils
  npm install socket.io
```

2. Start the example!
```bash
  # Linux users:
  ./startup.js
  # Windows users:
  node startup.js
```
Now you should be able to play a little with the example application at localhost in port 8000:
```
  http://localhost:8000/
```

Overall architecture
--------------------

```
          CLIENT              |                     SERVER
                              |
  /--------------------\      | /-------------------\         .----------.
  |      Workspace     |------->| WorkspaceResolver |        /............\
  |--------------------|      | \-------------------/        | FileSystem |
  | +lang:String       |      |   |                          \-..........-/
  | +buffers:VM.Buffer |      |   |                                |
  \--------------------/      |   |                                |
                              |   |                                |
                              |   |  /---------------\  /---------------------\
                              |   |->| JavaWorkspace |->| /AbstractWorkspace/ |
                              |   |  \---------------/  |---------------------|
                              |   |                     | +buffers:FileBuffer |
                              |   |                     |---------------------|
                              |   |  /--------------\   | /+build(callback)/  |
                              |   |->| PhpWorkspace |-->| +prepare(callback)  |
                              |      \--------------/   \---------------------/

```

The core concept is the *Workspace*. A *Workspace* contains a set of *buffers* representing the internal resource tree. When a *Workspace* is created it receives the name of the *adapter* which will process it.

When a *Workspace* is sent to the server the entry point will resolve which adapter must process the request, and then it delegates the incoming workspace object to the handler.

Each workspace handler is responsible of processing incoming buffers and then notify results to the client. So far the result is a detailed list of syntax and compilation errors, nevertheless it could be whatever supported by the handler (for example, it could create a distribution package).

Supported Workspaces
--------------------
The following sections describe the existing workspace handlers and expected input/outputs.

### Java
Represents a java source directory. The full workspace is processed by using the java compiler available in the environment. The result is the list of compilation errors.

### Php
Represets a PHP project. The workspace directory and all subdirectories will be scanned for PHP source files in order to invoke the PHP lint process over them. The result is the list of syntax errors reported by the PHP lint (php -l).
