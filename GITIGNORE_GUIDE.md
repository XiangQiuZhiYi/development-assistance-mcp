# .gitignore 建议配置

在目标项目的 .gitignore 中添加以下配置，以灵活控制这些文件的版本管理：

## 选项 1: 忽略所有自动生成的文档（推荐用于个人项目）
```gitignore
# MCP 自动生成的文档
.vscode/PROJECT_GUIDE.md
.vscode/PERSONAL_DEV_NOTES.md
```

## 选项 2: 提交项目指南，忽略个人笔记（推荐用于团队项目）
```gitignore
# 个人开发笔记（不提交到团队仓库）
.vscode/PERSONAL_DEV_NOTES.md
```

## 选项 3: 全部提交（团队共享知识库）
```gitignore
# 不添加任何配置，全部提交
# 团队成员可以共同维护项目指南和最佳实践
```

## 说明

- **PROJECT_GUIDE.md**: 项目规范，建议团队项目提交共享
- **PERSONAL_DEV_NOTES.md**: 个人代码库，建议忽略不提交

## 当前项目 (mcp-xb) 的 .gitignore
已配置忽略 node_modules 等标准文件
