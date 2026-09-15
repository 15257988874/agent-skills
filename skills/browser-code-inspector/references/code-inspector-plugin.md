# code-inspector-plugin Setup

`code-inspector-plugin` injects development-only source metadata into rendered
framework elements. The browser overlay reads that metadata and invokes the
local IDE launcher after the user clicks an element.

## Install

Use the lockfile already present in the project:

```bash
npm install --save-dev code-inspector-plugin
pnpm add -D code-inspector-plugin
yarn add -D code-inspector-plugin
```

Run only the command matching the existing package manager. Do not replace a
project's lockfile or package manager for this setup.

## Node Runtime Check

The plugin is executed by the project's Node-based development toolchain, so
check the project runtime before installing it. Inspect these sources in order:

1. `.nvmrc`
2. `.node-version`
3. `package.json#volta.node`
4. `package.json#engines.node`

Compare the selected declaration with:

```bash
node --version
npm --version
```

If a version manager file exists, activate that environment with the project's
existing tool, for example `nvm use` or `fnm use`. Do not create a new version
file or change the machine's default Node version as part of plugin setup.

An expression such as `node >=8.9` is only a minimum requirement. It does not
prove that an old Vue CLI/Webpack dependency tree works on Node 22. Report this
as a compatibility warning and preserve the project's existing runtime choice.

Do not install the plugin when the current Node version is outside an explicit
project range or when multiple project declarations conflict. Ask the user to
activate the intended project runtime first.

## Vue CLI / Webpack

Register inside the existing `chainWebpack` callback, and only in development.

On macOS:

```js
const { codeInspectorPlugin } = require('code-inspector-plugin');

module.exports = {
  chainWebpack: (config) => {
    config.when(process.env.NODE_ENV === 'development', (config) => {
      config.plugin('code-inspector-plugin').use(
        codeInspectorPlugin({
          bundler: 'webpack',
          editor: 'cursor',
          openIn: 'reuse',
          launchType: 'open',
        })
      );
    });
  },
};
```

On Windows or Linux, keep `editor: 'cursor'` and `openIn: 'reuse'`, and omit
`launchType` (`open` is macOS-only). Merge into the existing configuration.
Keep all existing aliases, loaders, dev-server settings, and plugins.

## Vite

```js
import { defineConfig } from 'vite';
import { codeInspectorPlugin } from 'code-inspector-plugin';

export default defineConfig({
  plugins: [
    codeInspectorPlugin({
      bundler: 'vite',
      editor: 'cursor',
      openIn: 'reuse',
      launchType: 'open', // macOS only; omit on Windows/Linux
    }),
  ],
});
```

Append to the existing `plugins` array; do not replace other plugins.

## Cursor Launch Options

This skill targets Cursor. Always pass `editor: 'cursor'`. Auto-detect plus
`CODE_EDITOR` in `.env.local` is not enough: default `launchType: 'exec'`
runs `/Cursor.app/Contents/MacOS/Cursor` or `cursor -g`, which is slow
(about 1.4s+ per click). On macOS, `launchType: 'open'` uses
`open cursor://file{path}:{line}:{column}` (about 200ms).

Also set uncommitted `.env.local`:

```bash
CODE_EDITOR=cursor
```

A tracked `EDITOR=code` in `.env.development` does not replace the plugin
`editor` option. Do not install `node-sass` to fix a missing dart `sass`
package after `npm install`.

## Browser Use

After restarting the development server, hold `Option + Shift` on macOS or
`Alt + Shift` on Windows. Hovering should show an inspector overlay; clicking
once should launch Cursor at the component source. The shortcut and overlay are
runtime behavior, so a static DOM inspection cannot substitute for this check.
