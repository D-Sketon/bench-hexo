import { spawn } from "child_process";
import { resolve } from "path";
import { performance, PerformanceObserver } from "perf_hooks";
import ora from "ora";
import stat from "./stat";

const hooks = [
  { regex: /Hexo version/, tag: "hexo-begin" },
  { regex: /Start processing/, tag: "processing" },
  { regex: /Rendering post/, tag: "render-post" },
  { regex: /Files loaded/, tag: "file-loaded" },
  { regex: /generated in/, tag: "generated" },
  { regex: /Database saved/, tag: "database-saved" },
];

const hexoBin = resolve(process.cwd(), "node_modules/hexo/bin/hexo");

function cleanUp() {
  spawn("node", [hexoBin, "clean"], { cwd: process.cwd() });
}

async function run_benchmark(
  name: string,
  spinner: ora.Ora,
  concurrency: number,
  maxOldSpaceSize: number
) {
  let measureFinished = false;

  return new Promise((resolve) => {
    const result = {};
    const obs = new PerformanceObserver((list) => {
      list
        .getEntries()
        // @ts-ignore
        .sort((a, b) => a.detail - b.detail)
        .forEach((entry) => {
          const { name, duration: _duration } = entry;
          const duration = _duration / 1000;
          result[name] = {
            "Cost time (s)": `${duration.toFixed(2)}s`,
          };
        });

      if (measureFinished) {
        obs.disconnect();

        spinner.stop();
        console.log(name);
        console.table(result);

        resolve(result);
      }
    });
    obs.observe({ entryTypes: ["measure"] });

    const hexo = spawn(
      "node",
      [
        `--max-old-space-size=${maxOldSpaceSize}`,
        hexoBin,
        "g",
        "--debug",
        "--concurrency",
        concurrency.toString(),
      ],
      {
        cwd: process.cwd(),
      }
    );
    hooks.forEach(({ regex, tag }) => {
      hexo.stdout.on("data", function listener(data) {
        const string = data.toString("utf-8");
        if (regex.test(string)) {
          performance.mark(tag);
          hexo.stdout.removeListener("data", listener);
        }
      });
    });

    hexo.on("close", () => {
      performance.measure(
        "Load Plugin/Scripts/Database",
        "hexo-begin",
        "processing"
      );

      if (name === "Hot processing") {
        performance.measure("Process Source", {
          start: "processing",
          end: "file-loaded",
          detail: 0,
        });
      } else {
        performance.measure("Process Source", {
          start: "processing",
          end: "render-post",
          detail: 1,
        });
        performance.measure("Render Posts", {
          start: "render-post",
          end: "file-loaded",
          detail: 2,
        });
      }

      performance.measure("Render Files", {
        start: "file-loaded",
        end: "generated",
        detail: 3,
      });
      performance.measure("Save Database", {
        start: "generated",
        end: "database-saved",
        detail: 4,
      });

      performance.measure("Total time", {
        start: "hexo-begin",
        end: "database-saved",
        detail: 5,
      });

      measureFinished = true;
    });
  });
}

export default async (
  concurrency: number = Infinity,
  maxOldSpaceSize: number = 4096
) => {
  let spinner = ora({ text: "Cleaning...", color: "cyan" }).start();
  cleanUp();
  spinner.succeed("Cleaning complete.");
  spinner = ora({
    text: "Running cold processing...",
    color: "cyan",
  }).start();
  await run_benchmark("Cold processing", spinner, concurrency, maxOldSpaceSize);
  spinner = ora({
    text: "Running hot processing...",
    color: "cyan",
  }).start();
  await run_benchmark("Hot processing", spinner, concurrency, maxOldSpaceSize);
  spinner = ora({ text: "Cleaning...", color: "cyan" }).start();
  cleanUp();
  spinner.succeed("Cleaning complete.");
  spinner = ora({
    text: "Running another cold processing...",
    color: "cyan",
  }).start();
  await run_benchmark(
    "Another Cold processing",
    spinner,
    concurrency,
    maxOldSpaceSize
  );
  await stat();
};
