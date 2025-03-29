#!/usr/bin/env node

import { Command } from "commander";
import profiling from "./profiling";
import benchmark from "./benchmark";
import memory from "./memory";

const program = new Command();

program
  .command("profiling")
  .description("Run Hexo profiling")
  .option("--no-clean", "Do not clean Hexo cache before profiling")
  .action(async (option) => {
    await profiling(option.clean);
  });

program
  .command("benchmark")
  .description("Run Hexo benchmark")
  .action(async () => {
    await benchmark();
  });

program
  .command("memory")
  .description("Run Hexo memory profiling")
  .option("-s, --sample-rate <number>", "Sample rate in ms", "500")
  .option("--no-clean", "Do not clean Hexo cache before profiling")
  .action(async (option) => {
    await memory(parseInt(option.sampleRate, 10), option.clean);
  });

program.parse();
