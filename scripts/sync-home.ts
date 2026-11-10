import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import prettier from "prettier";
import { renderHomePage } from "../functions/home.ts";

const outputPath = resolve(process.cwd(), "public/index.html");
const rawHtml = renderHomePage({
  username: "machfudn",
  theme: "transparent",
  locale: "en",
  includeAllCommits: "true",
  langsCount: "8",
});
const formattedHtml = await prettier.format(rawHtml, { parser: "html" });

writeFileSync(outputPath, formattedHtml, "utf8");
console.log(`Synced ${outputPath} (${formattedHtml.length} bytes)`);
