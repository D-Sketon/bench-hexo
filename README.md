# bench-hexo

A benchmarking cli for Hexo, modified from [hexo#benchmark.js](https://github.com/hexojs/hexo/blob/master/test/benchmark.js)

## Usage

### Profiling

Use [0x](https://github.com/davidmarkclements/0x) to generate a flamegraph for the Hexo generation process.

#### Syntax

```bash
npx bench-hexo profiling [options]
```

#### Options

- `--max-old-space-size <number>`: Set the maximum old space size for Node.js (default: 4096MB).
- `-c, --concurrency <number>`: Set the number of concurrent processes (default: Infinity).
- `--no-clean`: Do not clean Hexo cache before profiling.

#### Example

```plain
✔ Cleaning complete.
✔ Profiling complete. Flamegraph saved to 0x directory.
✔ Hexo statistics loaded.

Hexo Statistics:

Number of posts:              2000
Number of post assets:        0
Avg of post content length:   17330
Number of pages:              0
Number of page assets:        0
Avg of page content length:   0
Number of tags:               100
Number of categories:         13
Number of routes:             4243
```

### Benchmark

Use perf_hooks to measure the performance metrics of the Hexo generation process.

#### Syntax

```bash
npx bench-hexo benchmark [options]
```

#### Options

- `--max-old-space-size <number>`: Set the maximum old space size for Node.js (default: 4096MB).
- `-c, --concurrency <number>`: Set the number of concurrent processes (default: Infinity).

#### Example

```plain
✔ Cleaning complete.
Cold processing
┌──────────────────────────────┬───────────────┐
│ (index)                      │ Cost time (s) │
├──────────────────────────────┼───────────────┤
│ Load Plugin/Scripts/Database │ '0.20s'       │
│ Process Source               │ '2.85s'       │
│ Render Posts                 │ '2.99s'       │
│ Render Files                 │ '7.10s'       │
│ Save Database                │ '0.64s'       │
│ Total time                   │ '13.77s'      │
└──────────────────────────────┴───────────────┘
Hot processing
┌──────────────────────────────┬───────────────┐
│ (index)                      │ Cost time (s) │
├──────────────────────────────┼───────────────┤
│ Load Plugin/Scripts/Database │ '1.17s'       │
│ Process Source               │ '1.17s'       │
│ Render Files                 │ '6.08s'       │
│ Save Database                │ '0.64s'       │
│ Total time                   │ '9.06s'       │
└──────────────────────────────┴───────────────┘
✔ Cleaning complete.
Another Cold processing
┌──────────────────────────────┬───────────────┐
│ (index)                      │ Cost time (s) │
├──────────────────────────────┼───────────────┤
│ Load Plugin/Scripts/Database │ '0.20s'       │
│ Process Source               │ '2.86s'       │
│ Render Posts                 │ '2.95s'       │
│ Render Files                 │ '7.08s'       │
│ Save Database                │ '0.64s'       │
│ Total time                   │ '13.73s'      │
└──────────────────────────────┴───────────────┘
✔ Hexo statistics loaded.

Hexo Statistics:

Number of posts:              2000
Number of post assets:        0
Avg of post content length:   17330
Number of pages:              0
Number of page assets:        0
Avg of page content length:   0
Number of tags:               100
Number of categories:         13
Number of routes:             4243
```


### Memory

Use [megumu](https://github.com/D-Sketon/megumu) to measure the memory usage of the Hexo generation process.

#### Syntax

```bash
node src/index.js memory [options]
```

#### Options

- `-s, --sample-rate <number>`: Sample rate in milliseconds (default: 500ms).
- `--max-old-space-size <number>`: Set the maximum old space size for Node.js (default: 4096MB).
- `-c, --concurrency <number>`: Set the number of concurrent processes (default: Infinity).
- `--no-clean`: Do not clean Hexo cache before profiling.

#### Example

```plain
✔ Cleaning complete.
✔ Memory profiling complete.
    1196.86┤              ╭╮
    1117.26┤              ││
    1037.66┤              ││
     958.06┤              ││       ╭
     878.46┤              ││      ╭╯
     798.86┤              ││     ╭╯
     719.27┤             ╭╯│     │
     639.67┤             │ ╰─────╯
     560.07┤         ╭╮  │
     480.47┤         │╰──╯
     400.87┼╮      ╭─╯
     321.27┤│   ╭╮╭╯
     241.68┤│ ╭─╯╰╯
     162.08┤╰─╯


RSS Memory Stats:

Avg:          523.54MB
Min:          162.08MB
Max:          1196.86MB
Midian:       483.52MB
Total Time:   12.866s
✔ Hexo statistics loaded.

Hexo Statistics:

Number of posts:              2000
Number of post assets:        0
Avg of post content length:   17330
Number of pages:              0
Number of page assets:        0
Avg of page content length:   0
Number of tags:               100
Number of categories:         13
Number of routes:             4243
```

## License

MIT
