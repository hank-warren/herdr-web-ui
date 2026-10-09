import { buildXtermSource } from "./scripts/build-xterm.ts";
import { defineConfig, normalizePath, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const xtermSource = normalizePath(buildXtermSource(fileURLToPath(new URL(".", import.meta.url))));

let revision: string | null = null;
try { revision = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8", timeout: 5000, stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { /* non-Git build */ }

// agentSvgMarks.ts carries LobeHub Icons paths (MIT): their notice ships with every built client
const thirdPartyNotices: Plugin = {
  name: "third-party-notices",
  generateBundle() {
    this.emitFile({ type: "asset", fileName: "THIRD_PARTY_NOTICES.md", source: readFileSync("THIRD_PARTY_NOTICES.md", "utf8") });
  },
};

// Theodore (github.com/hank-warren/theodore) serves this client under a path prefix,
// HERDR_WEB_BASE=/herdr/, and proxies <base>api/ and <base>ws to this server. The client's own
// root-relative URLs are rewritten at build time so the source stays upstream's.
const base = process.env["HERDR_WEB_BASE"] ?? "/";
if (!/^\/([\w-]+\/)*$/.test(base)) throw new Error(`HERDR_WEB_BASE must be a path ending in /, not ${base}`);
const underBase: Plugin = {
  name: "under-base",
  enforce: "pre",
  transform(code, id) {
    if (base === "/" || !/\/(src|shared)\/[^?]*\.tsx?$/.test(id)) return null;
    return code
      .replaceAll('"/api/', `"${base}api/`)
      .replaceAll("`/api/", `\`${base}api/`)
      .replaceAll('"/icons/', `"${base}icons/`)
      .replaceAll("${window.location.host}/ws", `\${window.location.host}${base}ws`);
  },
  // Theodore owns the installed app: no service worker of this client's (before Vite bundles the
  // page's scripts, so pwa.ts is left out) and Theodore's manifest (after Vite prefixes the base).
  transformIndexHtml: {
    order: "pre",
    handler: (html) => (base === "/" ? html : html.replace(/<script type="module" src="\/src\/pwa\.ts"><\/script>\s*/, "")),
  },
};
const theodoreManifest: Plugin = {
  name: "theodore-manifest",
  transformIndexHtml: {
    order: "post",
    handler: (html) => (base === "/" ? html : html.replace(/<link rel="manifest"[^>]*>/, '<link rel="manifest" href="/manifest.webmanifest" />')),
  },
};

export default defineConfig({
  base,
  plugins: [underBase, theodoreManifest, react(), thirdPartyNotices],
  define: {
    __APP_REVISION__: JSON.stringify(revision),
    __THEODORE__: JSON.stringify(base !== "/"),
    __APP_VERSION__: JSON.stringify((JSON.parse(readFileSync("package.json", "utf8")) as { version: string }).version),
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:7317",
      "/ws": { target: "ws://localhost:7317", ws: true },
    },
  },
  build: { outDir: "dist" },
  // The Bun patch targets xterm's readable source, not its minified distribution. Build that
  // source so dev, production and the website use the same reviewed IME backport.
  resolve: { alias: [
    { find: /^@xterm\/xterm$/, replacement: `${xtermSource}/browser/public/Terminal.js` },
    { find: /^browser\//, replacement: `${xtermSource}/browser/` },
    { find: /^common\//, replacement: `${xtermSource}/common/` },
    { find: "@shared", replacement: new URL("./shared", import.meta.url).pathname },
  ] },
});
