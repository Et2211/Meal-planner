// Downloads the yt-dlp standalone Linux binary at build time for Vercel deployments.
// The standalone binary has Python bundled — no system Python required.
// Skipped automatically on non-Linux platforms (macOS uses the Homebrew install).
import { chmodSync, createWriteStream, existsSync, mkdirSync } from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { fileURLToPath } from "url";

const projectRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const binDir = path.join(projectRoot, "bin");
const binaryPath = path.join(binDir, "yt-dlp");

if (process.platform !== "linux") {
  process.exit(0);
}

if (existsSync(binaryPath)) {
  process.exit(0);
}

if (!existsSync(binDir)) {
  mkdirSync(binDir, { recursive: true });
}

// yt-dlp_linux is the standalone binary  no Python dependency
const downloadUrl =
  "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux";

const response = await fetch(downloadUrl);
if (!response.ok) {
  process.exit(1);
}

await pipeline(response.body, createWriteStream(binaryPath));
chmodSync(binaryPath, "755");
