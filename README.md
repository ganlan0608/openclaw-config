# OpenClaw 配置备份

这是 ganlan 的 OpenClaw 配置备份仓库，包含了完整的配置设置和工作区文件。

## 文件说明

### 主配置
- `openclaw.json` - OpenClaw 主配置文件（已脱敏）

### 工作区配置
- `workspace/AGENTS.md` - Agent 行为指南
- `workspace/SOUL.md` - AI 个性和行为准则  
- `workspace/TOOLS.md` - 本地工具配置
- `workspace/USER.md` - 用户信息
- `workspace/IDENTITY.md` - AI 身份设置
- `workspace/HEARTBEAT.md` - 心跳检查任务
- `workspace/MEMORY.md` - 长期记忆

### Hooks
- `hooks/error-recovery.js` - 错误恢复钩子脚本

## 重要特性

### 自动化配置
- **默认权限**: 启用提升权限 (`elevatedDefault: "on"`)
- **沙盒模式**: 关闭沙盒 (`sandbox.mode: "off"`) 
- **思考模式**: 高详细度 (`thinkingDefault: "high"`)
- **自动修复**: 启用代码自动修复 (`applyPatch.enabled: true`)

### Telegram 优化
- **流式回复**: 部分流式模式 (`streamMode: "partial"`)
- **即时确认**: 眼睛表情确认 (`ackReaction: "👀"`)
- **智能分段**: 4000字符限制，智能换行分段
- **自定义命令**: status, files, memory, help

### 模型配置
- **主模型**: GitHub Copilot Claude Sonnet 4
- **备用模型**: GitHub Copilot GPT-4o
- **心跳间隔**: 30分钟

## 安全说明

⚠️ **敏感信息已移除**
- Telegram Bot Token → `YOUR_TELEGRAM_BOT_TOKEN_HERE`
- Gateway Token → `YOUR_GATEWAY_TOKEN_HERE`  
- Node ID → `YOUR_NODE_ID_HERE`

## 恢复配置

1. 复制 `openclaw.json` 到 `~/.openclaw/`
2. 复制 `workspace/` 文件到 `~/.openclaw/workspace/`
3. 复制 `hooks/` 文件到 `~/.openclaw/workspace/hooks/`
4. 替换占位符为实际的 token 和 ID
5. 重启 OpenClaw: `openclaw gateway restart`

## 版本信息

- OpenClaw 版本: 2026.2.19-2
- 配置更新时间: 2026-02-23T02:34:10.130Z
- 备份创建时间: $(date '+%Y-%m-%d %H:%M:%S')

## 变更历史

### 2026-02-23
- 首次创建配置备份
- 实现完全自动化配置优化
- 添加错误恢复钩子
- Telegram 体验优化