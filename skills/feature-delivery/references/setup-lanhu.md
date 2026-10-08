# 蓝湖 MCP 安装、认证与验证

本指南采用社区实现 [dsphper/lanhu-mcp](https://github.com/dsphper/lanhu-mcp)，不是蓝湖官方服务。于 2026-10-08 核对上游 README、启动脚本及 CLI 源码，参考提交为 `be942fd26f55aac287676f6897353555de8519ac`。下列接入路径需要在用户实际环境验证；源码核对不等同于安装或内容读取验收。

只有本次资料包含蓝湖且没有可用连接时，提醒用户并逐步引导。先确认操作系统、开发客户端、已有服务与安装目录；成功完成当前步骤后再进入下一步。已有可用服务不重装、不升级；PATH 中同名 `lanhu-mcp` 可能是用户自定义管理脚本，先查看用途，不混用上游 CLI 的参数。

## 1. 前置条件

需要 Git、Python 3.10+ 及可安装的 Playwright Chromium。先查看：

macOS/Linux：

```bash
git --version
python3 --version
```

Windows PowerShell：

```powershell
git --version
python --version
```

如果版本不满足，说明需要用户安装或启用合适 Python，不能静默切换全局运行时。安装位置由用户选择，不要求放入业务项目。

## 2. 下载与依赖

在用户选择的父目录执行；已有同名目录先核对，不覆盖。

```bash
git clone https://github.com/dsphper/lanhu-mcp.git
cd lanhu-mcp
git checkout --detach be942fd26f55aac287676f6897353555de8519ac
```

固定到核对过的提交用于复现；这是新克隆目录的示例，不要求将用户已有服务切到此提交。采用新版时重新核对启动与配置方式。

macOS/Linux：

```bash
python3 -m venv venv
./venv/bin/python -m pip install -e .
./venv/bin/python -m playwright install chromium
cp .env.example .env
```

Windows PowerShell：

```powershell
python -m venv venv
.\venv\Scripts\python.exe -m pip install -e .
.\venv\Scripts\python.exe -m playwright install chromium
Copy-Item .env.example .env
```

`.env` 已存在时保留，不能再次执行覆盖命令。使用该项目虚拟环境，避免把依赖装进业务项目。上游另有一键安装与 Docker 路径，用户选择时按该版本上游说明引导；普通前端开发请求不自动执行部署或安装。

## 3. 本地认证

引导用户登录有资料访问权限的蓝湖账户，按 [上游 Cookie 教程](https://github.com/dsphper/lanhu-mcp/blob/be942fd26f55aac287676f6897353555de8519ac/GET-COOKIE-TUTORIAL.md) 从自己浏览器请求中取得 Cookie，并在蓝湖 MCP 安装目录的 `.env` 编辑 `LANHU_COOKIE`。

只由用户在本地填写。不要让用户把 Cookie 发到聊天中，不打印 `.env` 或私密请求头，不提交到 Skill、任务记录或 Git。不是把蓝湖 Cookie 当作 MCP URL 查询参数。Cookie 失效时由用户在本地刷新，再重启/重连服务。

## 4. 选择传输方式

stdio 适合由本地客户端按需启动；HTTP 适合复用已有常驻服务。选一条满足当前环境的路径，不同时创建重复服务。示例中的安装路径必须替换成用户实际绝对路径；有空格时保留引号。

### stdio：macOS/Linux

上游 `run-stdio.sh` 使用安装目录的虚拟环境并进入该目录；该版本服务会读取本地 `.env`。

Codex CLI：

```bash
codex mcp add lanhu --env LANHU_USER_ROLE=Developer --env LANHU_USER_NAME=YourName -- /bin/bash '/path/to/lanhu-mcp/run-stdio.sh'
```

Claude Code：

```bash
claude mcp add --scope user --transport stdio lanhu -- /bin/bash '/path/to/lanhu-mcp/run-stdio.sh'
```

Cursor 用户级配置，保留已有其他服务：

```json
{
  "mcpServers": {
    "lanhu": {
      "command": "/bin/bash",
      "args": ["/path/to/lanhu-mcp/run-stdio.sh"],
      "env": {
        "LANHU_USER_ROLE": "Developer",
        "LANHU_USER_NAME": "YourName"
      }
    }
  }
}
```

### stdio：Windows

使用上游 `run-stdio.bat`，通过 `cmd /c` 启动。先按本机版本的 `mcp add --help` 核对参数。PowerShell 示例：

```powershell
codex mcp add lanhu -- cmd /c 'C:\path\to\lanhu-mcp\run-stdio.bat'
claude mcp add --scope user --transport stdio lanhu -- cmd /c 'C:\path\to\lanhu-mcp\run-stdio.bat'
```

Cursor 用户级配置：

```json
{
  "mcpServers": {
    "lanhu": {
      "command": "cmd",
      "args": ["/c", "C:\\path\\to\\lanhu-mcp\\run-stdio.bat"],
      "env": {
        "LANHU_USER_ROLE": "Developer",
        "LANHU_USER_NAME": "YourName"
      }
    }
  }
}
```

Windows 含空格路径的参数行为需在当前客户端实际启动验证；失败时检查实际命令，不改用未经验证的 shell 拼接。也可选择下方 HTTP 路径。

### HTTP：本机常驻服务

在蓝湖 MCP 安装目录启动，并保持终端运行：

macOS/Linux：

```bash
./venv/bin/lanhu-mcp --transport http --host 127.0.0.1 --port 8000
```

Windows PowerShell：

```powershell
.\venv\Scripts\lanhu-mcp.exe --transport http --host 127.0.0.1 --port 8000
```

本机客户端连接 `http://127.0.0.1:8000/mcp?role=Developer&name=YourName`。角色和名称使用适当英文标识；凭据留在服务 `.env`。端口冲突时先核对占用，不停止其他服务；用户选新端口后同步连接地址。

Codex CLI：

```bash
codex mcp add lanhu --url 'http://127.0.0.1:8000/mcp?role=Developer&name=YourName'
```

Claude Code：

```bash
claude mcp add --scope user --transport http lanhu 'http://127.0.0.1:8000/mcp?role=Developer&name=YourName'
```

Cursor 用户级配置：

```json
{
  "mcpServers": {
    "lanhu": {
      "url": "http://127.0.0.1:8000/mcp?role=Developer&name=YourName"
    }
  }
}
```

Codex 桌面端可按其当前自定义 MCP 设置添加同一 HTTP 地址；复用其实际用户配置，不同时覆盖插件配置。loopback 地址只能由同机环境访问，远端执行环境需要另行解决连接条件。

## 5. 重连与读取验收

按客户端要求刷新或新开会话；检查 MCP 状态和工具发现。Codex 可用 `codex mcp list`，Claude Code 可用 `claude mcp list` 或会话内 `/mcp`，Cursor 在设置中看实际连接状态。

然后逐项实际读取：

1. 一个用户有权限的 UI 设计稿，确认返回指定画板、标注及必要素材。
2. 一个用户有权限的产品原型，确认获得有关业务说明及交互；只有泛化设计列表时记录缺口并进入真实原型或请求补充。
3. 截图/导出的尺寸与内容完整，必要资产能够在目标项目中使用。

分别记录“服务可连接”“工具可调用”“UI 已读”“原型交互已读”，不能互相代替。

## 故障处理

| 问题 | 下一步 |
| --- | --- |
| Python 版本不足 | 用户启用合适版本，重新检查后继续 |
| Chromium 缺失 | 使用该 MCP 虚拟环境安装，检查安装结果 |
| Cookie 失效 | 用户本地刷新 Cookie，重启/重连，不回传凭据 |
| 有工具但项目不可读 | 核对蓝湖账户、项目分享及访问权限 |
| HTTP 连接失败 | 检查进程、端口、监听地址与客户端可达性 |
| stdio 启动失败 | 检查安装路径、虚拟环境、脚本和实际传输配置 |
| 原型只返回图片/列表 | 补读真实交互或询问用户，不能靠类型标签猜业务 |

上游功能可能包含协作消息等外部写入；本 Skill 只读取需求和设计，不因安装服务而启用这些操作。
