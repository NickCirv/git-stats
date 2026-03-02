#!/usr/bin/env node
import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ─── Terminal colours & styles ────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m',
  bold:  '\x1b[1m',
  dim:   '\x1b[2m',
  cyan:  '\x1b[36m',
  green: '\x1b[32m',
  yellow:'\x1b[33m',
  blue:  '\x1b[34m',
  magenta:'\x1b[35m',
  red:   '\x1b[31m',
  white: '\x1b[37m',
  gray:  '\x1b[90m',
  bgGreen:'\x1b[42m',
};

const bold   = s => `${C.bold}${s}${C.reset}`;
const cyan   = s => `${C.cyan}${s}${C.reset}`;
const green  = s => `${C.green}${s}${C.reset}`;
const yellow = s => `${C.yellow}${s}${C.reset}`;
const blue   = s => `${C.blue}${s}${C.reset}`;
const magenta= s => `${C.magenta}${s}${C.reset}`;
const gray   = s => `${C.gray}${s}${C.reset}`;
const dim    = s => `${C.dim}${s}${C.reset}`;

// ─── Heatmap characters ───────────────────────────────────────────────────────
const HEAT = ['░', '▒', '▓', '█'];
function heatChar(n) {
  if (n === 0) return gray(HEAT[0]);
  if (n <= 2)  return dim(HEAT[1]);
  if (n <= 5)  return yellow(HEAT[2]);
  return green(HEAT[3]);
}

// ─── Git helpers ──────────────────────────────────────────────────────────────
function git(...args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['pipe','pipe','pipe'] }).trim();
  } catch {
    return '';
  }
}

function isGitRepo() {
  const out = git('rev-parse', '--is-inside-work-tree');
  return out === 'true';
}

// ─── Argument parsing ─────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    year:   new Date().getFullYear(),
    author: null,
    since:  null,
    heatmap: false,
    streaks: false,
    team:    false,
    help:    false,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--heatmap') opts.heatmap = true;
    else if (a === '--streaks') opts.streaks = true;
    else if (a === '--team')    opts.team = true;
    else if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--year'   && args[i+1]) opts.year   = parseInt(args[++i], 10);
    else if (a === '--author' && args[i+1]) opts.author = args[++i];
    else if (a === '--since'  && args[i+1]) opts.since  = args[++i];
  }
  return opts;
}

// ─── Fetch all commits ────────────────────────────────────────────────────────
function fetchCommits(opts) {
  const gitArgs = ['log', '--pretty=format:%H|%ae|%an|%aI|%s', '--no-merges'];

  if (opts.since) {
    gitArgs.push(`--since=${opts.since}`);
  } else {
    gitArgs.push(`--after=${opts.year - 1}-12-31`, `--before=${opts.year + 1}-01-01`);
  }

  if (opts.author) gitArgs.push(`--author=${opts.author}`);

  const raw = git(...gitArgs);
  if (!raw) return [];

  return raw.split('\n').filter(Boolean).map(line => {
    const [hash, email, name, iso, ...msgParts] = line.split('|');
    const date = new Date(iso);
    return { hash, email, name, date, msg: msgParts.join('|') };
  });
}

// ─── Build day→count map ──────────────────────────────────────────────────────
function buildDayMap(commits) {
  const map = {};
  for (const c of commits) {
    const key = c.date.toISOString().slice(0, 10);
    map[key] = (map[key] || 0) + 1;
  }
  return map;
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['M','T','W','T','F','S','S'];

function renderHeatmap(dayMap, year) {
  const start = new Date(`${year}-01-01`);
  // align to Monday
  const dow = (start.getDay() + 6) % 7; // 0=Mon
  const grid = Array.from({ length: 7 }, () => []);
  let cur = new Date(start);
  cur.setDate(cur.getDate() - dow);

  const end = new Date(`${year}-12-31`);
  while (cur <= end) {
    for (let d = 0; d < 7; d++) {
      const key = cur.toISOString().slice(0, 10);
      const inYear = cur.getFullYear() === year;
      grid[d].push(inYear ? (dayMap[key] || 0) : -1);
      cur.setDate(cur.getDate() + 1);
    }
  }
  // Ensure all rows same length
  const cols = grid[0].length;

  // Month labels
  const monthLine = [];
  let colDate = new Date(`${year}-01-01`);
  colDate.setDate(colDate.getDate() - dow);
  for (let c = 0; c < cols; c++) {
    const d = new Date(colDate);
    d.setDate(d.getDate() + c * 7);
    if (d.getFullYear() === year && d.getDate() <= 7 && d.getDay() === 1) {
      const label = MONTHS[d.getMonth()];
      monthLine.push({ col: c, label });
    }
  }

  // Build month header row
  let header = '     ';
  let pos = 0;
  for (const { col, label } of monthLine) {
    const gap = col - pos;
    header += ' '.repeat(Math.max(0, gap));
    header += cyan(label);
    pos = col + label.length;
  }

  const lines = [header];
  for (let d = 0; d < 7; d++) {
    let row = ` ${gray(DAYS[d])}  `;
    for (let c = 0; c < cols; c++) {
      const v = grid[d][c];
      row += v === -1 ? ' ' : heatChar(v);
    }
    lines.push(row);
  }

  // legend
  lines.push('');
  lines.push(`  ${gray('Less')} ${gray(HEAT[0])}${dim(HEAT[1])}${yellow(HEAT[2])}${green(HEAT[3])} ${gray('More')}`);
  return lines.join('\n');
}

// ─── Streaks ──────────────────────────────────────────────────────────────────
function calcStreaks(dayMap, year) {
  const yearKeys = Object.keys(dayMap)
    .filter(k => k.startsWith(String(year)))
    .sort();

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  let cur = 0, longest = 0, longestStart = null, longestEnd = null;
  let tempStart = null, tempLen = 0;

  // Walk every day of year
  const startDate = new Date(`${year}-01-01`);
  const endDate   = new Date(`${year}-12-31`);
  let d = new Date(startDate);
  while (d <= endDate && d <= today) {
    const k = d.toISOString().slice(0, 10);
    if (dayMap[k]) {
      if (!tempStart) tempStart = k;
      tempLen++;
      if (tempLen > longest) {
        longest = tempLen;
        longestStart = tempStart;
        longestEnd = k;
      }
    } else {
      tempStart = null;
      tempLen = 0;
    }
    d.setDate(d.getDate() + 1);
  }

  // Current streak: count back from today
  let cd = new Date(today);
  let curLen = 0;
  while (true) {
    const k = cd.toISOString().slice(0, 10);
    if (dayMap[k]) {
      curLen++;
      cd.setDate(cd.getDate() - 1);
    } else break;
  }

  const active = yearKeys.length;
  const total  = commits => commits; // passed in separately

  return { current: curLen, longest, longestStart, longestEnd, active };
}

// ─── Productivity patterns ────────────────────────────────────────────────────
function calcProductivity(commits) {
  const hours   = Array(24).fill(0);
  const weekdays= Array(7).fill(0);
  const months  = Array(12).fill(0);

  for (const c of commits) {
    hours[c.date.getHours()]++;
    weekdays[(c.date.getDay() + 6) % 7]++;
    months[c.date.getMonth()]++;
  }

  const peakHour    = hours.indexOf(Math.max(...hours));
  const peakWeekday = weekdays.indexOf(Math.max(...weekdays));
  const peakMonth   = months.indexOf(Math.max(...months));

  const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const activeDays = new Set(commits.map(c => c.date.toISOString().slice(0, 10))).size;
  const avg = activeDays ? (commits.length / activeDays).toFixed(1) : 0;

  return {
    peakHour,
    peakHourLabel: `${peakHour}:00 – ${peakHour + 1}:00`,
    peakDay: DAY_NAMES[peakWeekday],
    peakMonth: MONTH_NAMES[peakMonth],
    peakMonthCount: Math.max(...months),
    avg,
  };
}

// ─── Language breakdown ───────────────────────────────────────────────────────
const EXT_TO_LANG = {
  js: 'JavaScript', mjs: 'JavaScript', cjs: 'JavaScript',
  ts: 'TypeScript', tsx: 'TypeScript',
  jsx: 'React/JSX',
  py: 'Python',
  rb: 'Ruby',
  php: 'PHP',
  go: 'Go',
  rs: 'Rust',
  java: 'Java',
  kt: 'Kotlin',
  swift: 'Swift',
  cs: 'C#',
  cpp: 'C++', cc: 'C++', cxx: 'C++',
  c: 'C', h: 'C',
  css: 'CSS', scss: 'CSS', sass: 'CSS', less: 'CSS',
  html: 'HTML', htm: 'HTML',
  vue: 'Vue',
  svelte: 'Svelte',
  sh: 'Shell', bash: 'Shell', zsh: 'Shell',
  md: 'Markdown', mdx: 'Markdown',
  json: 'JSON',
  yaml: 'YAML', yml: 'YAML',
  sql: 'SQL',
  tf: 'Terraform',
  dart: 'Dart',
  ex: 'Elixir', exs: 'Elixir',
};

function calcLanguages(commits) {
  if (!commits.length) return [];

  const hashes = commits.map(c => c.hash);
  // Get numstat for last N commits (cap at 200 for performance)
  const sample = hashes.slice(0, 200);

  const langLines = {};
  for (const hash of sample) {
    const ns = git('show', '--numstat', '--format=', hash);
    if (!ns) continue;
    for (const line of ns.split('\n').filter(Boolean)) {
      const parts = line.split('\t');
      if (parts.length < 3) continue;
      const [added, , file] = parts;
      const ext = file.split('.').pop().toLowerCase();
      const lang = EXT_TO_LANG[ext];
      if (!lang) continue;
      const n = parseInt(added, 10);
      if (!isNaN(n)) langLines[lang] = (langLines[lang] || 0) + n;
    }
  }

  const total = Object.values(langLines).reduce((a, b) => a + b, 0);
  if (!total) return [];

  return Object.entries(langLines)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([lang, lines]) => ({ lang, lines, pct: Math.round((lines / total) * 100) }));
}

// ─── Contributor leaderboard ──────────────────────────────────────────────────
function calcContributors(commits) {
  const map = {};
  for (const c of commits) {
    const k = c.email || c.name;
    if (!map[k]) map[k] = { name: c.name, email: c.email, commits: 0, files: new Set() };
    map[k].commits++;
  }

  // Get lines added per contributor (sample up to 100 commits per author)
  for (const k of Object.keys(map)) {
    const authorCommits = commits.filter(c => (c.email || c.name) === k).slice(0, 50);
    let added = 0;
    let files = new Set();
    for (const c of authorCommits) {
      const ns = git('show', '--numstat', '--format=', c.hash);
      for (const line of (ns || '').split('\n').filter(Boolean)) {
        const parts = line.split('\t');
        if (parts.length < 3) continue;
        const n = parseInt(parts[0], 10);
        if (!isNaN(n)) added += n;
        files.add(parts[2]);
      }
    }
    map[k].linesAdded = added;
    map[k].files = files.size;
  }

  return Object.values(map)
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 5);
}

// ─── Commit message analysis ──────────────────────────────────────────────────
const CONVENTIONAL_RE = /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\(.+?\))?!?:/i;

function calcMessages(commits) {
  const msgs = commits.map(c => c.msg).filter(Boolean);
  if (!msgs.length) return null;

  const avgLen = Math.round(msgs.reduce((a, m) => a + m.length, 0) / msgs.length);
  const conventional = msgs.filter(m => CONVENTIONAL_RE.test(m)).length;
  const conventionalPct = Math.round((conventional / msgs.length) * 100);

  const prefixCounts = {};
  for (const m of msgs) {
    const match = m.match(/^([a-z]+)[\(:!]/i);
    if (match) {
      const p = match[1].toLowerCase();
      prefixCounts[p] = (prefixCounts[p] || 0) + 1;
    }
  }

  const topPrefixes = Object.entries(prefixCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([p, n]) => ({ prefix: p, pct: Math.round((n / msgs.length) * 100) }));

  return { total: msgs.length, avgLen, conventionalPct, topPrefixes };
}

// ─── Bar chart helpers ────────────────────────────────────────────────────────
function bar(pct, width = 20) {
  const filled = Math.round((pct / 100) * width);
  return green('█'.repeat(filled)) + gray('░'.repeat(width - filled));
}

function barScale(val, max, width = 20) {
  const filled = max ? Math.round((val / max) * width) : 0;
  return cyan('█'.repeat(filled)) + gray('░'.repeat(width - filled));
}

function pad(s, n, right = false) {
  const str = String(s);
  return right ? str.padStart(n) : str.padEnd(n);
}

// ─── Section renderers ────────────────────────────────────────────────────────
function renderHeatmapSection(dayMap, opts) {
  const year = opts.since ? 'Custom Range' : opts.year;
  console.log(bold(cyan(`\nContribution Heatmap (${year}):`)));
  console.log(renderHeatmap(dayMap, opts.year));
}

function renderStreaksSection(commits, dayMap, opts) {
  const streaks = calcStreaks(dayMap, opts.year);
  const activeDays = Object.keys(dayMap).filter(k => k.startsWith(String(opts.year))).length;
  const daysInYear = opts.year % 4 === 0 ? 366 : 365;
  const pct = Math.round((activeDays / daysInYear) * 100);

  console.log(bold('\n🔥 Streaks:'));
  console.log(`  Current:  ${bold(green(streaks.current + ' days'))}${streaks.current >= 7 ? '  🔥' : ''}`);
  if (streaks.longestStart) {
    const s = new Date(streaks.longestStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const e = new Date(streaks.longestEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    console.log(`  Longest:  ${bold(green(streaks.longest + ' days'))}  ${gray(`(${s} – ${e})`)}`);
  } else {
    console.log(`  Longest:  ${bold(green(streaks.longest + ' days'))}`);
  }
  console.log(`  Active:   ${bold(activeDays + '/' + daysInYear)} days ${gray(`(${pct}%)`)}`);
}

function renderProductivitySection(commits) {
  const p = calcProductivity(commits);
  console.log(bold('\n⏰ Productivity:'));
  console.log(`  Peak hour:  ${bold(yellow(p.peakHourLabel))}`);
  console.log(`  Peak day:   ${bold(yellow(p.peakDay))}`);
  console.log(`  Best month: ${bold(yellow(p.peakMonth))} ${gray(`(${p.peakMonthCount} commits)`)}`);
  console.log(`  Avg/day:    ${bold(yellow(p.avg + ' commits'))}`);
}

function renderMessagesSection(msgs) {
  if (!msgs) return;
  console.log(bold('\n💬 Commit Quality:'));
  const cc = msgs.conventionalPct >= 50 ? green(msgs.conventionalPct + '%') : yellow(msgs.conventionalPct + '%');
  const ccIcon = msgs.conventionalPct >= 50 ? '✅' : '⚠️';
  console.log(`  Total: ${bold(msgs.total)} | Avg length: ${bold(msgs.avgLen)} chars`);
  console.log(`  Conventional: ${cc} ${ccIcon}`);
  if (msgs.topPrefixes.length) {
    const parts = msgs.topPrefixes.map(({ prefix, pct }) => `${cyan(prefix)}(${pct}%)`).join('  ');
    console.log(`  Prefixes: ${parts}`);
  }
}

function renderLanguagesSection(langs) {
  if (!langs.length) return;
  console.log(bold('\n📁 Languages (by diff lines):'));
  const maxName = Math.max(...langs.map(l => l.lang.length), 10);
  for (const { lang, pct } of langs) {
    const b = bar(pct);
    console.log(`  ${pad(lang, maxName)}  ${b}  ${pad(pct + '%', 4, true)}`);
  }
}

function renderContributorsSection(contributors) {
  if (!contributors.length) return;
  const maxCommits = contributors[0].commits;
  console.log(bold('\n👥 Top Contributors:'));
  contributors.forEach((c, i) => {
    const b = barScale(c.commits, maxCommits);
    const label = (c.email || c.name).slice(0, 30);
    console.log(`  ${i + 1}. ${pad(label, 32)} ${bold(pad(c.commits, 5, true))} commits  ${b}`);
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function showHelp() {
  console.log(`
${bold(cyan('git-stats'))} — Beautiful git contribution statistics

${bold('Usage:')}
  git-stats [options]

${bold('Options:')}
  --year <year>         Stats for a specific year (default: current year)
  --author <email>      Filter by author email
  --since <date>        Custom date range, e.g. "6 months ago"
  --heatmap             Show contribution heatmap only
  --streaks             Show streak information only
  --team                Show contributor leaderboard
  --help, -h            Show this help

${bold('Examples:')}
  npx git-stats
  npx git-stats --year 2025
  npx git-stats --author nick@example.com
  npx git-stats --since "3 months ago"
  npx git-stats --heatmap
  npx git-stats --team
`);
}

function main() {
  const opts = parseArgs(process.argv);

  if (opts.help) {
    showHelp();
    process.exit(0);
  }

  if (!isGitRepo()) {
    console.error(`${C.red}Error:${C.reset} Not inside a git repository.`);
    process.exit(1);
  }

  const label = opts.since ? `Since ${opts.since}` : String(opts.year);
  console.log('');
  console.log(bold(cyan(`📊 Git Stats — ${label}`)));
  console.log(gray('─'.repeat(50)));

  // Fetch commits
  const commits = fetchCommits(opts);

  if (!commits.length) {
    console.log(yellow('\n  No commits found for the given filters.'));
    process.exit(0);
  }

  const dayMap = buildDayMap(commits);

  // Mode: specific section only
  if (opts.heatmap) {
    renderHeatmapSection(dayMap, opts);
    console.log('');
    return;
  }

  if (opts.streaks) {
    renderStreaksSection(commits, dayMap, opts);
    console.log('');
    return;
  }

  if (opts.team) {
    console.log(gray(`  Analysing ${commits.length} commits across contributors…`));
    const contributors = calcContributors(commits);
    renderContributorsSection(contributors);
    console.log('');
    return;
  }

  // Full dashboard
  renderHeatmapSection(dayMap, opts);
  renderStreaksSection(commits, dayMap, opts);
  renderProductivitySection(commits);

  const msgs = calcMessages(commits);
  renderMessagesSection(msgs);

  console.log(gray(`\n  Analysing languages (sampling up to 200 commits)…`));
  const langs = calcLanguages(commits);
  renderLanguagesSection(langs);

  const maxContribs = 5;
  const uniqueAuthors = new Set(commits.map(c => c.email || c.name)).size;
  if (uniqueAuthors > 1) {
    console.log(gray(`\n  Building contributor leaderboard…`));
    const contributors = calcContributors(commits);
    renderContributorsSection(contributors);
  }

  console.log('');
}

main();
