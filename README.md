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

### Creating a workspace
In order to access the client API the *node-build-utils* bundle must exist in your document:

```html
  <script type="text/javascript" src="shared/VM.js"></script>
```

*VM.js* is the default name of the API bundle, and *shared/* is the endpoint configured when the *node-build-tools* service is started.

Now you're ready to build a new workspace (jQuery is included as part of the example application):

```javascript
jQuery(function () {
  // Creates the workspace.
  var workspace = new VM.Workspace(VM.lang.Java);

  // Connects to the remote build service.
  workspace.connect("ws://localhost:8000", function (result) {
    if (result.errors) {
      console.log("There're build errors.");
      console.log(result.errors);
    } else {
      console.log("Build successful.");
    }
  });
});
```
This piece of code instantiates a new workspace for Java source files and then it connects to the remote build service. Note that the second parameter passed to *connect()* is the callback invoked after each build in order to notify results.

Now our workspace is ready to add some buffers. Let's start with a simple *EntryPoint* java class.

```html
<button id="build">Build!</button>
<textarea id="source-code">
package net.app.test;

public class EntryPoint {
  public static void main(final String[] args) {
    // Syntax error: missing semicolon.
    System.out.println("Hello world!")
  }
}
</textarea>
```

We can use the textarea to write some Java code, so it will be our buffer editor:

```javascript
  var editor = jQuery("#source-code"); // Textarea.
  var buffer = new VM.Buffer({
    name: "net.app.test.EntryPoint",
    sourceCode: editor.html()
  });
  editor.keyup(function (event) {
    buffer.sourceCode = editor.html();
  });
  // Adds the buffer to the workspace.
  workspace.addBuffer(buffer);
```

Now we have a pretty editable buffer. We're ready to build the workspace:

```javascript
  // Builds the workspace on button click.
  jQuery("#build").click(function (event) {
    workspace.build();
  });
```

Every time the workspace is built errors are notified to the callback defined in *connect()*. We can easily change the programming language defined in the *Workspace* constructor and our code will remain compliant.


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
