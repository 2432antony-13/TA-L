# TA-L 治理交接

2026-10-27；当前授权：用户要求按既定规范更新五个已有 GitHub 项目。工作分支 governance/project-baseline-20261027，基线 `28c4737fec9b03235d7efe17f8b09f717f88f5e5`。

已准备章程、协作规则、质量矩阵、资产来源与模板；实际 Issue、PR、平台约束和检查结果由本轮完成记录补充。当前尚未以本文件宣告合并、部署或业务验收。

下一执行动作：读取本仓 Issues 的唯一状态与阻塞，核对当前分支和最新检查，按具体用例推进。使用 Node 22：`npm ci`、`npm run lint`、`npm run build`。现有 CI 跑 lint 与 TypeScript/Vite 构建；真实模型调用需要单独核对费用范围。没有 npm test 脚本。

具体产品待办：验证流式生成、取消、断流与历史隔离；对齐模型配置并核对线上渠道与费用控制。业务期限/预算尚未承诺；新外部费用、真实发信或数据恢复按任务补齐范围。

当前已知限制：现有 CI 覆盖 lint/build。流式响应、取消与超时已有实现；设备 ID 历史分区不等于用户认证；Redis 缺失或故障时的限流放行需评估。模型配置与 README 默认值需对齐。 2026-10-27 已补齐 project/workflow 权限并接入私有看板；独立人工批准和用户验收尚未取得。本轮不新建仓库，不引入 JEV 等本地对象。

## 实际任务入口

[本轮里程碑](https://github.com/2432antony-13/TA-L/milestone/1)

- [governance #1](https://github.com/2432antony-13/TA-L/issues/1)
- [quality #2](https://github.com/2432antony-13/TA-L/issues/2)
- [release #3](https://github.com/2432antony-13/TA-L/issues/3)

任务当前状态以[私有管理看板](https://github.com/users/2432antony-13/projects/1)的 Status 与 Blocked 为准；最终 PR、合并来源与运行结果在治理任务正文登记。这里不复制会随进度变化的第二套任务状态。
