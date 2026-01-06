# MCP-XB: 让 AI 秒懂你的项目

> **一句话说明**: 自动分析项目结构并生成开发指南,让 AI 助手(Claude/Copilot)立即理解你的项目规范,生成符合项目风格的代码。

## ✨ 为什么需要它?

当你让 AI 帮你写代码时,是否遇到过这些问题:
- ❌ AI 不知道你用的是 Next.js App Router 还是 Pages Router
- ❌ 生成的代码风格与项目不一致
- ❌ 每次都要重复说明项目的路由/状态管理方案
- ❌ 之前写的优质代码找不到,重复造轮子

MCP-XB 一次分析,AI 永久记住:
- ✅ 自动识别技术栈(框架、路由、状态管理、样式方案)
- ✅ 生成项目开发指南,AI 自动遵循
- ✅ 积累代码片段,跨项目复用
- ✅ 记录最佳实践,持续优化

## 🚀 快速开始

### 1. 安装配置 (只需 2 步)

```bash
# 克隆并安装
git clone <repository-url>
```

**配置 项目** (`项目下的.vscode/mcp.json`):
```json
{
	"servers": {
		"my-mcp-server-2ef112f3": {
			 "command": "npm",
            "args": ["start"],
            "cwd": "拷贝下来mcp的项目地址",
		}
	},
	"inputs": []
}
```

### 2. 启动

### 3. 给coplot添加聊天指令
可以参考示例 `聊天指令` 文件  `./示例指令文件.md`

### 4. 开始使用 🎉
在 coplot 中直接说:
```
"分析我的当前项目，生成对应的开发说明文档"
```


AI 会自动:
1. 扫描项目结构
2. 识别技术栈(框架、路由、状态管理等)
3. 生成 `.vscode/PROJECT_GUIDE.md`
4. 之后生成的代码都符合你的项目规范!

## 💡 核心功能

### 🎯 功能 1: 项目分析与指南生成

**你只需说**: "分析项目并生成指南"

**AI 自动完成**:
- 识别框架(Next.js/React/Vue)和版本
- 检测路由方案(App Router/Pages Router/React Router)
- 发现状态管理(Redux/Zustand/Pinia等)
- 分析样式系统(Tailwind/CSS Modules/Styled Components)
- 生成完整项目文档到 `.vscode/PROJECT_GUIDE.md`

**实际对话示例**:
```
你: 分析我的项目 /Users/username/my-nextjs-app

AI: [自动分析项目结构...]
    
    ✅ 分析完成!
    - 框架: Next.js 14 (App Router)
    - 状态管理: Zustand
    - 样式: Tailwind CSS + shadcn/ui
    - 路由: App Router (app/目录)
    
    项目指南已生成: .vscode/PROJECT_GUIDE.md
    现在我会按照这个规范为你生成代码!
```

---

### 📝 功能 2: 记录最佳实践

**你只需说**: "把这个功能记录到项目指南"

**AI 自动完成**:
- 记录刚完成的功能实现
- 添加到项目指南的"实际用例"章节
- 下次遇到类似需求直接复用

**实际对话示例**:
```
你: 我刚实现了一个带搜索功能的用户列表页,记录一下

AI: 好的,我来记录这个用例:
    
    标题: 创建带搜索的列表页
    场景: 需要创建一个可搜索、可分页的数据列表
    
    [AI 会询问关键代码片段,然后添加到指南]
    
    ✅ 已添加到 PROJECT_GUIDE.md > 实际用例
```

---

### 💾 功能 3: 个人代码片段库

**你只需说**: "保存这个组件到我的笔记"

**AI 自动完成**:
- 保存优质组件/函数到 `.vscode/PERSONAL_DEV_NOTES.md`
- 跨项目通用,随时搜索复用

**实际对话示例**:
```
你: 保存这个自定义 Toast 组件到我的笔记

[提供代码]

AI: ✅ 已保存到个人笔记:
    - 分类: component
    - 标签: react, notification, toast
    - 位置: .vscode/PERSONAL_DEV_NOTES.md
    
你: (下次在其他项目) 搜索我之前写的 toast 组件

AI: [找到之前保存的组件,直接复用]
```

---

### 🚨 功能 4: 核心必读 - 强制性开发规范 🆕

**你只需说**: "设置核心必读内容"

**AI 自动完成**:
- 创建 `.vscode/CORE_GUIDELINES.md`
- 存储 AI 生成代码前 **必须遵守** 的规范
- 优先级高于 PROJECT_GUIDE.md

**适用场景**:
- 🚫 禁止使用某些技术（如: 禁用 .vue 文件，全用 TSX）
- ⚠️ 强制性命名规范（如: 组件必须 PascalCase）
- 📌 核心开发约定（如: 所有弹窗用 handleOpen 而非 v-model）
- 🔒 安全规范（如: 禁止使用 eval）

**实际对话示例**:
```
你: 设置核心必读内容

AI: 请提供必须遵守的核心规范

你: 
## 禁止事项
- 禁止使用 .vue 文件，全部使用 TSX
- 禁止使用 v-model 控制弹窗

## 强制规范
- 所有弹窗组件必须使用 handleOpen 方法
- 组件名称必须 PascalCase

AI: ✅ 核心必读已设置: .vscode/CORE_GUIDELINES.md
    ⚠️ AI 将在生成代码前优先阅读此文档！

(之后每次生成代码)
AI: [自动读取 CORE_GUIDELINES.md]
    ✅ 生成的代码严格遵守核心规范！
```

**与其他文档的关系**:
```
优先级排序：
CORE_GUIDELINES.md (最高) > PROJECT_GUIDE.md > PERSONAL_DEV_NOTES.md

└─ 核心必读        - 强制性规范，绝不可违反
└─ 项目指南        - 项目级规范，建议遵守
└─ 个人笔记        - 代码片段库，参考复用
```

---

## 📖 使用方式

### 方式 1: 使用 Prompt 模板 (推荐 - 最简单)🆕

7 个预设模板,在 Claude Desktop 的提示列表中选择即可:

| 模板 | 用途 | 何时使用 |
|------|------|------|
| 🌟 **onboard-project** | 新项目完整入门 | 刚接手项目,需要全面了解 |
| 📊 **analyze-new-project** | 生成项目指南 | 只需要生成文档 |
| 📝 **record-use-case** | 记录功能实现 | 完成功能后记录到指南 |
| 💾 **save-code-snippet** | 保存代码片段 | 写了优质代码想复用 |
| 🔍 **find-code-snippet** | 搜索代码片段 | 需要之前写过的代码 |
| 📖 **check-project-guide** | 查看项目规范 | 想了解项目最佳实践 |
| 🔬 **analyze-code-patterns** | 分析代码模式 | 了解项目命名/组织规范 |

**在 Claude 中的使用**:
1. 点击输入框上方的 📋 图标
2. 选择对应模板
3. 按提示操作即可

> **⚠️ VS Code Copilot 用户**: Prompts 功能可能不支持,请查看 [VSCODE_COMPATIBILITY.md](./VSCODE_COMPATIBILITY.md)

---

### 方式 2: 直接对话 (更灵活)

直接用自然语言告诉 AI 你的需求:

```
✅ "分析我的项目并生成指南"
✅ "记录这个功能到项目指南"  
✅ "保存这个组件到我的笔记"
✅ "搜索我之前写的防抖函数"
✅ "这个项目用的什么状态管理?"
```

AI 会自动调用对应的工具完成任务。

---

### 方式 3: 高级用户 - 直接调用工具

如果你熟悉工具调用,也可以直接使用:

<details>
<summary><b>🔧 可用工具列表</b> (点击展开)</summary>

#### 项目指南相关

- **analyze_and_generate_guide** - 分析项目并生成 PROJECT_GUIDE.md
- **read_project_guide** - 读取项目指南(可指定章节)
- **add_use_case** - 添加实际用例到指南
- **update_guide_section** - 更新指南特定章节

#### 代码分析相关

- **detect_project_patterns** - 检测命名规范、代码风格等
- **get_contextual_help** - 根据文件类型提供开发建议

#### 个人笔记相关

- **add_personal_snippet** - 保存代码片段
- **read_personal_notes** - 读取个人笔记
- **search_personal_snippets** - 搜索代码片段
- **list_personal_snippets** - 列出片段统计

#### 核心必读相关 🆕

- **set_core_guidelines** - 设置核心必读内容(强制性开发规范)
- **read_core_guidelines** - 读取核心必读内容

</details>

---

## 🎬 典型工作流程

### 场景 1: 接手新项目

```
第 1 天 - 项目分析
你: "分析我的项目 /path/to/project"
AI: ✅ 已生成项目指南 (.vscode/PROJECT_GUIDE.md)

第 1.5 天 - 设置核心规范 🆕
你: "设置核心必读内容"
AI: 请提供核心规范
你: [提供强制性规范]
AI: ✅ 已设置 (.vscode/CORE_GUIDELINES.md)

第 2 天 - 开始开发
你: "创建一个用户管理页面"
AI: [先读取 CORE_GUIDELINES.md,再读 PROJECT_GUIDE.md]
    ✅ 代码严格遵守核心规范!
    ✅ 自动符合项目风格!

第 N 天 - 记录实践
你: "把这个分页组件记录到指南"
AI: ✅ 已添加到实际用例,下次直接复用
```

### 场景 2: 积累个人技能库

```
项目 A - 写了个好用的 Hook
你: "保存这个 useDebounce Hook 到我的笔记"
AI: ✅ 已保存到个人笔记

项目 B - 需要复用
你: "搜索我的防抖 Hook"
AI: [找到之前保存的 useDebounce]
    直接复制使用,省时省力!
```

### 场景 3: 保持代码一致性

```
你: "这个项目的组件命名规范是什么?"
AI: [读取 PROJECT_GUIDE.md]
    PascalCase,文件名与组件名一致
    
你: "状态管理用的什么?"
AI: 使用 Zustand,store 文件在 src/store/

之后生成的代码自动遵循这些规范 ✅
```

---

## 📊 对比:使用前 vs 使用后

### ❌ 使用前

```
你: "创建一个用户列表页面"

AI: [不知道项目用什么路由]
    "你用的是 Next.js Pages Router 还是 App Router?"
    
你: "App Router"

AI: [不知道状态管理方案]
    "用什么状态管理? Redux? Zustand?"
    
你: "Zustand"

AI: [生成代码,但风格可能不一致]
    ❌ 每次都要重复说明
    ❌ 代码风格不统一
    ❌ 之前的实现找不到
```

### ✅ 使用后

```
第一次:
你: "分析我的项目 /path/to/project"
AI: ✅ 已识别 Next.js App Router + Zustand

之后每次:
你: "创建一个用户列表页面"
AI: [自动读取项目指南]
    ✅ 直接生成符合规范的代码
    ✅ 自动使用 App Router
    ✅ 自动使用 Zustand
    ✅ 命名风格与项目一致
    
你: "之前写过类似的吗?"
AI: [搜索项目指南的实际用例]
    ✅ 找到之前的"带搜索的列表页"实现
    ✅ 直接复用,省时省力!
```

---

## 安装

## 📚 技术细节

### 项目结构

```
mcp-xb/
├── src/
│   ├── main.js                    # MCP 服务器入口
│   ├── analyzers/
│   │   ├── projectAnalyzer.js     # 项目分析器
│   │   └── patternDetector.js     # 代码模式检测器
│   ├── tools/
│   │   ├── guideGenerator.js      # 项目指南生成和管理
│   │   └── personalNotes.js       # 个人笔记管理
│   └── utils/
│       └── fileUtils.js           # 文件工具函数
├── package.json
└── README.md
```

### 技术栈

- **运行时**: Node.js (ES Modules)
- **MCP SDK**: @modelcontextprotocol/sdk
- **依赖**: `zod` (参数验证), `fast-glob` (文件扫描)

### 开发进度

- ✅ Phase 1: 核心分析和指南生成
- ✅ Phase 2: 代码模式检测和上下文帮助
- ✅ Phase 3: 个人笔记和代码片段管理
- ✅ Phase 4: 核心必读 - 强制性开发规范 🆕

详见 [PROJECT_PLAN.md](./PROJECT_PLAN.md)

---

## 📂 生成的文件说明

### `.vscode/CORE_GUIDELINES.md` - 核心必读 🆕

**内容**: AI 生成代码前 **必须遵守** 的强制性规范  
**作用**: 确保 AI 生成的代码符合项目的核心约定  
**优先级**: 🔴 最高（高于 PROJECT_GUIDE.md）  
**版本控制**: 建议提交到 Git,团队共享  

**设置方式**: "设置核心必读内容"

**适用场景**:
- 禁止使用某些技术或写法
- 强制性命名规范
- 核心开发约定
- 安全规范

---

### `.vscode/PROJECT_GUIDE.md` - 项目开发指南

**内容**: 项目特定的技术栈、路由、状态管理、组件库规范  
**作用**: 让 AI 理解你的项目,生成符合规范的代码  
**优先级**: 🟡 中等  
**版本控制**: 建议提交到 Git,团队共享  

**生成方式**: "分析我的项目并生成指南"

---

### `.vscode/PERSONAL_DEV_NOTES.md` - 个人代码片段库

**内容**: 你写的优质组件、工具函数、Hooks、开发技巧  
**作用**: 跨项目复用,避免重复造轮子  
**优先级**: 🟢 参考  
**版本控制**: 建议添加到 `.gitignore`,个人使用  

**使用方式**:
- 保存: "把这个组件保存到我的笔记"
- 搜索: "找一下我之前写的防抖函数"

---

### 💡 为什么放在 `.vscode/` 目录?

1. **规范** - VS Code 项目配置的标准位置
2. **整洁** - 不污染项目根目录
3. **灵活** - 通过 `.gitignore` 控制是否提交
4. **隔离** - 与源代码分离

### 📊 文档优先级

```
⭐ CORE_GUIDELINES.md       - 强制性规范（最高优先级）
│
└─ PROJECT_GUIDE.md        - 项目级规范
  │
  └─ PERSONAL_DEV_NOTES.md  - 代码片段库
```

**AI 读取顺序**:
1. 先读 CORE_GUIDELINES.md（如果存在）
2. 再读 PROJECT_GUIDE.md
3. 最后参考 PERSONAL_DEV_NOTES.md

详见 [GITIGNORE_GUIDE.md](./GITIGNORE_GUIDE.md)

---

## ❓ 常见问题

<details>
<summary><b>Q: 支持哪些框架?</b></summary>

目前支持:
- Next.js (App Router / Pages Router)
- React (Create React App / Vite)
- Vue (Vue 3 / Nuxt)

会自动识别路由方案、状态管理、样式系统等。

</details>

<details>
<summary><b>Q: 项目指南需要手动维护吗?</b></summary>

不需要!
- 首次生成后,AI 会自动读取
- 完成功能后可以说"记录到指南",AI 自动添加
- 也可以手动编辑 `.vscode/PROJECT_GUIDE.md`

</details>

<details>
<summary><b>Q: 个人笔记和项目指南有什么区别?</b></summary>

- **项目指南** (PROJECT_GUIDE.md): 项目特定规范,建议提交 Git
- **个人笔记** (PERSONAL_DEV_NOTES.md): 个人代码库,跨项目复用,建议 .gitignore

</details>

<details>
<summary><b>Q: VS Code Copilot 能用吗?</b></summary>

可以! 但 Prompt 模板功能可能不支持。  
解决方案: 使用 `.vscode/copilot-instructions.md` 中的快捷指令。  
详见 [VSCODE_COMPATIBILITY.md](./VSCODE_COMPATIBILITY.md)

</details>

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

## 📚 相关文档

- **[VSCODE_COMPATIBILITY.md](./VSCODE_COMPATIBILITY.md)** - VS Code Copilot 兼容性说明 🆕
- **[.vscode/copilot-instructions.md](.vscode/copilot-instructions.md)** - VS Code 快捷指令模板 🆕
- **[PROMPTS_GUIDE.md](./PROMPTS_GUIDE.md)** - Prompt 模板详细使用指南（Claude Desktop）
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - 快速参考
- **[GITIGNORE_GUIDE.md](./GITIGNORE_GUIDE.md)** - Git 配置建议
- **[PROJECT_PLAN.md](./PROJECT_PLAN.md)** - 开发计划

## 许可

MIT
