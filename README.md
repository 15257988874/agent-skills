# Agent Skills

面向 Cursor / Codex / Claude Code 的 Agent Skills 合集。仓库按多 skill 结构组织，可以只装其中一个，也可以一次装全部。

浏览与安装：[skills.sh/15257988874/agent-skills](https://skills.sh/15257988874/agent-skills)

## 仓库结构

```text
skills/
  browser-code-inspector/
    SKILL.md
    references/
    scripts/
    agents/
```

每个 skill 是独立目录，目录名与 `SKILL.md` 的 `name` 一致。

## 当前 Skills

| Skill | 说明 |
| --- | --- |
| [browser-code-inspector](./skills/browser-code-inspector) | 在开发环境配置 `code-inspector-plugin`：按住 Option+Shift（Windows 为 Alt+Shift）点击页面元素，Cursor 打开对应源码。macOS 使用 `launchType: 'open'`，避免默认 `exec` 导致跳转过慢。 |

## 安装

默认：装仓库里全部 skill，并写入用户目录，本机所有项目都能用。

```bash
npx skills add 15257988874/agent-skills --all -g -y
```

- `--all`：安装全部 skill
- `-g`：全局安装（跨项目）
- `-y`：跳过交互确认

只看有哪些 skill：

```bash
npx skills add 15257988874/agent-skills --list
```

只装某一个（仍然建议加 `-g`，否则只对当前项目生效）：

```bash
npx skills add 15257988874/agent-skills --skill browser-code-inspector -g -y

# 等价写法
npx skills add 15257988874/agent-skills@browser-code-inspector -g -y
```

## 本地使用

克隆后把 skill 目录软链到本机 agent 的 skills 目录，编辑仓库即可在 Cursor / Codex 里立刻生效：

```bash
git clone git@github.com:15257988874/agent-skills.git ~/agent-skills

ln -sfn ~/agent-skills/skills/browser-code-inspector \
  ~/.codex/skills/browser-code-inspector
```

`scripts/` 和 `references/` 一律用相对路径，软链安装和 `npx skills add` 安装都能解析。

## 添加新 Skill

1. 在 `skills/<skill-name>/` 下创建 `SKILL.md`（`name` 必须等于目录名）。
2. 需要时再加 `references/`、`scripts/`。
3. 更新本 README 的表格。
4. 推送后可用 `--skill <skill-name>` 单独安装。

## License

MIT
