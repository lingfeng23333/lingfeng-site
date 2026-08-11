import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sodium = require(
  "C:/Users/zorro/AppData/Local/Temp/gh-libsodium/node_modules/libsodium-wrappers",
);

await sodium.ready;

const pub = process.env.GH_PUBLIC_KEY;
const secret = process.env.GH_SECRET_VALUE;

if (!pub || !secret) {
  console.error("missing GH_PUBLIC_KEY or GH_SECRET_VALUE");
  process.exit(1);
}

const binKey = sodium.from_base64(pub, sodium.base64_variants.ORIGINAL);
const encrypted = sodium.crypto_box_seal(
  sodium.from_string(secret),
  binKey,
);
console.log(sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL));
