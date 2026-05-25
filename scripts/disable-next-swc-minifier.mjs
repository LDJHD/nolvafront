import { readFile, writeFile } from "fs/promises";
import path from "path";

const pluginPath = path.join(
  process.cwd(),
  "node_modules",
  "next",
  "dist",
  "build",
  "webpack",
  "plugins",
  "minify-webpack-plugin",
  "src",
  "index.js"
);

const marker = "/* nolva: disabled SWC minifier for invalid unicode code point */";
const methodSignature =
  "    async optimize(compiler, compilation, assets, cache, { SourceMapSource, RawSource }) {";

const source = await readFile(pluginPath, "utf8");

if (!source.includes(marker)) {
  if (!source.includes(methodSignature)) {
    throw new Error("Next.js minifier plugin shape changed; patch was not applied.");
  }

  await writeFile(
    pluginPath,
    source.replace(methodSignature, `${methodSignature}\n        ${marker}\n        return;`),
    "utf8"
  );
}
