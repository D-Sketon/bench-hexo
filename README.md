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

- `--no-clean`: Do not clean Hexo cache before profiling.

#### Example

```plain
✔ Cleaning complete.
✔ Profiling complete. Flamegraph saved to 0x directory.
```

### Benchmark

Use perf_hooks to measure the performance metrics of the Hexo generation process.

#### Syntax

```bash
npx bench-hexo benchmark
```

#### Example

```plain
✔ Cleaning complete.
Cold processing
┌──────────────────────────────┬───────────────┐
│ (index)                      │ Cost time (s) │
├──────────────────────────────┼───────────────┤
│ Load Plugin/Scripts/Database │ '0.20s'       │
│ Process Source               │ '1.57s'       │
│ Render Posts                 │ '1.31s'       │
│ Render Files                 │ '2.17s'       │
│ Save Database                │ '0.15s'       │
│ Total time                   │ '5.39s'       │
└──────────────────────────────┴───────────────┘
Hot processing
┌──────────────────────────────┬───────────────┐
│ (index)                      │ Cost time (s) │
├──────────────────────────────┼───────────────┤
│ Load Plugin/Scripts/Database │ '0.48s'       │
│ Process Source               │ '0.48s'       │
│ Render Files                 │ '1.77s'       │
│ Save Database                │ '0.15s'       │
│ Total time                   │ '2.89s'       │
└──────────────────────────────┴───────────────┘
✔ Cleaning complete.
Another Cold processing
┌──────────────────────────────┬───────────────┐
│ (index)                      │ Cost time (s) │
├──────────────────────────────┼───────────────┤
│ Load Plugin/Scripts/Database │ '0.20s'       │
│ Process Source               │ '1.61s'       │
│ Render Posts                 │ '1.33s'       │
│ Render Files                 │ '2.19s'       │
│ Save Database                │ '0.15s'       │
│ Total time                   │ '5.49s'       │
└──────────────────────────────┴───────────────┘
```


### Memory

Use [megumu](https://github.com/D-Sketon/megumu) to measure the memory usage of the Hexo generation process.

#### Syntax

```bash
node src/index.js memory [options]
```

#### Options

- `-s, --sample-rate <number>`: Sample rate in milliseconds (default: 500ms).
- `--no-clean`: Do not clean Hexo cache before profiling.

#### Example

```plain
✔ Cleaning complete.
✔ Memory profiling complete.
     437.21┤      ╭╮
     427.65┤      ││
     418.09┤      ││
     408.52┤      ││
     398.96┤      ││
     389.40┤      ││
     379.83┤      ││
     370.27┤     ╭╯│
     360.71┤     │ ╰
     351.14┤     │
     341.58┤     │
     332.01┤    ╭╯
     322.45┤    │
     312.89┤    │
     303.32┤    │
     293.76┤    │
     284.20┤    │
     274.63┤   ╭╯
     265.07┤   │
     255.51┤   │
     245.94┤   │
     236.38┤  ╭╯
     226.81┤  │
     217.25┤ ╭╯
     207.69┤ │
     198.12┤ │
     188.56┤ │
     179.00┤ │
     169.43┤ │
     159.87┤╭╯
     150.30┼╯


RSS Memory Stats:

Avg:      284.11MB
Min:      150.30MB
Max:      437.21MB
Midian:   277.64MB
```

## License

MIT
