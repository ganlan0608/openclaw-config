# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## 我的配置

### SSHex 智能SSH管理技能

- **技能**: sshex v1.0.0 (智能SSH增强)
- **仓库**: https://github.com/ganlan0608/sshex
- **功能特性**:
  - 🧠 智能模式选择 (单命令 vs 持久会话)
  - 🔄 完整持久会话管理，状态保持
  - 🛡️ 自动会话清理，防止残留
  - 📚 包含完整SSH Essentials参考
  - ⚡ OpenClaw专用优化
- **触发方式**:
  - 自动识别: "登录服务器配置..."、"执行一系列操作..."
  - 手动请求: "启动持久SSH会话"、"保持连接来..."
- **安装**: `skills/sshex/` (本地) 或从GitHub Release下载

### SSH 服务器

- **测试服务器** → 202.32.206.112, 用户: root (存储在 Bitwarden)

### TTS

- Preferred voice: "Nova" (warm, slightly British)

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
