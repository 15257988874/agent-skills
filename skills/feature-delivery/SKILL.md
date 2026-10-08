---
name: feature-delivery
description: >-
  Use when implementing a frontend feature or small iteration in an existing
  project from product prototype links, Figma or Lanhu UI designs, and API
  documentation such as YApi, Swagger, or OpenAPI. Applies when several links
  cover one or multiple requested features. Not for creating a project from
  scratch, backend implementation, or design-only work.
metadata:
  short-description: 从原型、UI 和接口文档交付已有项目中的前端功能
---

# Feature Delivery

在已有项目中，按用户本次描述实现前端功能及已有后端接口接入。支持 Codex、Cursor、Claude Code；技术栈、组件与开发约定从目标项目读取。

## 执行约束

- 范围以用户描述为准。链接可能覆盖多个功能或整版产品，不默认全部实现；范围不明先问用户。第一版不创建项目、不修改后端或数据库。
- 功能、交互依据产品原型，样式依据 UI 设计，请求契约依据 API 文档。原型简化样式与 UI 视觉细节是互补；真实业务、交互或契约冲突必须交给用户决定。
- **发现真实冲突或关键业务信息缺失，立即暂停整个任务的实现，向用户说明来源、位置、差异与影响，收到明确答复后才恢复。其他独立功能、表单骨架、接口封装也不能先做。** 已完成改动保留并记录暂停点。
- 加载、空数据、请求失败等通用状态默认补齐，复用项目已有处理；权限、业务校验、计算和状态流转不能猜。
- 资料完整、范围明确且无冲突时直接修改代码，无需再要求用户批准整份规格；遵守当前用户及项目的修改约束。
- **默认真实浏览器验证和接口联调。登录、权限或环境受阻时，引导用户登录或授权，或询问是否跳过并由其手动验证；未经明确选择，不结束为已交付，不用 Mock 或等待超时代替授权。**
- 项目没有明确限制时，允许适用的类型检查与生产构建；现有项目或用户禁令优先。失败先判断是否由本次改动引起，扩大修复范围前问用户。
- **每个项目首次使用先询问任务记录目录并持久化选择；后续沿用，每次迭代独立保存来源版本、用户决策、改动及验证结果。** 不把业务资料写入全局 Skill。

## 工作流程

1. **项目与记录。** 读取 [project-adaptation.md](references/project-adaptation.md)，检查项目规则、技术栈、已有改动与相似实现；首次确认记录目录，建立本次记录。
2. **来源读取。** 读取 [source-reading.md](references/source-reading.md)，索引指定原型、UI、API 并按任务范围获取细节。YApi 为默认接口文档路径，其他平台按文档形式读取。缺少 MCP 时按对应指南逐步引导用户安装与认证： [Figma](references/setup-figma.md)、[蓝湖](references/setup-lanhu.md)。复用已有连接，不静默重装。
3. **关联与决策。** 读取 [feature-mapping.md](references/feature-mapping.md)，将来源与功能、操作和字段建立多对多映射；核对读取充分性。出现冲突或关键缺口进入全任务等待状态，将用户答复记入本次记录。
4. **实施。** 按依赖处理本次前端改动，沿用组件、路由、状态、样式与接口封装。保护现有用户改动，不扩展为整版功能或无关重构。
5. **验证与交付。** 读取 [acceptance.md](references/acceptance.md)，运行相关检查并验证真实页面与请求；登录受阻按执行约束等待用户处理。逐功能说明完成状态、验证证据、未验证项及手动步骤，更新本次记录。

## 常见误判

| 观察 | 正确处理 |
| --- | --- |
| 只有页面列表或截图 | 继续读取本次功能所需交互和契约；关键内容仍缺失则询问 |
| 时间紧，另一个功能独立 | 真实冲突仍暂停整个任务，等用户答复 |
| 页面名称相同 | 用来源 ID、节点及业务含义关联，不能直接合并 |
| 设计工具返回 React/Tailwind 代码 | 提取设计信息，按当前项目技术栈实现 |
| Mock 通过但用户未登录 | 引导登录或请用户明确选择手动验证，保留未验证状态 |

## 使用示例

```text
使用 feature-delivery，只给现有用户列表增加状态筛选。
产品原型：两条蓝湖或 Figma 链接
UI 设计：两条 Figma 或蓝湖链接
接口文档：YApi 链接
本次不修改资料中的新增、删除和导出功能。
```
