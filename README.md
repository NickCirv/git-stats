<div align="center">

# git-stats

**Contribution heatmap, streaks, and productivity patterns — straight from your git log**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?labelColor=0B0A09)](LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D18-green?labelColor=0B0A09)](https://nodejs.org)

</div>

## Install

```bash
npx github:NickCirv/git-stats
```

No global install needed. Run it from inside any git repository.

## Usage

```bash
npx github:NickCirv/git-stats                         # full dashboard (heatmap + streaks + productivity + languages)
npx github:NickCirv/git-stats --heatmap               # contribution heatmap only
npx github:NickCirv/git-stats --streaks               # streak info only
npx github:NickCirv/git-stats --team                  # contributor leaderboard
```

| Flag | Description |
|------|-------------|
| `--year <year>` | Stats for a specific year (default: current year) |
| `--author <email>` | Filter commits by author email |
| `--since <date>` | Custom range, e.g. `"6 months ago"` |
| `--heatmap` | Heatmap only |
| `--streaks` | Streaks only |
| `--team` | Contributor leaderboard |
| `--help` | Show help |

## What it does

Reads your local git log and renders a colour-coded GitHub-style heatmap, current and longest commit streaks, peak-hour and peak-day productivity patterns, language breakdown by diff lines (from `git show --numstat`), commit-message quality (conventional commit %) and a contributor leaderboard — all in one terminal dashboard. Works on any git repo; no API keys, no network calls.

---
<sub>Zero dependencies · Node 18+ · MIT · by <a href="https://github.com/NickCirv">NickCirv</a></sub>
