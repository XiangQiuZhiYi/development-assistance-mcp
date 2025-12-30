# 快速参考

## 🎯 最快上手方式：使用 Prompt 模板

MCP-XB 提供了 7 个即用型对话模板，无需记忆命令：

### 核心模板

| Prompt 名称 | 用途 | 使用场景 |
|------------|------|---------|
| **onboard-project** | 新项目完整入门 | 刚接手新项目，想快速了解 |
| **analyze-new-project** | 生成项目指南 | 第一次分析项目 |
| **check-project-guide** | 查看项目规范 | 开发前想了解规范 |
| **analyze-code-patterns** | 分析代码模式 | 想统一代码风格 |

### 记录和复用

| Prompt 名称 | 用途 | 使用场景 |
|------------|------|---------|
| **record-use-case** | 记录开发用例 | 完成功能后记录经验 |
| **save-code-snippet** | 保存代码片段 | 写了好用的组件/函数 |
| **find-code-snippet** | 搜索代码片段 | 需要之前写过的代码 |

**使用方法**：
在 Claude Desktop 中，点击 Prompts 图标，选择对应模板即可。

---

## 📁 文件位置

使用 MCP-XB 时，所有文档都会自动生成到目标项目的 `.vscode` 目录中：

```
your-project/
├── .vscode/
│   ├── PROJECT_GUIDE.md          ← 项目规范（团队共享）
│   └── PERSONAL_DEV_NOTES.md     ← 个人笔记（个人使用）
├── src/
├── package.json
└── ...
```

## 🔧 版本控制建议

### 团队项目（推荐）

在项目的 `.gitignore` 中添加：

```gitignore
# 忽略个人笔记，保留项目指南
.vscode/PERSONAL_DEV_NOTES.md
```

这样：
- ✅ `PROJECT_GUIDE.md` 会被提交，团队共享项目规范
- ❌ `PERSONAL_DEV_NOTES.md` 不会被提交，保持个人使用

### 个人项目

```gitignore
# 忽略所有自动生成的文档
.vscode/PROJECT_GUIDE.md
.vscode/PERSONAL_DEV_NOTES.md
```

### 团队知识库

如果希望团队共同维护个人最佳实践库：

```gitignore
# 不添加任何规则，全部提交
```

## 🚀 常用命令

### 方式 1: 使用 Prompt 模板（推荐）⭐

#### 新项目入门
```
1. 在 Claude 中选择 "onboard-project" 模板
2. 输入项目路径
3. AI 自动完成：
   - 生成 PROJECT_GUIDE.md
   - 分析代码模式
   - 总结技术栈和规范
```

#### 保存代码片段
```
1. 选择 "save-code-snippet" 模板
2. 说明代码类型（组件/函数/Hook等）
3. 提供代码和说明
4. AI 自动保存到 .vscode/PERSONAL_DEV_NOTES.md
```

#### 查找代码
```
1. 选择 "find-code-snippet" 模板
2. 说明需求（如：需要 Toast 组件）
3. AI 自动搜索并展示结果
```

### 方式 2: 直接使用工具

#### 1. 首次分析项目
```javascript
// 在 Claude 中使用
使用 analyze_and_generate_guide 工具分析当前项目
```

生成：`.vscode/PROJECT_GUIDE.md`

### 2. 添加个人代码片段
```javascript
使用 add_personal_snippet 工具
- 分类：component（组件）
- 标题：自定义 Toast
- 代码：...
```

添加到：`.vscode/PERSONAL_DEV_NOTES.md`

### 3. 搜索代码片段
```javascript
使用 search_personal_snippets 工具
- 关键词：toast
```

### 4. 更新项目指南
```javascript
使用 update_guide_section 工具
- 章节：路由系统
- 内容：...
```

## 💡 使用技巧

### 跨项目复用个人笔记

虽然 `PERSONAL_DEV_NOTES.md` 存储在每个项目的 `.vscode` 中，但你可以：

1. **手动同步**：将优质片段从一个项目复制到另一个项目
2. **使用搜索**：在当前项目中搜索之前添加的代码
3. **建立个人模板库**：创建一个专门的项目存储个人片段，其他项目引用

### 团队最佳实践

1. 新成员入职时先运行 `analyze_and_generate_guide`
2. 定期使用 `add_use_case` 记录实际开发案例
3. 代码评审时更新 `PROJECT_GUIDE.md` 的规范
4. 每个开发者维护自己的 `PERSONAL_DEV_NOTES.md`（不提交）

## 📚 相关文档

- [README.md](./README.md) - 完整文档
- [PROJECT_PLAN.md](./PROJECT_PLAN.md) - 开发计划
- [GITIGNORE_GUIDE.md](./GITIGNORE_GUIDE.md) - Git 配置详细说明
