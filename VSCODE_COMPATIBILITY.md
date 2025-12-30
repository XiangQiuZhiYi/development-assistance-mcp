# VS Code Copilot MCP Prompts 兼容性说明

## 🔍 问题原因

VS Code Copilot 的 MCP 实现目前**主要支持 Tools（工具）**，对 **Prompts（提示模板）的支持可能还不完整**。

这是因为：
1. VS Code 的 MCP 集成还在早期阶段
2. Prompts 功能在 MCP 规范中是较新的特性
3. 不同的 MCP 客户端（Claude Desktop vs VS Code）实现程度不同

## ✅ 当前状态

| 功能 | VS Code Copilot | Claude Desktop |
|-----|----------------|----------------|
| **Tools（工具）** | ✅ 完全支持 | ✅ 完全支持 |
| **Prompts（模板）** | ⚠️ 部分支持/不支持 | ✅ 完全支持 |
| **Resources** | ⚠️ 部分支持 | ✅ 支持 |

## 💡 解决方案

### 方案 1: 使用工具 + 自定义提示词（推荐）

在 VS Code 中，你可以通过**组合工具调用**来模拟 Prompt 的效果：

#### 示例：新项目入门

**直接对 Copilot 说**：
```
请帮我分析这个项目：
1. 使用 analyze_and_generate_guide 工具分析 /path/to/project
2. 使用 detect_project_patterns 工具检测代码模式
3. 总结项目的技术栈和开发规范
```

Copilot 会自动调用相应的工具并整合结果。

#### 示例：保存代码片段

**直接对 Copilot 说**：
```
我想保存这个组件到个人笔记：
- 项目路径: /path/to/project
- 类型: component
- 标题: Toast 组件
- 代码: [粘贴代码]

使用 add_personal_snippet 工具保存
```

### 方案 2: 创建自定义的"快捷指令"文件

创建一个 `.vscode/copilot-instructions.md` 文件：

\`\`\`markdown
# MCP-XB 快捷指令

## 新项目入门
当我说"分析新项目 [路径]"时：
1. 调用 analyze_and_generate_guide
2. 调用 detect_project_patterns
3. 总结技术栈和规范

## 保存代码片段
当我说"保存代码片段"时：
1. 询问片段类型（component/function/hook等）
2. 询问标题、描述、代码
3. 调用 add_personal_snippet

## 查找代码
当我说"查找 [关键词]"时：
1. 调用 search_personal_snippets
2. 展示搜索结果
\`\`\`

### 方案 3: 等待 VS Code 更新

关注 VS Code 的更新日志，未来版本可能会完整支持 MCP Prompts。

## 📝 实用技巧

### 1. 使用自然语言描述工作流

**好的提问方式**：
```
我想完整分析这个项目 /Users/username/my-project：
1. 生成项目指南
2. 检测代码模式
3. 给我总结技术栈

请使用 analyze_and_generate_guide 和 detect_project_patterns 工具
```

Copilot 会理解并按顺序调用工具。

### 2. 创建常用指令的文本片段

在项目中保存常用的指令模板：

\`\`\`
// .vscode/mcp-commands.txt

=== 新项目入门 ===
请分析项目 [PROJECT_PATH]：
1. analyze_and_generate_guide
2. detect_project_patterns
3. 总结结果

=== 保存代码片段 ===
保存到个人笔记：
- 项目: [PROJECT_PATH]
- 类型: [component/function/hook]
- 标题: [TITLE]
- 代码: [CODE]
使用 add_personal_snippet

=== 查找代码 ===
在 [PROJECT_PATH] 中搜索关键词 "[KEYWORD]"
使用 search_personal_snippets
\`\`\`

### 3. 批量操作

**提问示例**：
```
我想做以下操作：
1. 分析项目 /Users/username/my-project
2. 保存这个 Toast 组件到个人笔记
3. 然后查找所有关于 "notification" 的代码片段

请依次使用相应的工具
```

## 🎯 推荐工作流程

### 日常使用（在 VS Code Copilot 中）

1. **直接描述需求**
   ```
   "帮我分析这个项目并生成指南：/path/to/project"
   ```

2. **Copilot 自动选择工具**
   - 它会调用 `analyze_and_generate_guide`
   - 展示结果

3. **继续对话**
   ```
   "现在检测一下代码模式"
   ```
   - 调用 `detect_project_patterns`

4. **记录经验**
   ```
   "保存这个组件到个人笔记"
   ```
   - 调用 `add_personal_snippet`

### 对比 Claude Desktop

如果你同时使用 Claude Desktop：
- **VS Code Copilot**: 适合编码时快速调用工具
- **Claude Desktop**: 使用 Prompt 模板，更结构化的工作流

## 🔄 未来展望

VS Code 团队正在积极改进 MCP 集成。预期未来版本会：
- ✅ 完整支持 Prompts
- ✅ 改进工具调用界面
- ✅ 更好的参数输入体验

## 📞 相关资源

- [MCP SDK 文档](https://github.com/modelcontextprotocol/sdk)
- [VS Code MCP 扩展](https://marketplace.visualstudio.com/vscode)
- [MCP 规范](https://spec.modelcontextprotocol.io/)

## 💬 建议

目前在 VS Code Copilot 中使用 MCP-XB 的最佳方式是：
1. ✅ **直接用自然语言描述需求**
2. ✅ **让 Copilot 自动选择和调用工具**
3. ✅ **保存常用的指令模板**
4. ⏳ **等待 VS Code 完整支持 Prompts**

工具功能是完全可用的，只是使用方式略有不同！
