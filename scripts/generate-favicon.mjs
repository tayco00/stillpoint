import sharp from "sharp";
import { fileURLToPath } from "node:url";

const mark = Buffer.from(`
  <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="14" fill="#f1f0e8"/>
    <path d="M17 20h21v9H26v6h12v9H17V20Z" fill="#171714"/>
    <circle cx="47" cy="44" r="6" fill="#ff5a3c"/>
  </svg>
`);

await sharp(mark).png().toFile(fileURLToPath(new URL("../public/favicon.png", import.meta.url)));
