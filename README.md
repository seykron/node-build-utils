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
