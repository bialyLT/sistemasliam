import { spawn } from "node:child_process";
import { mkdir, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "videos");
const font = "C\\:/Windows/Fonts/arialbd.ttf";

const projects = [
  {
    slug: "sistemas-liam",
    color: "0x0F2B46",
    title: "Sistemas Liam",
    tags: "#Next.js #TypeScript #PostgreSQL",
  },
  {
    slug: "ecommerce-demo",
    color: "0x213647",
    title: "E-commerce Demo",
    tags: "#React #Node.js #MongoDB",
  },
  {
    slug: "kanban-board",
    color: "0x3B2A1E",
    title: "Kanban Board",
    tags: "#TypeScript #Tailwind",
  },
];

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { stdio: "inherit" });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
}

async function generateVideo(project) {
  const output = join(outDir, `${project.slug}.mp4`);
  if (existsSync(output)) return;

  const filter =
    "hue=s=0.4," +
    `drawtext=fontfile=${font}:text='${project.title}':` +
    "fontcolor=white:fontsize=32:x=(w-text_w)/2:y=(h-text_h)/2-60," +
    `drawtext=fontfile=${font}:text='${project.tags}':` +
    "fontcolor=white@0.85:fontsize=20:x=(w-text_w)/2:y=(h-text_h)/2+30";

  await runFfmpeg([
    "-y",
    "-f",
    "lavfi",
    "-i",
    `color=c=${project.color}:s=360x640:r=24:d=4`,
    "-vf",
    filter,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    output,
  ]);

  console.log(`generated ${output}`);
}

mkdir(outDir, { recursive: true }, async (err) => {
  if (err) throw err;
  for (const project of projects) {
    await generateVideo(project);
  }
  console.log("done");
});
