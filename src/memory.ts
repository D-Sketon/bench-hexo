import { Memory } from "megumu";
import asciichart from "asciichart";
import table from "fast-text-table";
import Hexo from "hexo";
import ora from "ora";
import { spawn } from "child_process";
import { resolve } from "path";

const MARGIN_FACTOR = 1.3;

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

export default async (sampleRate: number = 500, clean: boolean = true) => {
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
  memory.startSampling();
  await hexo.init();
  await hexo.call("generate", {});
  memory.destroy();
  spinner.succeed("Memory profiling complete.");

  const width = Math.floor(process.stdout.columns / MARGIN_FACTOR);
  console.log(
    asciichart.plot(
      memoryStats.length > width ? sampleData(memoryStats, width) : memoryStats,
      {
        offset: 2,
        height: Math.min(process.stdout.rows / MARGIN_FACTOR - 10, 30),
        colors: [asciichart.green],
      }
    )
  );
  const stats = getSampleStats(memoryStats);
  console.log("\n\nRSS Memory Stats: \n");
  console.log(
    table([
      ["Avg: ", `${stats.avg}MB`],
      ["Min: ", `${stats.min}MB`],
      ["Max: ", `${stats.max}MB`],
      ["Midian: ", `${stats.midian}MB`],
    ])
  );
};
