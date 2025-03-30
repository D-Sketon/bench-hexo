import { resolve } from "path";
import fs from "fs";
import zeroEks from "0x";
import ora from "ora";
import { spawn } from "child_process";
import stat from "./stat";

export default async (
  clean: boolean = true,
  concurrency: number = Infinity,
  maxOldSpaceSize: number = 4096
) => {
  const zeroEksDir = resolve(process.cwd(), "0x");
  const hexoBin = resolve(process.cwd(), "node_modules/hexo/bin/hexo");

  if (clean) {
    const spinner = ora({ text: "Cleaning...", color: "cyan" }).start();
    spawn("node", [hexoBin, "clean"], { cwd: process.cwd() });
    spinner.succeed("Cleaning complete.");
  }

  if (fs.existsSync(zeroEksDir)) {
    fs.rmSync(zeroEksDir, { recursive: true });
  }

  const spinner = ora({ text: "Running profiling...", color: "cyan" }).start();
  const zeroEksOpts = {
    argv: [
      `--max-old-space-size=${maxOldSpaceSize}`,
      hexoBin,
      "g",
      "--cwd",
      process.cwd(),
      "--silent",
      "--concurrency",
      concurrency.toString(),
    ],
    workingDir: ".", // A workaround for https://github.com/davidmarkclements/0x/issues/228
    outputDir: zeroEksDir,
    title: "Hexo Flamegraph",
  };
  await zeroEks(zeroEksOpts);

  spinner.succeed("Profiling complete. Flamegraph saved to 0x directory.");

  await stat();
};
