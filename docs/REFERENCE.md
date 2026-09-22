# git-stats — command reference

[Overview](../README.md) · [Research record](RESEARCH.md)

Describes revision `4f9397d6afded4ea0eaf9d5e9087b66b82e8140e`. Commands are source-inspected; no execution results are asserted.

## Workflow

Summarizes commits by day, streak, time, contributor, message and file extension, with year/author/date filters. --team and --streaks select narrower views.

Requires Git and a local repository with the relevant history. Commands are source-inspected, not executed in this review.

```bash
node index.js --heatmap
```

## Commands and controls

| Control | Behavior in the inspected implementation |
| --- | --- |
| `--year YEAR` | Select a calendar year |
| `--author TEXT` | Filter an author |
| `--heatmap` | Show the calendar only |
| `--streaks` | Show streak calculations |
| `--team` | Show contributor statistics |

## Interpretation and side effects

The language view is based on changed-file extensions rather than a complete source-language census. Commit timing and counts are not a measure of productivity or health.

## Implementation reference

- [package.json](https://github.com/NickCirv/git-stats/blob/4f9397d6afded4ea0eaf9d5e9087b66b82e8140e/package.json)
- [index.js](https://github.com/NickCirv/git-stats/blob/4f9397d6afded4ea0eaf9d5e9087b66b82e8140e/index.js)
- [test/smoke.test.js](https://github.com/NickCirv/git-stats/blob/4f9397d6afded4ea0eaf9d5e9087b66b82e8140e/test/smoke.test.js)
