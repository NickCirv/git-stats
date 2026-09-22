# git-stats — research record

## Revision and scope

- Repository: [NickCirv/git-stats](https://github.com/NickCirv/git-stats)
- Commit: `4f9397d6afded4ea0eaf9d5e9087b66b82e8140e`
- Tree: `e058fc4c54bac85f9a9616160edf8064397b9e33`
- Captured: 6 of 6 eligible text files (all eligible text files).
- Recursive tree truncated: `False`.
- Runtime verification: **unverified**; no repository code, installation or test command was executed.

The captured file inventory is broader than the semantic review. Authoring inspected package metadata, entrypoint/argument handling and implementation paths relevant to the claims below, plus test declarations. This is documentation research, not a line-by-line security audit. Generated/binary artifacts, lockfiles and file types outside the acquisition filter were not inspected.

## Claim and evidence

| Claim | Pinned evidence | Status |
| --- | --- | --- |
| Runtime requirement and executable mapping | [package.json](https://github.com/NickCirv/git-stats/blob/4f9397d6afded4ea0eaf9d5e9087b66b82e8140e/package.json) | verified in manifest; installation unverified |
| Render a local Git activity dashboard and contribution heatmap. | [implementation](https://github.com/NickCirv/git-stats/blob/4f9397d6afded4ea0eaf9d5e9087b66b82e8140e/index.js) | partially verified by static implementation review |
| Operational limits and side effects | [implementation](https://github.com/NickCirv/git-stats/blob/4f9397d6afded4ea0eaf9d5e9087b66b82e8140e/index.js) and source map in [reference](REFERENCE.md) | partially verified; runtime unverified |
| Test command definition | [package.json](https://github.com/NickCirv/git-stats/blob/4f9397d6afded4ea0eaf9d5e9087b66b82e8140e/package.json) | verified as a declaration only |

## Findings carried into the rewrite

The language view is based on changed-file extensions rather than a complete source-language census. Commit timing and counts are not a measure of productivity or health.

No runtime checks were executed for this documentation review. The committed smoke test checks entrypoint JavaScript syntax; it does not exercise the command behavior.

## Documentation inventory and disposition

| Existing document | Disposition |
| --- | --- |
| [README.md](https://github.com/NickCirv/git-stats/blob/4f9397d6afded4ea0eaf9d5e9087b66b82e8140e/README.md) | Rewritten overview; historical copy remains at this pinned URL. |

New supporting documents: `docs/REFERENCE.md` and `docs/RESEARCH.md`. No original source or protected legal/security file was changed.

## Protected-file evidence

- `LICENSE` SHA-256 `68729cab364d82364078b08d8580ccfa51dc69c81a7d64e8d8d47a1da6c9349d`.

## Remaining verification

Clean installation, useful-command execution, malformed input, side-effect boundaries, platform compatibility and end-to-end tests remain unverified. Package-registry availability and live API destinations were not checked. No performance, customer-adoption, compliance or production-readiness claim is made.

## Captured evidence index

- [LICENSE](https://github.com/NickCirv/git-stats/blob/4f9397d6afded4ea0eaf9d5e9087b66b82e8140e/LICENSE) · blob `05b804beeec7d1a6c933d087387ba4adf6463d93`.
- [README.md](https://github.com/NickCirv/git-stats/blob/4f9397d6afded4ea0eaf9d5e9087b66b82e8140e/README.md) · blob `1756809155c00f46acb51d3327476d1251120a92`.
- [package.json](https://github.com/NickCirv/git-stats/blob/4f9397d6afded4ea0eaf9d5e9087b66b82e8140e/package.json) · blob `89f587c72caa50031afbab6b3ff90083319121f8`.
- [.github/workflows/ci.yml](https://github.com/NickCirv/git-stats/blob/4f9397d6afded4ea0eaf9d5e9087b66b82e8140e/.github/workflows/ci.yml) · blob `44515034a394670de44454a7a1bd2c7ef0c9836e`.
- [index.js](https://github.com/NickCirv/git-stats/blob/4f9397d6afded4ea0eaf9d5e9087b66b82e8140e/index.js) · blob `f7a859c5809e326c5447aa2ec6383aa85800758c`.
- [test/smoke.test.js](https://github.com/NickCirv/git-stats/blob/4f9397d6afded4ea0eaf9d5e9087b66b82e8140e/test/smoke.test.js) · blob `ebbccaaf2583b4850575f835313e4b0afd21bff7`.

## Tree files outside the captured text set

These paths were mapped but their contents were not acquired in this research pass:

- `banner.svg`
