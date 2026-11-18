# Model scorecard — rule R1 (pensionableSalary)

> One run is a sample, not a benchmark. Synthetic data only — never paste secrets or real member data.

| | Model A | Model B |
|---|---|---|
| Model (name as shown in the picker) | GPT-5.6 Sol | Claude Opus 5.5 |
| Harness · Mode · Permissions | Copilot · Interactive · Manual | Copilot · Interactive · Manual |
| Reasoning effort | Medium | Medium |
| Date | 2026-11-18 | 2026-11-18 |

## Scores

| Criterion | How to score | Model A | Model B |
|---|---|---|---|
| Correctness verified | Expected values that match the `node -e` output (x / 5) | 5/5 | 2/5 verified (#1 `17545,1` → 0, #4 `50000,0` → RangeError); #2, #3, #5 not in the run |
| Edge cases found | Which did it cover? franchise boundary · salary cap · part-time · below franchise → 0 · invalid factor (0 or > 1) · negative salary | franchise boundary, salary cap, part-time, below franchise → 0, invalid factor (missed: negative salary) | franchise boundary, salary cap, part-time, invalid factor, negative salary (below franchise → 0 only mentioned in a note, no own input) |
| Hallucinations | Invented functions, parameters, files or rules? List them (none = 👍) | none 👍 | none 👍 |
| Latency feel | fast / ok / slow | ok | fast |
| Cost / credits | Relative cost of the model (supported-models doc) — heavier model = more AI credits | high | high |

## Verification output

```text
$ node -e "import('./api/src/domain/pension.ts').then(m=>{for (const [s,f] of [[0,1],[17545,1],[137801,0.5],[17546,0.005],[50000,0]]) {try{console.log(s,f,m.pensionableSalary(s,f))}catch(e){console.log(s,f,e.name+': '+e.message)}}})"
0 1 0
17545 1 0
137801 0.5 60127.5
17546 0.005 0.01
50000 0 RangeError: partTimeFactor must be greater than 0 and at most 1
```

### Model B

```text
$ node -e "import('./api/src/domain/pension.ts').then(m=>{for (const [s,f] of [[17545,1],[137801,1],[50000,0]]) {try{console.log(s,f,m.pensionableSalary(s,f))}catch(e){console.log(s,f,e.name+': '+e.message)}}})"
17545 1 0
137801 1 120255
50000 0 RangeError: partTimeFactor must be greater than 0 and at most 1
```