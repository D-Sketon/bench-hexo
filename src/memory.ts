import { Memory } from "megumu";
import asciichart from "asciichart";
import table from "fast-text-table";
import Hexo from "hexo";
import ora from "ora";
import { spawn } from "child_process";
import { resolve } from "path";
import stat from "./stat";
import { appendFile } from "fs/promises";

const MARGIN_FACTOR = 1.3;
const isGitHubActions = process.env.GITHUB_ACTIONS;

function sampleData(oldArr: number[], width: number) {
  const factor = Math.round(oldArr.length / width);
  return oldArr.filter(function (value, index, Arr) {
    return index % factor == 0;
  });
}

function getSampleStats(arr: number[]) {
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const midian = arr.sort((a, b) => a - b)[Math.floor(arr.length / 2)];
  return {
    avg: avg.toFixed(2),
    min: min.toFixed(2),
    max: max.toFixed(2),
    midian: midian.toFixed(2),
  };
}

const memoryBenchmark = async (
  sampleRate: number = 500,
  clean: boolean = true,
  concurrency: number = Infinity
) => {
  const hexoBin = resolve(process.cwd(), "node_modules/hexo/bin/hexo");
  if (clean) {
    const spinner = ora({ text: "Cleaning...", color: "cyan" }).start();
    spawn("node", [hexoBin, "clean"], { cwd: process.cwd() });
    spinner.succeed("Cleaning complete.");
  }

  const memory = new Memory();
  const memoryStats: number[] = [];
  memory.addEventListener(
    {
      type: "TICK",
      target: "RSS",
    },
    (data) => {
      memoryStats.push(data.data / 1024 / 1024);
    },
    sampleRate
  );

  const spinner = ora({
    text: "Running memory profiling...",
    color: "cyan",
  }).start();
  const hexo = new Hexo(process.cwd(), { silent: true });
  const startTime = Date.now();
  memory.startSampling();
  await hexo.init();
  await hexo.call("generate", { concurrency });
  const endTime = Date.now();
  memory.destroy();
  spinner.succeed("Memory profiling complete.");

  let width = Math.floor(process.stdout.columns / MARGIN_FACTOR);
  let height = process.stdout.rows / MARGIN_FACTOR - 10;
  if (Number.isNaN(width)) {
    width = 80;
  }
  if (Number.isNaN(height)) {
    height = 30;
  }
  const plot = asciichart.plot(
    memoryStats.length > width ? sampleData(memoryStats, width) : memoryStats,
    {
      offset: 2,
      height: Math.min(height, 30),
    }
  );
  console.log(plot);
  if (isGitHubActions) {
    appendFile(
      process.env.GITHUB_STEP_SUMMARY,
      `\n\n\`\`\`text\n${plot}\n\`\`\``
    );
  }

  const stats = getSampleStats(memoryStats);
  console.log("\n\nRSS Memory Stats: \n");
  console.log(
    table([
      ["Avg: ", `${stats.avg}MB`],
      ["Min: ", `${stats.min}MB`],
      ["Max: ", `${stats.max}MB`],
      ["Midian: ", `${stats.midian}MB`],
      ["Total Time: ", `${(endTime - startTime) / 1000}s`],
    ])
  );
  if (isGitHubActions) {
    appendFile(
      process.env.GITHUB_STEP_SUMMARY,
      `\n\n| Step | Avg | Min | Max | Midian | Total Time |\n| --- | --- | --- | --- | --- | --- |\n| Memory Stats | ${
        stats.avg
      }MB | ${stats.min}MB | ${stats.max}MB | ${stats.midian}MB | ${
        (endTime - startTime) / 1000
      }s |\n`
    );
  }

  const {
    posts,
    postAssets,
    postContentLength,
    pages,
    pageAssets,
    pageContentLength,
    tags,
    categories,
    routes,
  } = await stat();
  if (isGitHubActions) {
    appendFile(
      process.env.GITHUB_STEP_SUMMARY,
      `\n\n| Step | Value |\n| --- | --- |\n| Number of posts | ${posts} |\n| Number of post assets | ${postAssets} |\n| Avg of post content length | ${Math.floor(
        postContentLength / posts
      )} |\n| Number of pages | ${pages} |\n| Number of page assets | ${pageAssets} |\n| Avg of page content length | ${Math.floor(
        pageContentLength / pages
      )} |\n| Number of tags | ${tags} |\n| Number of categories | ${categories} |\n| Number of routes | ${routes} |\n`
    );
  }
};

const args = process.argv.slice(2);
const sampleRate = Number(args[0]) || 500;
const concurrency = Number(args[1]) || Infinity;
const clean = args[2] !== "false";

memoryBenchmark(sampleRate, clean, concurrency)
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error during memory profiling:", err);
    process.exit(1);
  });
