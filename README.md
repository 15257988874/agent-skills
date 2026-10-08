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
  feature-delivery/
    SKILL.md
    references/
    agents/
```

每个 skill 是独立目录，目录名与 `SKILL.md` 的 `name` 一致。

## 当前 Skills

| Skill | 说明 |
| --- | --- |
| [browser-code-inspector](./skills/browser-code-inspector) | 在开发环境配置 `code-inspector-plugin`：按住 Option+Shift（Windows 为 Alt+Shift）点击页面元素，Cursor 打开对应源码。macOS 使用 `launchType: 'open'`，避免默认 `exec` 导致跳转过慢。 |
| [feature-delivery](./skills/feature-delivery/SKILL.md) | 根据用户描述与多个产品原型、UI、API 文档链接，在已有项目中实现前端功能或小迭代并接入已有接口。支持 Figma／蓝湖来源，API 默认 YApi；冲突或关键业务缺口先询问用户。 |

## 安装

全局安装（本机所有项目可用）：

```bash
npx skills add 15257988874/agent-skills -g
```

按提示操作即可：

1. 选择要装的 skill（可以全选）。
2. 选择要装到的 agent。这里 **支持多选**，同时勾选 **Cursor** 和 **Codex**。

只装当前项目、不跨项目时，去掉 `-g`：

```bash
npx skills add 15257988874/agent-skills
```

只装某一个 skill：

```bash
npx skills add 15257988874/agent-skills --skill browser-code-inspector -g
```

列出仓库里的 skill：

```bash
npx skills add 15257988874/agent-skills --list
```

## Feature Delivery

适用于 Codex、Cursor、Claude Code，在**已有前端项目**中根据用户描述实现一个功能、多个功能或小迭代，并接入已有后端接口。技术栈、组件、目录和开发规范自动从目标项目识别；第一版不创建脚手架、不实现后端或数据库变更。

全局单独安装：

```bash
npx skills add 15257988874/agent-skills --skill feature-delivery -g
```

也可同时指定三个客户端：

```bash
npx skills add 15257988874/agent-skills --skill feature-delivery -g -a codex -a cursor -a claude-code
```

仓库新增内容尚未推送时，在本地仓库根目录安装：

```bash
npx skills add . --skill feature-delivery -g
```

安装后新开 Agent 会话，使用自然语言或客户端支持的 `$feature-delivery` 调用。例如：

```text
使用 feature-delivery，只给现有用户列表增加状态筛选。

产品原型：蓝湖链接 A、Figma 链接 B
UI 设计：Figma 链接 C、蓝湖链接 D
接口文档：YApi 链接 E

只实现本次描述，资料中的新增、删除、导出不在范围内。
```

多个链接与功能是多对多关系；实现范围以用户描述为准，不默认完成链接中的全部功能。功能与交互以原型为依据，样式以 UI 为依据；遇到真实冲突或关键业务缺口时暂停整个任务，说明证据并等用户答复。加载、空数据、请求失败默认沿用项目处理方式补齐。

首次在项目中使用会询问任务记录目录，并将设置保存到项目索引，后续一直沿用；每次迭代独立记录来源版本、用户决策、改动和验证结果。默认进行真实浏览器验证和接口联调，需要登录或授权时引导用户处理；用户明确选择跳过时提供未验证项与手动步骤。

**安装 Skill 不会自动安装 MCP。** 只需要配置本次使用的来源；已有可用连接直接复用，缺少连接时 Skill 会逐步引导：

- [Figma MCP：官方远程/桌面服务、三种客户端、OAuth 与读取验收](./skills/feature-delivery/references/setup-figma.md)。
- [蓝湖 MCP：社区实现、Python/Chromium、Cookie、stdio/HTTP 与读取验收](./skills/feature-delivery/references/setup-lanhu.md)。
- API 默认优先 YApi，兼容可读取的 OpenAPI/Swagger 及其他文档形式；私有文档需要相应访问权限，不强制安装一个固定的 YApi MCP。

安装文档中的地址、参数及上游脚本已按所列来源核对；实际 OAuth、各操作系统的 MCP 连接、私有资料和产品端到端联调仍需在用户环境验证。当前能力与评测边界见 [验收规范](./skills/feature-delivery/references/acceptance.md)。目标项目的命令禁令和用户要求优先；没有限制时允许运行适用的类型检查与生产构建。

## 在 Cursor 里怎么用

装好后请 **新开一条 Agent 对话**，或执行一次 `Developer: Reload Window`。不要在刚装完的旧窗口里用 `/` 验收。

`npx skills add` 会把 Cursor skill 落到 `~/.agents/skills/`。Cursor 的 `/` 菜单有时只稳扫 `~/.cursor/skills/`，所以旧窗口输入 `/` 可能一直 loading。这是 Cursor 菜单发现路径的问题，不是 skill 装坏了。

若 `/` 仍转圈，把 skill 链到 Cursor 自己的目录后再重开对话：

```bash
mkdir -p ~/.cursor/skills
ln -sfn ~/.agents/skills/browser-code-inspector \
  ~/.cursor/skills/browser-code-inspector
```

日常用法：在 Agent 里直接说要配置 code-inspector 即可，不必等 `/` 出现这个 skill。

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
