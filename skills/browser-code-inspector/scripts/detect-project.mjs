#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

/**
 * Read a JSON file when it exists and return an empty object for absent or
 * malformed files so project inspection remains diagnostic rather than fatal.
 * @param {string} filePath Absolute or working-directory-relative JSON path.
 * @returns {Record<string, unknown>} Parsed JSON object or an empty object.
 */
function readJson(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return {};
  }
}

/**
 * Read a small version/configuration file without treating a missing file as
 * an inspection failure.
 * @param {string} filePath File containing a project runtime declaration.
 * @returns {string|null} Trimmed file content, or null when unavailable.
 */
function readVersionFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const value = fs.readFileSync(filePath, 'utf8').trim();
  return value || null;
}

/**
 * Read a command version through the active shell environment. This is kept
 * best-effort because projects may use a version manager that exposes a
 * command only after the developer activates it.
 * @param {string} command Command to execute, such as npm.
 * @returns {string|null} Command-reported version, or null when unavailable.
 */
function readCommandVersion(command) {
  try {
    return execFileSync(command, ['--version'], { encoding: 'utf8' }).trim() || null;
  } catch (error) {
    return null;
  }
}

/**
 * Convert a Node version string to numeric components for conservative range
 * checks. Unsupported range syntax intentionally returns null rather than
 * claiming that an unrecognized constraint is compatible.
 * @param {string} value Version text such as v22.20.0 or 20.10.
 * @returns {[number, number, number]|null} Major/minor/patch tuple.
 */
function parseVersion(value) {
  const match = String(value || '').match(/(?:^|[^\d])(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:$|[^\d])/);
  return match ? [Number(match[1]), Number(match[2] || 0), Number(match[3] || 0)] : null;
}

/**
 * Compare two semantic version tuples.
 * @param {[number, number, number]} left Version tuple.
 * @param {[number, number, number]} right Version tuple.
 * @returns {number} Negative, zero, or positive according to ordering.
 */
function compareVersions(left, right) {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
}

/**
 * Check common Node engine expressions without adding a runtime dependency to
 * this diagnostic script. Unknown syntax is reported as unknown.
 * @param {string} currentVersion Current Node version.
 * @param {string} constraint package.json/manager constraint.
 * @returns {'match'|'mismatch'|'unknown'} Conservative compatibility result.
 */
function assessNodeConstraint(currentVersion, constraint) {
  const current = parseVersion(currentVersion);
  if (!current || !constraint) return 'unknown';

  const alternatives = constraint.split('||').map((part) => part.trim()).filter(Boolean);
  if (!alternatives.length) return 'unknown';

  let sawUnknown = false;
  for (const alternative of alternatives) {
    const tokens = alternative.split(/\s+/).filter(Boolean);
    let alternativeMatches = true;
    for (const token of tokens) {
      if (/^(?:\*|x|X|latest)$/i.test(token)) continue;
      const operatorMatch = token.match(/^(>=|<=|>|<|=|\^|~)?\s*(\d+(?:\.\d+)?(?:\.\d+)?)$/);
      if (!operatorMatch) {
        sawUnknown = true;
        alternativeMatches = false;
        break;
      }
      const base = parseVersion(operatorMatch[2]);
      if (!base) {
        sawUnknown = true;
        alternativeMatches = false;
        break;
      }
      const operator = operatorMatch[1] || '';
      let comparison = compareVersions(current, base);
      if (operator === '>=') alternativeMatches = alternativeMatches && comparison >= 0;
      else if (operator === '>') alternativeMatches = alternativeMatches && comparison > 0;
      else if (operator === '<=') alternativeMatches = alternativeMatches && comparison <= 0;
      else if (operator === '<') alternativeMatches = alternativeMatches && comparison < 0;
      else if (operator === '=' || operator === '') {
        const componentCount = operatorMatch[2].split('.').length;
        if (componentCount === 1) alternativeMatches = alternativeMatches && current[0] === base[0];
        else if (componentCount === 2) alternativeMatches = alternativeMatches && current[0] === base[0] && current[1] === base[1];
        else alternativeMatches = alternativeMatches && comparison === 0;
      } else if (operator === '^') {
        const upper = [base[0] + 1, 0, 0];
        alternativeMatches = alternativeMatches && comparison >= 0 && compareVersions(current, upper) < 0;
      } else if (operator === '~') {
        const upper = [base[0], base[1] + 1, 0];
        alternativeMatches = alternativeMatches && comparison >= 0 && compareVersions(current, upper) < 0;
      }
      if (!alternativeMatches) break;
    }
    if (alternativeMatches) return 'match';
  }
  return sawUnknown ? 'unknown' : 'mismatch';
}

/**
 * Collect project Node declarations and compare the active runtime with the
 * strongest local declaration available.
 * @param {string} projectDir Project directory to inspect.
 * @param {Record<string, unknown>} packageJson Parsed package.json contents.
 * @returns {{current: string, npm: string|null, sources: Array<{source: string, value: string}>, effective: {source: string, value: string}|null, status: string, warning: string|null}}
 */
function detectNodeRuntime(projectDir, packageJson) {
  const sources = [];
  const nvmrc = readVersionFile(path.join(projectDir, '.nvmrc'));
  const nodeVersion = readVersionFile(path.join(projectDir, '.node-version'));
  if (nvmrc) sources.push({ source: '.nvmrc', value: nvmrc });
  if (nodeVersion) sources.push({ source: '.node-version', value: nodeVersion });
  if (packageJson.volta && typeof packageJson.volta === 'object' && packageJson.volta.node) {
    sources.push({ source: 'package.json#volta.node', value: String(packageJson.volta.node) });
  }
  if (packageJson.engines && typeof packageJson.engines === 'object' && packageJson.engines.node) {
    sources.push({ source: 'package.json#engines.node', value: String(packageJson.engines.node) });
  }

  const effective = sources[0] || null;
  const status = effective ? assessNodeConstraint(process.versions.node, effective.value) : 'unknown';
  const hasOnlyMinimum = effective && /^\s*>=\s*\d/.test(effective.value) && !effective.value.includes('<');
  const warning = status === 'mismatch'
    ? `Current Node ${process.versions.node} does not satisfy ${effective.source}: ${effective.value}`
    : status === 'unknown'
      ? 'Node version declaration is missing or uses unsupported range syntax; verify it before installing.'
      : hasOnlyMinimum
        ? `${effective.source} only declares a minimum Node version; dependency support for the current version is not guaranteed.`
        : sources.length > 1 && sources.some((source) => source.value !== effective.value)
          ? 'Multiple Node declarations differ; use the project-specific version manager configuration before installing.'
          : null;

  return {
    current: process.versions.node,
    npm: readCommandVersion('npm'),
    sources,
    effective,
    status,
    warning,
  };
}

/**
 * Detect the package manager, framework, bundler, and likely config file from a
 * project directory without installing dependencies or changing files.
 * @param {string} projectDir Project directory to inspect.
 * @returns {{projectDir: string, packageManager: string, framework: string, bundler: string, configFiles: string[], nodeRuntime: object}}
 */
function detectProject(projectDir) {
  const packageJson = readJson(path.join(projectDir, 'package.json'));
  const dependencies = Object.assign({}, packageJson.dependencies, packageJson.devDependencies);
  const has = (name) => Object.prototype.hasOwnProperty.call(dependencies, name);
  const packageManager = fs.existsSync(path.join(projectDir, 'pnpm-lock.yaml'))
    ? 'pnpm'
    : fs.existsSync(path.join(projectDir, 'yarn.lock'))
      ? 'yarn'
      : fs.existsSync(path.join(projectDir, 'package-lock.json'))
        ? 'npm'
        : 'unknown';
  const framework = has('vue') || has('@vue/cli-service')
    ? 'vue'
    : has('react') || has('next')
      ? 'react'
      : has('svelte')
        ? 'svelte'
        : 'unknown';
  const bundler = has('@vue/cli-service')
    ? 'webpack/vue-cli'
    : has('vite')
      ? 'vite'
      : has('webpack')
        ? 'webpack'
        : 'unknown';
  const configFiles = [
    'vue.config.js',
    'vite.config.js',
    'vite.config.ts',
    'webpack.config.js',
    'webpack.config.ts',
    'next.config.js',
    'next.config.mjs',
    'next.config.ts',
  ].filter((fileName) => fs.existsSync(path.join(projectDir, fileName)));

  return {
    projectDir,
    packageManager,
    framework,
    bundler,
    configFiles,
    nodeRuntime: detectNodeRuntime(projectDir, packageJson),
  };
}

const projectDir = path.resolve(process.argv[2] || process.cwd());
console.log(JSON.stringify(detectProject(projectDir), null, 2));
