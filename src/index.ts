#!/usr/bin/env node

import { Command } from "commander";
import { spawn } from "child_process";
import path from "path";
import profiling from "./profiling";
import benchmark from "./benchmark";

const program = new Command();

program
  .command("profiling")
  .description("Run Hexo profiling")
  .option("--max-old-space-size <number>", "Max old space size in MB", "4096")
  .option("-c, --concurrency <number>", "Concurrency level", "Infinity")
  .option("--no-clean", "Do not clean Hexo cache before profiling")
  .action(async (option) => {
    await profiling(
      option.clean,
      Number(option.concurrency),
      Number(option.maxOldSpaceSize)
    );
  });

program
  .command("benchmark")
  .option("--max-old-space-size <number>", "Max old space size in MB", "4096")
  .option("-c, --concurrency <number>", "Concurrency level", "Infinity")
  .description("Run Hexo benchmark")
  .action(async (option) => {
    await benchmark(Number(option.concurrency), Number(option.maxOldSpaceSize));
  });

program
  .command("memory")
  .description("Run Hexo memory profiling")
  .option("--max-old-space-size <number>", "Max old space size in MB", "4096")
  .option("-s, --sample-rate <number>", "Sample rate in ms", "500")
  .option("-c, --concurrency <number>", "Concurrency level", "Infinity")
  .option("--no-clean", "Do not clean Hexo cache before profiling")
  .action(async (option) => {
    spawn(
      "node",
      [
        `--max-old-space-size=${option.maxOldSpaceSize}`,
        path.resolve(__dirname, "./memory.js"),
        option.sampleRate,
        option.concurrency,
        option.clean,
      ],
      {
        stdio: "inherit",
      }
    );
  });

program.parse();
