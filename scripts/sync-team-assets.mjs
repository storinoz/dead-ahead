import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = "https://deadahead.wiki.gg/wiki/Team_Powers";
const assets = JSON.parse(await fs.readFile(path.join(root, "data/unit-assets.json"), "utf8"));
const reviewedBonuses = JSON.parse(await fs.readFile(path.join(root, "data/team-bonuses.json"), "utf8"));
const cacheDir = path.join(root, ".tmp/team-pages");
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const imageKey = (url) => decodeURIComponent(new URL(url).pathname.split("/").at(-1)).toLowerCase();
const clean = (value) => value.replace(/!\[[^\]]*\]\([^)]+\)/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`]/g, "").replace(/\s+/g, " ").trim();

async function fetchText(url) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
      return await response.text();
    } catch (error) {
      if (attempt === 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
    }
  }
}

await fs.mkdir(cacheDir, { recursive: true });
await fs.mkdir(path.join(root, "assets/teams"), { recursive: true });
async function getPage(url, key) {
  const file = path.join(cacheDir, `${key}.md`);
  try { return await fs.readFile(file, "utf8"); } catch (error) { if (error.code !== "ENOENT") throw error; }
  const page = await fetchText(`https://r.jina.ai/${url.replace(/^https:/, "http:")}`);
  await fs.writeFile(file, page);
  return page;
}
const markdown = await getPage(source, "team-powers");
const list = markdown.split("## Team Powers List")[1]?.split("### Non-Synergized Units")[0];
if (!list) throw new Error("Team powers table not found");
const teams = {};
const spriteTeams = new Map();
let active;
for (const row of list.split("\n").filter((line) => line.startsWith("|"))) {
  const cells = row.split("|").slice(1, -1).map((cell) => cell.trim());
  if (cells.length === 4 && cells[0].includes("_logo.png")) {
    const nameMatch = cells[0].match(/\[([^\[\]]+)\]\((https?:\/\/deadahead\.wiki\.gg\/wiki\/[^\s)]+(?:\)[^\s)]*)?)\s+"/);
    const iconMatch = cells[0].match(/!\[[^\]]*\]\((https?:\/\/deadahead\.wiki\.gg\/images\/[^)]+)\)/);
    if (!nameMatch || !iconMatch) throw new Error(`Invalid team row: ${cells[0]}`);
    active = slugify(nameMatch[1]);
    teams[active] = { name: nameMatch[1], source: nameMatch[2].replace(/^http:/, "https:"), image: `assets/teams/${active}.png`, sourceImage: iconMatch[1], bonuses: {} };
    for (const match of cells[1].matchAll(/!\[[^\]]*\]\((https?:\/\/deadahead\.wiki\.gg\/images\/[^)]+)\)/g)) {
      const key = imageKey(match[1]);
      if (spriteTeams.has(key) && spriteTeams.get(key) !== active) throw new Error(`Duplicate team for ${key}`);
      spriteTeams.set(key, active);
    }
    teams[active].bonuses[cells[2]] = clean(cells[3]);
  } else if (active && cells.length === 2 && /^[235]$/.test(cells[0])) {
    teams[active].bonuses[cells[0]] = clean(cells[1]);
  }
}

const noTeamSection = markdown.split("### Non-Synergized Units")[1]?.split("### Team Power Restrictions")[0] ?? "";
const noTeamSprites = new Set([...noTeamSection.matchAll(/!\[[^\]]*\]\((https?:\/\/deadahead\.wiki\.gg\/images\/[^)]+)\)/g)].map((match) => imageKey(match[1])));
const units = {};
const unresolved = [];
for (const [name, unit] of Object.entries(assets)) {
  units[name] = {};
  for (const skin of unit.skins) {
    const key = imageKey(skin.sourceImage);
    const team = spriteTeams.get(key);
    if (team) units[name][skin.name] = team;
    else if (noTeamSprites.has(key)) units[name][skin.name] = null;
    else unresolved.push({ name, skin: skin.name, sprite: key });
  }
}
for (const [key, team] of Object.entries(teams)) {
  if (![2, 3, 5].every((tier) => team.bonuses[tier])) throw new Error(`Incomplete bonuses: ${key}`);
}
for (const missing of unresolved) {
  const page = await getPage(assets[missing.name].source, slugify(missing.name));
  const skinSection = page.split(/## Skins(?: and Synergies)?/)[1]?.split(/\n## /)[0] ?? "";
  const row = skinSection.split("\n").find((line) => line.startsWith("|") && line.toLowerCase().includes(missing.sprite));
  const teamIcon = row?.split("|")[3]?.match(/!\[[^\]]*\]\((https?:\/\/deadahead\.wiki\.gg\/images\/[^)]+)\)/)?.[1];
  const found = Object.entries(teams).find(([, team]) => teamIcon && imageKey(team.sourceImage) === imageKey(teamIcon));
  if (!found) throw new Error(`Unknown team: ${missing.name}, ${missing.skin}`);
  units[missing.name][missing.skin] = found[0];
  console.log(`Confirmed ${missing.name} / ${missing.skin}: ${found[1].name}`);
}
teams.if.name = "Internal Forces (IF)";
teams.if.source = "https://deadahead.wiki.gg/wiki/Internal_Forces_(Team)";
for (const [key, team] of Object.entries(teams)) {
  const page = await getPage(team.source, `${key}-team`);
  const synergies = page.split("## Synergies")[1]?.split(/\n## /)[0];
  if (!synergies) throw new Error(`Missing team details: ${team.name}`);
  if (![2, 3, 5].every((tier) => reviewedBonuses[key]?.[tier])) throw new Error(`Missing reviewed descriptions: ${team.name}`);
  team.bonuses = reviewedBonuses[key];
  console.log(`Verified all three tiers: ${team.name}`);
  await new Promise((resolve) => setTimeout(resolve, 700));
}

let cursor = 0;
const downloads = Object.values(teams);
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < downloads.length) {
    const team = downloads[cursor++];
    const response = await fetch(`https://images.weserv.nl/?url=${encodeURIComponent(team.sourceImage.replace(/^https?:\/\//, ""))}&output=png`, { signal: AbortSignal.timeout(45000) });
    if (!response.ok) throw new Error(`Icon download failed: ${team.name}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes[0] !== 0x89 || bytes.toString("ascii", 1, 4) !== "PNG") throw new Error(`Invalid icon: ${team.name}`);
    await fs.writeFile(path.join(root, team.image), bytes);
  }
}));

await fs.writeFile(path.join(root, "data/team-assets.json"), `${JSON.stringify({ source, verifiedAt: "2026-10-06", teams, units }, null, 2)}\n`);
console.log(`Saved ${downloads.length} team icons and all existing skin affiliations.`);
