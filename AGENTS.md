<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Shared design contract

- `src/design/brand-colors.json` is the canonical source for shared color and
  semantic runtime tokens.
- The marked token block in `src/app/globals.css` is generated. Change the
  canonical JSON, then run `npm run design:tokens:update`; never hand-edit that
  block.
- Run `npm run design:check` for fast, read-only contract validation and
  `npm run design:verify` before merging a rendered design change.
- `npm run design:visual` only compares approved screenshots.
  `npm run design:visual:update` is the sole baseline-writing command, and every
  resulting image diff requires review.
- Shared design paths and their required merge checks are owned by
  `.github/CODEOWNERS` and `agents/host/MERGE-GATES.json`.
- Gate launchers, tests, configuration, package manifests, and approved
  screenshots listed in `protected_paths` may change only in a separate
  owner-controlled policy track, never in the worker change they judge.
