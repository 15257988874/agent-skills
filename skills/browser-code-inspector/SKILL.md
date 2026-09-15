---
name: browser-code-inspector
description: >-
  Use when setting up or troubleshooting code-inspector-plugin click-to-source
  in a development browser, Option+Shift or Alt+Shift overlay, Cursor not
  opening, Cursor opening slowly after click, Vue CLI or Vite plugin
  registration, or Cannot find module sass/node-sass after installing the
  plugin. Do not use for ordinary browser automation or inspecting an element
  from text, selector, or screenshot alone.
metadata:
  short-description: Click a browser element to open its source in Cursor
---

# Browser Code Inspector

Provide the `code-inspector-plugin` interaction: the user selects an element in
the visible browser, and the development runtime opens the corresponding local
component in Cursor. This is a setup and troubleshooting skill, not a resident
browser listener. The browser overlay and IDE launch are performed by the
configured build plugin.

## Required Interaction Model

- Do not ask the user to paste an element, selector, screenshot, or error when
  the requested workflow is click-to-source.
- Configure the project first. Then tell the user to use the browser overlay:
  hold `Option + Shift` on macOS or `Alt + Shift` on Windows, hover the target,
  and click once.
- Treat an exact file, line, and column as available only when the development
  build exposes code-inspector metadata. A production DOM without that metadata
  cannot reliably provide the original component location.
- Keep the plugin development-only. Do not add it to production bundles or
  claim that it works after a production build unless the project explicitly
  preserves the required metadata.

## Setup Workflow

1. Inspect `package.json`, the package manager lockfile, and the build config.
   Use [scripts/detect-project.mjs](scripts/detect-project.mjs) when a compact
   framework/bundler summary is useful.
2. Check the project Node runtime before installing anything. Inspect
   `.nvmrc`, `.node-version`, `package.json#volta.node`, and
   `package.json#engines.node`, then compare them with `node --version` and
   `npm --version`. If the runtime is outside the declared range or declarations
   conflict, stop and ask the user to activate the project's existing version
   manager configuration first. A minimum-only declaration such as `>=8.9` is
   not proof that a legacy Vue CLI/Webpack dependency tree supports the current
   Node version.
3. Choose the package manager from the existing lockfile. Add
   `code-inspector-plugin` as a development dependency. After install, confirm
   packages already declared in `package.json` still resolve. If `sass-loader`
   fails with `Cannot find module 'node-sass'`, restore declared `sass`; do not
   install `node-sass` unless the project already used it.
4. Read [references/code-inspector-plugin.md](references/code-inspector-plugin.md)
   and add exactly one Cursor-targeted registration for the detected bundler.
   On macOS that includes `launchType: 'open'`. Do not leave macOS on default
   `exec`.
5. Set `CODE_EDITOR=cursor` in uncommitted `.env.local`. A tracked
   `EDITOR=code` does not replace `editor: 'cursor'`.
6. Start the existing development workflow. Plugin option changes require a
   full restart. Do not run a build or type check unless the user requests it.
7. Tell the user only the browser action. Cursor should open the local file
   quickly at the reported source position.

Do not automatically install, upgrade, downgrade, or switch Node. Do not create
or modify `.nvmrc`, `.node-version`, Volta settings, or other runtime manager
files unless the user explicitly asks for that change. When a switch is needed,
show the command appropriate to the detected project, such as `nvm use` or
`fnm use`, and wait for the project to be run under that environment.

## Current Project Pattern

For a Vue CLI/Webpack project, use the `chainWebpack` registration documented in
the reference. Preserve existing `vue.config.js` plugins and avoid duplicate
`code-inspector-plugin` registrations. For Vite, add the plugin to the existing
`plugins` array and preserve the current `defineConfig` shape.

## Verification

Verify the setup in this order:

1. The development page loads without a plugin initialization error.
2. Holding the platform shortcut produces the inspector overlay and source
   hint while hovering a rendered component.
3. Clicking the component opens Cursor, rather than only opening DevTools.
4. Cursor opens a local file in the current workspace within about 300ms. A
   delay of a second or more is a launch-type failure, even if the file
   eventually opens.

Before plugin installation, record the Node runtime check as `match`,
`mismatch`, or `unknown`. A `match` from a minimum-only engine declaration
still needs a compatibility warning for old dependency trees.

If the overlay appears but Cursor does not open, or opens slowly, read
[references/ide-launch.md](references/ide-launch.md). Use
[scripts/open-cursor-location.sh](scripts/open-cursor-location.sh) only when a
`file`, `line`, and `column` are known and the editor still does not open. If
the overlay does not appear, inspect the dev server bundle before searching
the DOM.

## Fallback Boundary

When the page was not built with source metadata, read
[references/fallback-source-search.md](references/fallback-source-search.md).
Search can identify a likely component, but it is not equivalent to the plugin's
exact click-to-source behavior. Report candidate files and confidence instead
of silently opening an arbitrary match.
