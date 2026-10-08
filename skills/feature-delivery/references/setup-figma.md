# Figma MCP 安装、认证与验证

适用于 Codex、Cursor、Claude Code。仅在本次资料包含 Figma 且没有可用连接时进入安装流程。先询问或识别用户实际使用的客户端、操作系统及已有连接，按对应路径逐步引导，每步确认结果再继续，不一次要求安装全部方式。

本文命令和配置依据 Figma 官方文档于 2026-10-08 核对；CLI 参数同时核对了本机 `codex mcp add/login --help`。OAuth、不同客户端及操作系统的实际连接需要在用户环境验证，文档核对不能算安装验收。

## 推荐：官方远程服务

地址：`https://mcp.figma.com/mcp`，使用 Figma OAuth 授权，不需要 Figma 桌面应用。连接账户必须有资料访问权限；客户端兼容性、席位与额度依据当时官方说明。

### Codex 桌面端

1. 打开 Plugins，找到官方 Figma 插件并安装。已有插件先检查状态，不重复安装。
2. 按插件提示登录 Figma，并由用户在授权页选择允许访问。
3. 新开会话或按客户端提示刷新工具，确认能看到 Figma 工具。
4. 按下方“读取验收”检查真实节点。仅插件显示已安装不代表已取得文件权限。

### Codex CLI

已有 Codex CLI 时先查看 `codex mcp list` 和 `codex mcp add --help`，复用已有 Figma 配置。新配置采用：

```bash
codex mcp add figma --url https://mcp.figma.com/mcp
```

按照提示完成认证；客户端未自动触发 OAuth 时执行：

```bash
codex mcp login figma
```

由用户完成浏览器登录和授权，再新开会话检查工具。Windows、macOS、Linux 的远程 URL 相同；CLI 安装及浏览器授权按系统环境完成。桌面插件与手工 CLI 配置选择实际需要的路径，不盲目创建重复服务。

### Cursor

推荐官方 Figma 插件。在 Cursor Agent 中使用当前版本支持的插件入口：

```text
/add-plugin figma
```

手工路径：Cursor Settings → MCP/Tools & MCP → 添加全局 MCP 服务。将以下 `figma` 项合并进用户级 MCP 配置，保留其他服务：

```json
{
  "mcpServers": {
    "figma": {
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

点击连接并按浏览器提示授权。设置项名称以用户客户端版本为准。配置应在用户级位置以便跨项目使用，不写入业务仓库作为所有人的个人账户配置。

### Claude Code

官方插件方式：

```bash
claude plugin install figma@claude-plugins-official
```

手工用户级方式：

```bash
claude mcp add --scope user --transport http figma https://mcp.figma.com/mcp
```

二选一并复用已有配置。在 Claude Code 中进入 `/mcp`，选择 Figma、Authenticate，再由用户完成 Allow Access。重新检查连接和工具。安装后按客户端要求开启新会话。

## 可选：官方桌面服务

当用户需要桌面选区读取或明确选择本地模式时：

1. 安装或打开更新后的 Figma 桌面应用，登录并打开有关 Design 文件。
2. 进入 Dev Mode，在 MCP Server 区域启用 Desktop MCP Server。
3. 保持桌面应用运行，服务地址为 `http://127.0.0.1:3845/mcp`。
4. 在实际开发客户端添加 `figma-desktop`，避免与远程配置混淆。

Codex CLI：

```bash
codex mcp add figma-desktop --url http://127.0.0.1:3845/mcp
```

Cursor 用户级配置：

```json
{
  "mcpServers": {
    "figma-desktop": {
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

Claude Code：

```bash
claude mcp add --scope user --transport http figma-desktop http://127.0.0.1:3845/mcp
```

客户端和桌面服务必须能互相访问；本地 loopback 不是远端工作环境的地址。桌面应用关闭或 MCP 未启用时，先恢复服务，不反复覆盖配置。平台/席位是否提供桌面能力以官方当时条件为准。

## 读取验收

让用户提供有权限的 frame/node 链接，或在桌面应用选中目标。按工具实际能力读取设计上下文与截图，确认返回目标节点，检查布局、变量和必要素材。记录认证、工具发现、节点读取分别是否成功。

产品原型还需确认触发、连接目标、注释、业务规则和状态变化。设计上下文不保证返回全部原型交互；需要时进入实际原型或请用户补充说明。涉及 Make 时，仅在当前工具与客户端支持时读取其资源，不能假定所有 Figma 链接都支持相同能力。

## 常见问题

| 症状 | 引导 |
| --- | --- |
| 已添加但无工具 | 检查连接/认证，刷新或新开会话，查看客户端提示 |
| 无文件权限 | 用户确认账户及分享权限，授权后重新读具体节点 |
| 限流、上下文截断 | 缩小到本次功能节点，依据官方额度说明处理 |
| 桌面连接拒绝 | 检查应用、Dev Mode MCP 开关及本地地址可达性 |
| 能读画面、没有交互 | 记录缺口，读取原型或询问用户补充业务依据 |

## 官方来源

- [远程安装](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/)
- [桌面安装](https://developers.figma.com/docs/figma-mcp-server/local-server-installation/)
- [官方 MCP Guide](https://github.com/figma/mcp-server-guide)

安装步骤更新时先核对这些来源；不替换成名称相近的第三方服务，也不要求用户提供 Cookie 或将 OAuth 凭据写入 Skill。
