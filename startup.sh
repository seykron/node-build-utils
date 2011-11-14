#!/bin/bash

# User to discard permissions after binding to the HTTP port, if possible.
export NODE_GID=matt;
# Group to discard permissions after binding to the HTTP port, if possible.
export NODE_UID=matt;
# Alternative port to the HTTP static content server. By default it tries to
# bind the port 80.
export ALT_PORT=9090;
# Application log level. Can be: warn, error, info, debug, trace
export LOG_LEVEL=debug;
# Alternative port for websocket server.
export WEBSOCKET_PORT=8085;

# Starts the application.
node server.js

