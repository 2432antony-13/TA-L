# TA-L 治理基线

观察日期：2026-10-27。基线：`28c4737fec9b03235d7efe17f8b09f717f88f5e5`；默认分支 `main`；仓库公开。这是冻结事实，不替代当前 PR 的检查。

现有 CI 覆盖 lint/build。流式响应、取消与超时已有实现；设备 ID 历史分区不等于用户认证；Redis 缺失或故障时的限流放行需评估。模型配置与 README 默认值需对齐。

## 检查入口与历史证据

使用 Node 22：`npm ci`、`npm run lint`、`npm run build`。现有 CI 跑 lint 与 TypeScript/Vite 构建；真实模型调用需要单独核对费用范围。没有 npm test 脚本。

- [CI / 30638548780](https://github.com/2432antony-13/TA-L/actions/runs/30638548780)：success，来源 `28c4737fec9b03235d7efe17f8b09f717f88f5e5`。
- [CI / 30510688678](https://github.com/2432antony-13/TA-L/actions/runs/30510688678)：success，来源 `a6f862ec50f826e7ab4628923165bc8166f1c224`。
- [CI / 30510627665](https://github.com/2432antony-13/TA-L/actions/runs/30510627665)：success，来源 `980e892193f468dcfb9143994bcc6a0b1bf42050`。

## 平台差异

公开仓库尚无 rulesets；待实际 PR 检查通过后配置并回读。 CLI 当前有 repo 权限，仍缺 project/workflow；Projects 和新工作流接入单列待办。本仓 Issues 已启用。

## 本轮采用范围

采用材料来源：用户提供的 project-governance kit/skill v1.0.0 与 2026-10-25 工作区方案；用户 2026-10-27 授权五个现有仓库实施。此前跨仓复用是建议；未发生的集成不登记为已采用。

本轮 PR 与实际管理交付见 [HANDOVER.md](HANDOVER.md)。专业质量、浏览器使用和线上渠道必须另有证据。

## 平台接入更新（2026-10-27）

上文是治理启动时快照。当前账号已具备 project/workflow，任务状态统一在[私有管理看板](https://github.com/users/2432antony-13/projects/1)的 Status 字段维护，阻塞使用 Blocked / Blocker 字段；Issue 正文保留验收与解除条件。旧 status/blocked 标签停止作为状态源。 本轮 PR 及运行结果在关联任务中记录，私有仓套餐限制与产品验收继续单列。
