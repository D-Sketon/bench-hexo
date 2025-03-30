#!/usr/bin/env node

import { Command } from "commander";
import profiling from "./profiling";
import benchmark from "./benchmark";
import memory from "./memory";

const program = new Command();

program
  .command("profiling")
  .description("Run Hexo profiling")
  .option("-c, --concurrency <number>", "Concurrency level", "Infinity")
  .option("--no-clean", "Do not clean Hexo cache before profiling")
  .action(async (option) => {
    await profiling(option.clean, Number(option.concurrency));
  });

program
  .command("benchmark")
  .option("-c, --concurrency <number>", "Concurrency level", "Infinity")
  .description("Run Hexo benchmark")
  .action(async (option) => {
    await benchmark(Number(option.concurrency));
  });

program
  .command("memory")
  .description("Run Hexo memory profiling")
  .option("-s, --sample-rate <number>", "Sample rate in ms", "500")
  .option("-c, --concurrency <number>", "Concurrency level", "Infinity")
  .option("--no-clean", "Do not clean Hexo cache before profiling")
  .action(async (option) => {
    await memory(
      Number(option.sampleRate),
      option.clean,
      Number(option.concurrency)
    );
  });

program.parse();
