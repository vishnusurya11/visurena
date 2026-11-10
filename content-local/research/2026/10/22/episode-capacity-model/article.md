## Why this question

Each episode has a hard machine budget of 6 hours on one GPU. A new shot grammar (more close-ups, every shot its own take) raised the shot count, so the planner needed to know, *before rendering*, how many shots fit.

## The model

Every cut shot costs one render, one storyboard cell, one panel read and one take check. So:

```
machine time = fixed part + (minutes per shot × shots)
```

- The studio's runner already carries a per-step budget. The model splits it into steps that **scale per shot** (storyboards, panels, takes, judges, retake ladders) and steps that **do not** (plan, places, voice lines, timeline, edit, QC, delivery).
- The per-shot part is priced on **one clean run of 26 shots** (*The War of the Worlds*, episode 25).
- A **retake margin** is added from measured render times: a render is about 110 s, and about a quarter of takes are retaken twice.
- The result is **about 7.65 machine minutes per shot** on top of roughly two fixed hours.

## The check

| | Shots | Projected | Measured |
|---|---|---|---|
| *Jekyll & Hyde*, episode 1 | 23 | 5.0 h | 4.99 h |

Different book, different look, different shot grammar from the run it was priced on. It agreed to within about a minute.

## What the studio did with it

It set a cap, not a forecast. 30 shots would project 5.91 h, which fits the 6 h limit with about five minutes to spare. The cap is **28 shots (5.65 h)**, because:

1. one agreement says nothing about the spread, and
2. the downstream reserve is still priced on ~26-shot runs.

The plan gate refuses a 29-shot plan before anything is drawn. The cap is to be re-priced after the first episodes made under the new grammar.

## Why publish an n = 1 result

Because the number travels without its n. "The model predicted 5.0 h and it took 4.99 h" sounds like validation. It is one data point that happened to land. Stating n, and acting on it conservatively, is the actual result.

## Reproduce

The model is about 40 lines in the studio repository (`studio/episode_capacity.py`), with the shares in `studio/run_budget.py`.
