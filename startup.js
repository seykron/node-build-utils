var Service = require("./lib/Service");

if (!process.env.NODE_UID) {
  console.warn("The NODE_UID environment variable isn't set.");
}
if (!process.env.NODE_GID) {
  console.warn("The NODE_GID environment variable isn't set.");
}

process.setgid(process.env.NODE_GID || process.getgid());
process.setuid(process.env.NODE_UID || process.getuid());

console.log(Service);
Service.listen(process.env.WEBSOCKET_PORT || 8000);
