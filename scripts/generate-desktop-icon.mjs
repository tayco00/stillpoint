import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const mark = Buffer.from(`
  <svg width="512" height="512" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="14" fill="#f1f0e8"/>
    <path d="M17 20h21v9H26v6h12v9H17V20Z" fill="#171714"/>
    <circle cx="47" cy="44" r="6" fill="#ff5a3c"/>
  </svg>
`);

const buildDirectory = fileURLToPath(new URL("../build", import.meta.url));
const desktopIconPath = fileURLToPath(new URL("../build/icon.png", import.meta.url));

await mkdir(buildDirectory, { recursive: true });
await sharp(mark).png().toFile(desktopIconPath);
