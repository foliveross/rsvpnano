const { app, BrowserWindow } = require("electron");
const path = require("path");
const { createLocalServer, LOCAL_PORT } = require("./local-server");

const isDev = !app.isPackaged;
const publicDir = path.join(__dirname, "public");
const webDir = isDev ? path.join(__dirname, "..", "web") : path.join(process.resourcesPath, "web");
const companionCoreDir = isDev
  ? path.join(__dirname, "..", "companion-core", "dist")
  : path.join(process.resourcesPath, "companion-core");

let mainWindow = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 900,
    minHeight: 700,
    title: "RSVP Nano Companion",
    backgroundColor: "#0c1110",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
  });

  mainWindow = win;
  win.loadURL(`http://127.0.0.1:${LOCAL_PORT}/`);
}

app.whenReady().then(() => {
  createLocalServer({ publicDir, webDir, companionCoreDir });
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
