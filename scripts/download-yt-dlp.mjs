// Downloads the yt-dlp standalone Linux binary at build time for Vercel deployments.
// The standalone binary has Python bundled — no system Python required.
// Skipped automatically on non-Linux platforms (macOS uses the Homebrew install).
import { chmodSync, createWriteStream, existsSync, mkdirSync } from "fs";
import { pipeline } from "stream/promises";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const binDir = path.join(projectRoot, "bin");
const binaryPath = path.join(binDir, "yt-dlp");

if (process.platform !== "linux") {
  console.log("Skipping yt-dlp download (non-Linux platform)");
  process.exit(0);
}

if (existsSync(binaryPath)) {
  console.log("yt-dlp binary already present, skipping download");
  process.exit(0);
}

if (!existsSync(binDir)) {
  mkdirSync(binDir, { recursive: true });
}

// yt-dlp_linux is the standalone binary — no Python dependency
const downloadUrl =
  "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux";

console.log("Downloading yt-dlp standalone Linux binary...");
const response = await fetch(downloadUrl);
if (!response.ok) {
  console.error(`Failed to download yt-dlp: HTTP ${response.status}`);
  process.exit(1);
}

await pipeline(response.body, createWriteStream(binaryPath));
chmodSync(binaryPath, "755");
console.log("yt-dlp downloaded successfully");
