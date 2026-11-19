const http = require("node:http");
const { readFile, stat } = require("node:fs/promises");
const path = require("node:path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8080);

/* Only these file types are public. Source, package metadata, notes and the
 * code map live in the same folder, so serving the directory as-is leaked
 * server.js and friends through the Railway host. */
const PUBLIC_EXT = new Set([
  ".html", ".css", ".js", ".mjs", ".svg", ".png", ".jpg", ".jpeg", ".webp",
  ".ico", ".pdf", ".txt", ".xml", ".woff", ".woff2", ".wav", ".mp3",
]);
const PRIVATE_NAMES = new Set([
  "server.js", "package.json", "package-lock.json", "README.md",
  ".gitignore", ".gitattributes", ".atlasignore",
]);

const BASE_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=15552000; includeSubDomains",
  "Content-Security-Policy": "frame-ancestors 'self'",
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".xml": "application/xml; charset=utf-8",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { ...BASE_HEADERS, ...headers });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    send(res, 405, "Method not allowed\n", { "Content-Type": "text/plain; charset=utf-8", Allow: "GET, HEAD" });
    return;
  }

  let requestUrl;
  try {
    requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  } catch {
    send(res, 400, "Bad request\n", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }

  if (requestUrl.pathname === "/health") {
    send(res, 200, "ok\n", { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    send(res, 400, "Bad request\n", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }

  if (pathname === "/") pathname = "/index.html";
  if (pathname.endsWith("/")) pathname += "index.html";

  let filePath = path.resolve(ROOT, `.${pathname}`);
  if (filePath !== ROOT && !filePath.startsWith(`${ROOT}${path.sep}`)) {
    send(res, 403, "Forbidden\n", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }

  let fileStat;
  try {
    fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      fileStat = await stat(filePath);
    }
  } catch {
    send(res, 404, "Not found\n", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }

  if (!fileStat.isFile()) {
    send(res, 404, "Not found\n", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const name = path.basename(filePath).toLowerCase();
  const segments = pathname.split("/").filter(Boolean);
  if (
    !PUBLIC_EXT.has(ext) ||
    PRIVATE_NAMES.has(name) ||
    segments.some((part) => part.startsWith(".")) ||
    segments.some((part) => part === "node_modules" || part === "atlas-out")
  ) {
    send(res, 404, "Not found\n", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }
  const headers = {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600",
  };

  if (req.method === "HEAD") {
    res.writeHead(200, { ...BASE_HEADERS, ...headers });
    res.end();
    return;
  }

  try {
    const body = await readFile(filePath);
    send(res, 200, body, headers);
  } catch (error) {
    console.error(`Could not read ${filePath}:`, error);
    send(res, 500, "Internal server error\n", { "Content-Type": "text/plain; charset=utf-8" });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Monarch site listening on port ${PORT}`);
});
