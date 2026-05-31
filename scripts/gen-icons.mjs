import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pub = path.join(root, "public");
const src = path.join(pub, "logo.png");

// Full-bleed square icons generated straight from the logo.
const targets = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-icon.png", size: 180 },
  { name: "icon-32.png", size: 32 },
  { name: "favicon.png", size: 48 },
];

for (const t of targets) {
  await sharp(src)
    .resize(t.size, t.size, { fit: "cover" })
    .png()
    .toFile(path.join(pub, t.name));
  console.log("generated", t.name);
}

// Maskable: sample a corner pixel for the pad color so it blends, then
// shrink the logo into the 80% safe zone required by maskable icons.
const { data } = await sharp(src)
  .resize(1, 1, { position: "left top" })
  .raw()
  .toBuffer({ resolveWithObject: true });
const bg = { r: data[0], g: data[1], b: data[2], alpha: 1 };

await sharp(src)
  .resize(410, 410, { fit: "cover" })
  .extend({ top: 51, bottom: 51, left: 51, right: 51, background: bg })
  .png()
  .toFile(path.join(pub, "icon-maskable-512.png"));
console.log("generated icon-maskable-512.png");
