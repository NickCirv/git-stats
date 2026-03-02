# git-stats

> Beautiful git contribution statistics in your terminal. Heatmap, streaks, productivity patterns.

```bash
npx git-stats
```

```
📊 Git Stats — 2026

Heatmap: ░▒▒░▒▒░▒▒▒░▓▓▓▒▒░░▒▒▒░ ...

🔥 Current streak: 12 days
⭐ Longest streak: 34 days
📅 Active: 234/365 days

feat(42%) fix(31%) chore(17%) docs(10%)
```

## Commands

```bash
npx git-stats               # full year dashboard
npx git-stats --heatmap     # contribution heatmap only
npx git-stats --streaks     # streak information
npx git-stats --team        # contributor leaderboard
npx git-stats --year 2025   # specific year
npx git-stats --author nick@example.com   # filter by author
npx git-stats --since "6 months ago"      # custom date range
```

## Install

```bash
npx git-stats    # no install needed
npm install -g git-stats
```

---

**Zero dependencies** · **Node 18+** · Made by [NickCirv](https://github.com/NickCirv) · MIT
