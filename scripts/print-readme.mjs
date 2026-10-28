#!/usr/bin/env node

/**
 * Generate a copy-pasteable README snippet for a self-hosted
 * GitHub Readme Stats instance.
 *
 * Usage:
 *   npm run readme:snippet
 *   node scripts/print-readme.mjs --write profile/README.md
 */

import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const START_MARKER = "<!-- github-readme-stats:start -->";
const END_MARKER = "<!-- github-readme-stats:end -->";

/**
 * Read a CLI argument value.
 *
 * @param {string} name Argument name.
 * @returns {string | undefined} The value after the argument.
 */
const getArgumentValue = (name) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
};

const siteUrl = (process.env.SITE_URL || "").trim().replace(/\/+$/, "");
const username = (process.env.GITHUB_USERNAME || "").trim();
const theme = (process.env.README_THEME || "transparent").trim();
const locale = (process.env.README_LOCALE || "id").trim();
const langsCount = (process.env.README_LANGS_COUNT || "8").trim();
const includeAllCommits =
  (process.env.README_INCLUDE_ALL_COMMITS || "true").toLowerCase() !== "false";

if (!siteUrl) {
  console.error(
    "SITE_URL belum diisi. Tambahkan SITE_URL=https://project.vercel.app ke .env",
  );
  process.exit(1);
}

if (!/^https?:\/\/[^/]+/i.test(siteUrl)) {
  console.error(
    "SITE_URL harus berupa URL lengkap, misalnya https://project.vercel.app",
  );
  process.exit(1);
}

if (!username) {
  console.error(
    "GITHUB_USERNAME belum diisi. Tambahkan GITHUB_USERNAME=username_github ke .env",
  );
  process.exit(1);
}

const statsParams = new URLSearchParams({
  show_icons: "true",
  theme,
  locale,
});

if (includeAllCommits) {
  statsParams.set("include_all_commits", "true");
}

const langsParams = new URLSearchParams({
  layout: "compact",
  langs_count: langsCount,
  theme,
  locale,
});

const statsUrl = `${siteUrl}/api?${statsParams.toString()}`;
const langsUrl = `${siteUrl}/api/top-langs/?${langsParams.toString()}`;
const profileUrl = `https://github.com/${username}`;

const block = [
  START_MARKER,
  `<a href="${profileUrl}">`,
  `  <img height="180" align="center" src="${statsUrl}" alt="GitHub Stats ${username}" />`,
  "</a>",
  `<a href="${profileUrl}?tab=repositories">`,
  `  <img height="180" align="center" src="${langsUrl}" alt="Top Languages ${username}" />`,
  "</a>",
  END_MARKER,
].join("\n");

const writeIndex = process.argv.indexOf("--write");

if (writeIndex === -1) {
  console.log(block);
} else {
  const outputPath = getArgumentValue("--write");

  if (!outputPath) {
    console.error(
      "Path output kosong. Contoh: node scripts/print-readme.mjs --write profile/README.md",
    );
    process.exit(1);
  }

  const absolutePath = path.resolve(process.cwd(), outputPath);
  let content = "";

  try {
    content = await readFile(absolutePath, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  const startIndex = content.indexOf(START_MARKER);
  const endIndex = content.indexOf(END_MARKER, startIndex);

  if (startIndex !== -1 && endIndex !== -1) {
    content =
      content.slice(0, startIndex) +
      block +
      content.slice(endIndex + END_MARKER.length);
  } else {
    const separator = content === "" || content.endsWith("\n") ? "" : "\n";
    content = `${content}${separator}\n${block}\n`;
  }

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content, "utf8");
  console.log(`Snippet README ditulis ke ${absolutePath}`);
}
