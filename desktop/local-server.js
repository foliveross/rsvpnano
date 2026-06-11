const http = require("http");
const fs = require("fs");
const path = require("path");

const LOCAL_PORT = 39218;

function safeJoin(root, requestPath) {
  const normalized = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const full = path.join(root, normalized);
  if (!full.startsWith(root)) {
    return null;
  }
  return full;
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".bin": "application/octet-stream",
  };
  return map[ext] || "application/octet-stream";
}

function createLocalServer({ publicDir, webDir, companionCoreDir }) {
  const server = http.createServer((req, res) => {
    const url = req.url.split("?")[0];

    if (url === "/api/local/ping") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, service: "rsvpnano-local", port: LOCAL_PORT }));
      return;
    }

    let filePath = null;
    if (url === "/" || url === "/index.html") {
      filePath = path.join(publicDir, "index.html");
    } else if (url.startsWith("/web/")) {
      filePath = safeJoin(webDir, url.slice("/web/".length));
    } else if (url.startsWith("/companion-core/")) {
      filePath = safeJoin(companionCoreDir, url.slice("/companion-core/".length));
    } else if (url.startsWith("/public/")) {
      filePath = safeJoin(publicDir, url.slice("/public/".length));
    } else {
      filePath = safeJoin(publicDir, url.replace(/^\//, ""));
    }

    if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }

    res.writeHead(200, { "Content-Type": contentType(filePath) });
    fs.createReadStream(filePath).pipe(res);
  });

  server.listen(LOCAL_PORT, "127.0.0.1");
  return server;
}

module.exports = { createLocalServer, LOCAL_PORT };
