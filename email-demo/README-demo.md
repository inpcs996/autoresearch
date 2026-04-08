# Email Demo

这个目录是一个最小可运行的 `autoresearch` 邮件优化示例。
当前场景是：优化一封发给创作者的二创合作申请邮件。

## 文件说明

- `content/email-templates/template-1.md`
  - 初始冷邮件模板，`autoresearch` 会反复修改这个文件。
- `scripts/score-email.js`
  - 评分脚本，读取邮件模板并输出 `EMAIL_SCORE:<数字>`。

## 手动验证

在这个目录下运行：

```bash
node scripts/score-email.js content/email-templates/template-1.md
```

预期会看到类似：

```text
EMAIL_SCORE:57
```

## 在 Codex 里运行

进入这个目录后，在新的 Codex 会话中输入：

```text
$autoresearch
Goal: 提高冷邮件回复率预测分数
Scope: content/email-templates/*.md
Metric: EMAIL_SCORE
Direction: higher is better
Verify: node scripts/score-email.js content/email-templates/template-1.md
Guard: grep -q "Subject:" content/email-templates/template-1.md
Iterations: 30
```

## 说明

- `Verify` 负责计算分数。
- `Guard` 负责保证模板至少保留 `Subject:` 结构。
- 现在的评分规则会奖励清晰意图、尊重授权、具体执行方案和可读性，同时惩罚空泛夸赞、重复表达和强推销口吻。
- 这个示例仍然是启发式评分，不等于真实世界的回复率。
