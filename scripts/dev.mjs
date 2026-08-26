import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const phpBinary = process.env.PHP_BINARY || "php";
const php = spawn(phpBinary, ["-S", "127.0.0.1:8000", "-t", root, path.join(root, "api/dev-router.php")], {
  cwd: root,
  stdio: "inherit",
});
const vite = spawn(process.execPath, [path.join(root, "node_modules/vite/bin/vite.js"), "--host", "0.0.0.0"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  if (!php.killed) php.kill("SIGTERM");
  if (!vite.killed) vite.kill("SIGTERM");
  process.exitCode = code;
  setTimeout(() => process.exit(code), 100);
}

php.on("error", (error) => {
  console.error(`\nUnable to start the local PHP API (${error.message}).`);
  console.error("Install PHP 8+, or set PHP_BINARY to your PHP executable, then run npm run dev again.\n");
  stop(1);
});
php.on("exit", (code, signal) => {
  if (!stopping) {
    console.error(`\nThe local PHP API stopped (${signal || `exit ${code ?? 1}`}).`);
    stop(code ?? 1);
  }
});
vite.on("exit", (code) => { if (!stopping) stop(code ?? 0); });
process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
