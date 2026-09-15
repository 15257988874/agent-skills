# Cursor Launch Troubleshooting

The normal path is for `code-inspector-plugin` to launch the editor itself. Use
this reference when the overlay reports a valid source file and position, but
Cursor does not open, or opens after a delay of about a second or more.

Plugin option changes require restarting the development server. Overlay
without a restart still uses the previous `launchType`.

## Overlay Works but Cursor Is Slow

Default `launchType: 'exec'` launches the Cursor.app binary or `cursor -g`.
That path is slow. On macOS set:

```js
codeInspectorPlugin({
  bundler: 'webpack', // or 'vite'
  editor: 'cursor',
  openIn: 'reuse',
  launchType: 'open',
})
```

`launchType: 'open'` runs `open cursor://file{absolutePath}:{line}:{column}`.
Do not "fix" slowness by calling `cursor -g` or `open -a Cursor`; those are
still the slow exec path. `launchType: 'open'` is macOS-only.

If the overlay fires multiple identical requests to `http://localhost:5678`,
each exec stacks. Switching to `open` makes each request cheap.

## Overlay Works but Cursor Never Opens

```bash
command -v cursor
cursor --version
```

On macOS, install the CLI from the Command Palette:
`Shell Command: Install 'cursor' command in PATH`.

Then confirm the plugin has `editor: 'cursor'`. A tracked `EDITOR=code` can
steer auto-detect toward VS Code if the plugin `editor` option is missing.

## Manual Bridge

Use the script only when a trusted `file`, `line`, and `column` are already
known and the editor still does not open:

Resolve `scripts/open-cursor-location.sh` relative to this skill folder
(whether it is `skills/browser-code-inspector` in the collection repo or a
local agent install such as `~/.codex/skills/browser-code-inspector`):

```bash
./scripts/open-cursor-location.sh \
  src/components/Example.vue 42 8 /absolute/path/to/project
```

The script validates the file and positive line/column values before invoking
Cursor. Never pass a path copied from an untrusted page without first checking
that it belongs to the local workspace.

## Common Causes

- macOS left on default `launchType: 'exec'` (slow, not a missing CLI).
- Plugin options changed without restarting the dev server.
- Cursor's CLI is not on `PATH` (needed for exec fallback, not for `open`).
- The dev server is running from a different checkout than the Cursor window.
- The reported source path is a generated bundle path rather than a local file.
- The browser page is a production build without code-inspector metadata.
- The plugin was registered twice or registered in a server-only build branch.
