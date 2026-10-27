# TA-L 协作约定

先读 [项目章程](docs/PROJECT.md)、[工作流](docs/WORKFLOW.md) 与任务正文。保留用户和其他任务的未提交工作，核对远端、分支、基线 SHA；使用短期任务分支，目标默认分支为 `main`。

- 用户已经授权的常规实现和管理操作持续有效；不得从模板推导无关外发、费用或破坏性操作权限。
- 本轮仅涉及现有 GitHub 仓库；不创建新仓库，不引入 JEV 等本地项目依赖。
- 使用 Node 22：`npm ci`、`npm run lint`、`npm run build`。现有 CI 跑 lint 与 TypeScript/Vite 构建；真实模型调用需要单独核对费用范围。`npm test` 覆盖流式尾部、UTF-8 分块与推理内容隔离。
- 行为改变覆盖原失败条件；文档改动检查事实、链接和差异。未知结果不得填“通过”。
- 牌面解释不能伪装事实或未来保证；reasoning_content 不发送到浏览器或历史；设备 ID、限流和真实身份权限分别验证。
- 任务状态统一在[私有管理看板](https://github.com/users/2432antony-13/projects/1)的 Status 字段维护，阻塞使用 Blocked / Blocker 字段；Issue 正文保留验收与解除条件。旧 status/blocked 标签停止作为状态源。 PR 引用任务。合并、部署、用户验收分别记录，不自动关闭尚未满足交付验收的任务。
- 交接保留来源 SHA、命令/运行、输入输出范围、限制和下一动作。自查不称独立批准。
