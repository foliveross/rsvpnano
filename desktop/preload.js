const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("rsvpnanoDesktop", {
  isDesktop: true,
});
