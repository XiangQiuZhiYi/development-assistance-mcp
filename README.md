# MCP-XB: 项目指南生成器

一个 Model Context Protocol (MCP) 服务器，用于自动分析项目结构并生成开发指南，帮助 AI 快速理解项目并高效完成开发需求。

## 功能特性

### 核心功能

1. **自动项目分析**
   - 检测框架类型（Next.js, React, Vue）
   - 识别路由方案（App Router, Pages Router, React Router, Vue Router）
   - 发现状态管理方案（Redux, Zustand, MobX, Pinia 等）
   - 分析样式系统（Tailwind, CSS Modules, Styled Components 等）
   - 扫描组件库结构
   - 识别 API 调用模式

2. **智能指南生成**
   - 自动生成结构化的 `PROJECT_GUIDE.md`
   - 包含项目概览、目录结构、核心概念
   - 提供开发规范和最佳实践
   - 记录常用命令

3. **用例积累**
   - 添加实际开发用例到指南
   - 记录常见任务的解决方案
   - 持续学习和改进

## 安装

```bash
# 克隆仓库
git clone <repository-url>
cd mcp-xb

# 安装依赖
npm install
```

## 使用方法

### 1. 配置 Claude Desktop

在 Claude Desktop 配置文件中添加此 MCP 服务器：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mcp-xb": {
      "command": "node",
      "args": ["/Users/zhiyi/Documents/Code/XIAOBAO/mcp-xb/src/main.js"]
    }
  }
}
```

### 2. 重启 Claude Desktop

配置完成后重启 Claude Desktop 以加载 MCP 服务器。

### 3. 使用 Prompts 模板（推荐）🆕

MCP-XB 提供了 7 个预设的交互模板，让你更便捷地使用各项功能：

#### 📋 可用的 Prompt 模板

1. **analyze-new-project** - 分析新项目并生成完整指南
2. **record-use-case** - 记录刚完成的功能到项目指南
3. **save-code-snippet** - 保存优质代码片段到个人笔记
4. **find-code-snippet** - 搜索并复用之前保存的代码
5. **check-project-guide** - 查看项目规范和最佳实践
6. **analyze-code-patterns** - 分析项目的代码模式
7. **onboard-project** - 新项目完整入门流程

**使用方式**：
在 Claude Desktop 中，这些模板会出现在提示列表中，选择后会自动生成结构化的对话，引导你完成操作。

> **⚠️ VS Code Copilot 用户注意**：  
> VS Code 的 MCP 实现目前主要支持 Tools（工具），Prompts（模板）功能可能还不完全支持。  
> 👉 请查看 **[VSCODE_COMPATIBILITY.md](./VSCODE_COMPATIBILITY.md)** 了解解决方案  
> 👉 使用 **[.vscode/copilot-instructions.md](./.vscode/copilot-instructions.md)** 中的快捷指令模板

### 4. 直接使用工具

你也可以直接调用工具（适合高级用户）：

#### **项目指南相关**

#### `analyze_and_generate_guide`
分析项目结构并生成 PROJECT_GUIDE.md

```
参数:
  projectPath (string): 项目根目录的绝对路径

示例:
  分析项目 /Users/username/my-nextjs-app 并生成指南
```

#### `read_project_guide`
读取项目指南内容

```
参数:
  projectPath (string): 项目根目录的绝对路径
  section (string, 可选): 指定要读取的章节

示例:
  读取 /Users/username/my-nextjs-app 的路由系统章节
```

#### `add_use_case`
向指南添加实际用例

```
参数:
  projectPath (string): 项目根目录的绝对路径
  title (string): 用例标题
  description (string): 用例描述
  code (string): 示例代码
  scenario (string, 可选): 使用场景
  language (string, 可选): 代码语言，默认 typescript
  notes (string, 可选): 注意事项

示例:
  添加一个"创建新页面"的用例到指南
```

#### `update_guide_section`
更新项目指南中的特定章节

```
参数:
  projectPath (string): 项目根目录的绝对路径
  sectionTitle (string): 要更新的章节标题
  newContent (string): 新的章节内容（Markdown 格式）

示例:
  更新路由配置章节的内容
```

#### **代码分析相关**

#### `detect_project_patterns`
检测项目代码模式、命名约定等

```
参数:
  projectPath (string): 项目根目录的绝对路径

输出:
  返回命名模式、文件组织、代码风格、Hooks 使用等分析结果
```

#### `get_contextual_help`
根据文件类型提供上下文帮助

```
参数:
  filePath (string): 当前文件的绝对路径
  projectPath (string): 项目根目录的绝对路径

输出:
  返回文件类型、相关文件、建议的开发模式
```

#### **个人笔记相关** 🆕

#### `add_personal_snippet`
添加个人代码片段到开发笔记

```
参数:
  projectPath (string): 项目根目录的绝对路径
  category (enum): 分类 - component | function | hook | style | tip | solution
  title (string): 片段标题
  description (string): 片段描述
  code (string): 代码内容
  language (string, 可选): 代码语言，默认 typescript
  tags (array, 可选): 标签列表
  notes (string, 可选): 使用说明

示例:
  添加一个自定义 Toast 组件到个人笔记
```

#### `read_personal_notes`
读取个人开发笔记

```
参数:
  projectPath (string): 项目根目录的绝对路径
  category (enum, 可选): 指定分类 - component | function | hook | style | tip | solution

示例:
  读取所有工具函数类型的笔记
```

#### `search_personal_snippets`
搜索个人笔记中的代码片段

```
参数:
  projectPath (string): 项目根目录的绝对路径
  keyword (string): 搜索关键词

输出:
  返回匹配的片段列表，包含标题、描述、标签等信息
```

#### `list_personal_snippets`
列出个人笔记的概要统计

```
参数:
  projectPath (string): 项目根目录的绝对路径

输出:
  返回各分类的片段数量统计
```

#### `update_guide_section`
更新指南中的特定章节

```
参数:
  projectPath (string): 项目根目录的绝对路径
  sectionTitle (string): 要更新的章节标题（如 "路由系统", "状态管理"）
  newContent (string): 新的章节内容（Markdown 格式）

示例:
  更新项目的状态管理章节，添加新的最佳实践
```

#### `detect_project_patterns`
检测项目中的代码模式和约定

```
参数:
  projectPath (string): 项目根目录的绝对路径

返回:
  - 命名模式（PascalCase, camelCase 等）
  - 文件组织方式（feature-based, layered 等）
  - 代码风格（引号、分号、缩进等）
  - Hook 使用模式
  - 导入模式

示例:
  检测项目的代码规范和常用模式
```

#### `get_contextual_help`
根据当前文件获取上下文帮助

```
参数:
  filePath (string): 当前文件的绝对路径
  projectPath (string): 项目根目录的绝对路径

返回:
  - 文件类型（component, page, hook, utility 等）
  - 相关文件
  - 建议的开发模式
  - 项目特定规范

示例:
  获取当前组件文件的开发建议和相关最佳实践
```

## 工作流程

### 🚀 推荐：使用 Prompt 模板（最简单）

1. **新项目入门**
   ```
   选择 "onboard-project" 模板
   → 输入项目路径
   → AI 自动完成分析、生成指南、总结规范
   ```

2. **记录完成的功能**
   ```
   选择 "record-use-case" 模板
   → 说明刚完成的功能
   → AI 引导你添加到项目指南
   ```

3. **保存优质代码**
   ```
   选择 "save-code-snippet" 模板
   → 提供代码和说明
   → AI 自动分类保存到个人笔记
   ```

4. **查找可复用代码**
   ```
   选择 "find-code-snippet" 模板
   → 说明需求（如：需要一个防抖函数）
   → AI 搜索并展示相关代码
   ```

### 🔧 进阶：直接使用工具

1. **首次使用项目时**
   ```
   使用 analyze_and_generate_guide 工具分析项目
   → 生成 .vscode/PROJECT_GUIDE.md
   → AI 阅读指南，理解项目结构
   ```

2. **开发过程中**
   ```
   使用 read_project_guide 工具查看特定章节
   → AI 根据指南规范生成代码
   → 使用 get_contextual_help 获取当前文件的开发建议
   → 代码符合项目最佳实践
   ```

3. **检测代码模式**
   ```
   使用 detect_project_patterns 工具
   → 了解项目的命名约定、文件组织方式
   → 统一代码风格
   ```

4. **维护和更新指南**
   ```
   使用 update_guide_section 更新特定章节
   → 使用 add_use_case 添加新的实际用例
   → 持续改进项目文档
   ```

5. **积累个人经验** 🆕
   ```
   写了优质组件/工具函数时
   → 使用 add_personal_snippet 记录到 .vscode/PERSONAL_DEV_NOTES.md
   → 使用 search_personal_snippets 快速查找复用
   → 跨项目通用，提高开发效率
   ```

## 两种文档的区别

| 文档类型 | .vscode/PROJECT_GUIDE.md | .vscode/PERSONAL_DEV_NOTES.md 🆕 |
|---------|------------------|------------------------|
| **作用** | 项目规范和最佳实践 | 个人代码片段库 |
| **内容** | 技术栈、路由、状态管理、组件库 | 优质组件、工具函数、Hooks、技巧 |
| **范围** | 当前项目特定 | 跨项目通用 |
| **受众** | 团队成员 | 个人开发 |
| **存储位置** | `.vscode/PROJECT_GUIDE.md` | `.vscode/PERSONAL_DEV_NOTES.md` |
| **版本控制** | 建议提交（团队共享） | 建议忽略（个人使用） |
| **相关工具** | analyze_and_generate_guide<br>add_use_case<br>update_guide_section | add_personal_snippet<br>search_personal_snippets<br>read_personal_notes |

### 💡 为什么放在 .vscode 目录？

1. **规范化**: `.vscode` 是 VS Code 项目配置的标准位置
2. **整洁**: 不污染项目根目录
3. **灵活**: 通过 `.gitignore` 灵活控制是否提交（详见 [GITIGNORE_GUIDE.md](./GITIGNORE_GUIDE.md)）
4. **隔离**: 与项目源代码分离，便于管理

## 项目结构

```
mcp-xb/
├── src/
│   ├── main.js                    # MCP 服务器入口
│   ├── analyzers/
│   │   ├── projectAnalyzer.js     # 项目分析器
│   │   └── patternDetector.js     # 代码模式检测器
│   ├── tools/
│   │   ├── guideGenerator.js      # 项目指南生成和管理
│   │   └── personalNotes.js       # 个人笔记管理 🆕
│   └── utils/
│       └── fileUtils.js           # 文件工具函数
├── package.json
├── PROJECT_PLAN.md                # 开发计划
└── README.md
```

## 技术栈

- **运行时**: Node.js (ES Modules)
- **MCP SDK**: @modelcontextprotocol/sdk
- **依赖**:
  - `zod`: 参数验证
  - `fast-glob`: 文件扫描

## 开发计划

详见 [PROJECT_PLAN.md](./PROJECT_PLAN.md)

### Phase 1 (已完成 ✅)
- ✅ analyze_and_generate_guide - 分析项目并生成指南
- ✅ read_project_guide - 读取项目指南
- ✅ add_use_case - 添加实际用例

### Phase 2 (已完成 ✅)
- ✅ update_guide_section - 更新指南章节
- ✅ detect_project_patterns - 检测代码模式
- ✅ get_contextual_help - 获取上下文帮助

### Phase 3 (已完成 ✅) 🆕
- ✅ add_personal_snippet - 添加个人代码片段
- ✅ read_personal_notes - 读取个人笔记
- ✅ search_personal_snippets - 搜索代码片段
- ✅ list_personal_snippets - 列出片段概要

## 示例输出

### .vscode/PROJECT_GUIDE.md（项目指南）

生成位置：`项目根目录/.vscode/PROJECT_GUIDE.md`

```markdown
# PROJECT GUIDE

> 自动生成的项目开发指南

## 1. 项目概览
- 框架、路由、状态管理、样式方案

## 2. 目录结构
- 完整的项目目录树

## 3. 核心概念
- 路由系统使用指南
- 状态管理最佳实践
- 样式规范
- 组件库文档
- API 调用模式

## 4. 开发规范
- 文件命名规范
- 组件开发指南
- 状态管理建议

## 5. 常用命令
- npm scripts 列表

## 6. 实际用例
- 记录的开发用例
```

### .vscode/PERSONAL_DEV_NOTES.md（个人笔记）🆕

生成位置：`项目根目录/.vscode/PERSONAL_DEV_NOTES.md`

```markdown
# 个人开发笔记

## 📦 常用组件

### 自定义 Toast 组件
**描述**: 轻量级的消息提示组件
**标签**: `react`, `notification`, `toast`
**代码**:
```tsx
export function useToast() {
  // ...实现代码
}
```
**使用说明**: 支持成功、错误、警告等多种类型

## 🛠️ 工具函数

### 防抖函数
**描述**: 性能优化的防抖函数实现
**代码**:
```typescript
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  // ...
}
```

## 🎣 自定义 Hooks

### useLocalStorage
**描述**: 持久化状态到 localStorage
...
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 相关文档

- **[VSCODE_COMPATIBILITY.md](./VSCODE_COMPATIBILITY.md)** - VS Code Copilot 兼容性说明 🆕
- **[.vscode/copilot-instructions.md](.vscode/copilot-instructions.md)** - VS Code 快捷指令模板 🆕
- **[PROMPTS_GUIDE.md](./PROMPTS_GUIDE.md)** - Prompt 模板详细使用指南（Claude Desktop）
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - 快速参考
- **[GITIGNORE_GUIDE.md](./GITIGNORE_GUIDE.md)** - Git 配置建议
- **[PROJECT_PLAN.md](./PROJECT_PLAN.md)** - 开发计划

## 许可

MIT
