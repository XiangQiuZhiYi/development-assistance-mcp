# MCP 项目助手 - 开发计划

## 项目愿景

打造一个智能 MCP 服务，帮助新手快速掌握项目代码，并利用 AI 高效完成开发需求。

## 核心理念

1. **自动化文档生成** - 分析项目生成结构化的入门指南
2. **AI 先理解规范** - 让 AI 先读懂项目最佳实践再生成代码
3. **知识持续沉淀** - 将开发经验转化为可复用的案例库

## 工作流程

```
新人入职
    ↓
自动生成项目指南 (PROJECT_GUIDE.md)
    ↓
AI 阅读指南了解项目规范
    ↓
用户提出需求（如：添加新页面）
    ↓
AI 基于指南中的最佳实践生成代码
    ↓
完成后将案例记录到指南
    ↓
指南持续更新优化
```

## 阶段划分

### 第一阶段：项目分析与指南生成 (核心功能)

**目标**：自动分析项目并生成完整的入门指南

#### 工具 1: `analyze_and_generate_guide`

**功能**：扫描项目并生成 `PROJECT_GUIDE.md`

**输入参数**：
- `projectPath`: 项目根目录路径
- `outputPath`: 指南输出路径（默认：`./PROJECT_GUIDE.md`）
- `sections`: 需要生成的章节（可选，默认全部）

**生成内容结构**：

```markdown
# 项目入门指南

## 1. 项目概览
- 项目名称和描述
- 技术栈
- 启动命令

## 2. 项目结构
```
src/
├── components/     # 公共组件
├── pages/          # 页面
├── utils/          # 工具函数
└── ...
```

## 3. 可用命令
- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- ...

## 4. 路由配置
- 路由文件位置
- 路由配置方式
- 添加新路由的步骤

## 5. 状态管理
- 使用的状态管理方案
- Store 结构
- 最佳实践

## 6. API 调用规范
- API 请求封装方式
- 错误处理
- 示例代码

## 7. 常用组件库
- Button - 按钮组件
- Modal - 弹窗组件
- ...

## 8. 样式规范
- CSS 方案（CSS Modules/Tailwind/Styled-components）
- 命名规范
- 主题配置

## 9. 最佳实践
- 文件命名规范
- 组件编写规范
- 代码组织方式

## 10. 使用案例
### 案例 1: 添加新的列表页面
- 需求描述
- 实现步骤
- 参考代码
- 关键点说明
```

**实现逻辑**：
1. 扫描 `package.json` 获取项目基本信息
2. 分析目录结构识别项目类型（Next.js/React/Vue 等）
3. 检测路由方案（文件路由/配置路由）
4. 识别状态管理（Redux/Zustand/Pinia 等）
5. 提取常用组件和工具函数
6. 分析代码模式总结最佳实践
7. 生成结构化的 Markdown 文档

#### 工具 2: `read_project_guide`

**功能**：读取指南的特定章节供 AI 参考

**输入参数**：
- `section`: 章节名称（如：`路由配置`、`常用组件库`）
- `guidePath`: 指南文件路径（默认：`./PROJECT_GUIDE.md`）

**输出**：
返回指定章节的内容

**使用场景**：
- AI 在生成路由代码前先读取"路由配置"章节
- AI 在使用组件前先读取"常用组件库"章节

#### 工具 3: `update_guide_section`

**功能**：更新指南中的特定章节

**输入参数**：
- `section`: 章节名称
- `content`: 新的内容
- `mode`: 更新模式（`replace` 替换 / `append` 追加）
- `guidePath`: 指南文件路径

**使用场景**：
- 更新过时的命令说明
- 添加新的路由配置方式
- 修正错误的描述

#### 工具 4: `add_use_case`

**功能**：向指南添加新的使用案例

**输入参数**：
- `title`: 案例标题（如：`添加用户设置页面`）
- `description`: 需求描述
- `steps`: 实现步骤数组
- `code`: 关键代码片段
- `notes`: 注意事项
- `guidePath`: 指南文件路径

**输出格式**：
```markdown
### 案例 N: 添加用户设置页面

**需求描述**：
用户需要一个设置页面来修改个人信息

**实现步骤**：
1. 在 `src/pages/` 下创建 `settings.tsx`
2. 在路由配置中添加 `/settings` 路径
3. 创建设置表单组件
4. 对接更新用户信息 API

**关键代码**：
```tsx
// src/pages/settings.tsx
import { useForm } from 'react-hook-form';
...
```

**注意事项**：
- 表单验证使用项目统一的 `react-hook-form`
- API 调用需要添加 loading 状态
```

**使用场景**：
- 完成新功能后记录实现过程
- 积累团队最佳实践
- 为后续类似需求提供参考

### 第二阶段：智能代码分析

#### 工具 5: `detect_project_patterns`

**功能**：深度分析项目代码模式

**输入参数**：
- `projectPath`: 项目路径
- `patterns`: 要检测的模式类型（`routing`/`state`/`api`/`styling`）

**输出**：
```json
{
  "routing": {
    "type": "file-based",
    "framework": "Next.js App Router",
    "pattern": "src/app/[route]/page.tsx"
  },
  "state": {
    "solution": "Zustand",
    "storeLocation": "src/store/",
    "pattern": "分 feature 组织 store"
  },
  "api": {
    "method": "fetch wrapper",
    "location": "src/utils/api.ts",
    "errorHandling": "统一错误处理中间件"
  },
  "styling": {
    "solution": "Tailwind CSS",
    "config": "tailwind.config.js",
    "pattern": "utility-first"
  }
}
```

#### 工具 6: `get_contextual_help`

**功能**：根据用户任务提供相关的上下文信息

**输入参数**：
- `task`: 任务描述（如：`添加新页面`）
- `projectPath`: 项目路径

**输出**：
```json
{
  "relevantSections": ["路由配置", "常用组件库", "样式规范"],
  "similarCases": ["案例 2: 添加商品详情页"],
  "requiredFiles": ["src/app/layout.tsx", "src/components/Layout.tsx"],
  "suggestedApproach": "基于现有页面模板创建新页面..."
}
```

**使用场景**：
- 用户说"我想添加一个用户列表页"
- MCP 自动提取相关章节、相似案例、需要参考的文件
- AI 基于这些上下文生成代码

## 实现优先级

### P0 (必须实现)
- ✅ 基础 MCP 服务器框架
- [ ] `analyze_and_generate_guide` - 自动生成指南
- [ ] `read_project_guide` - 读取指南章节
- [ ] `add_use_case` - 添加使用案例

### P1 (重要)
- [ ] `update_guide_section` - 更新指南内容
- [ ] `detect_project_patterns` - 检测代码模式

### P2 (优化)
- [ ] `get_contextual_help` - 智能上下文提取
- [ ] 多项目支持（为多个项目维护不同的指南）
- [ ] 指南版本管理

## 技术实现细节

### 项目类型检测

通过分析文件和配置识别：
- **Next.js**: 存在 `next.config.js` + `src/app` 或 `src/pages`
- **React (CRA)**: 存在 `react-scripts` 依赖
- **Vue**: 存在 `vue` 依赖 + `vite.config.js` 或 `vue.config.js`
- **React + Vite**: 存在 `vite.config.js` + `react` 依赖

### 路由方案检测

- **Next.js App Router**: `src/app/*/page.tsx`
- **Next.js Pages Router**: `src/pages/*.tsx`
- **React Router**: 搜索 `react-router-dom` + `<Route>` 组件
- **Vue Router**: 搜索 `vue-router` + `createRouter`

### 状态管理检测

- **Redux**: `@reduxjs/toolkit` 依赖
- **Zustand**: `zustand` 依赖 + `create` 函数
- **Pinia**: `pinia` 依赖
- **Context API**: 搜索 `createContext` + `useContext`

### 样式方案检测

- **Tailwind CSS**: `tailwind.config.js` + `tailwindcss` 依赖
- **CSS Modules**: `.module.css` 文件
- **Styled Components**: `styled-components` 依赖
- **Emotion**: `@emotion/react` 依赖

### 组件提取

扫描 `src/components/` 目录：
1. 提取所有导出的组件
2. 分析 Props 定义
3. 提取 JSDoc 注释作为组件说明
4. 识别组件分类（布局/表单/数据展示等）

### 最佳实践总结

基于代码分析：
1. **命名规范**: 统计文件/函数命名模式
2. **导入顺序**: 分析常见的 import 顺序
3. **代码组织**: 识别常见的文件结构模式
4. **错误处理**: 提取 try-catch 模式
5. **类型使用**: TypeScript 类型定义习惯

## 使用示例

### 场景 1: 新人入职第一天

```bash
# 新人克隆项目后
git clone https://github.com/company/project.git
cd project

# 与 AI 对话
```

**用户**: "帮我生成这个项目的入门指南"

**AI 执行**:
```javascript
await mcp.callTool('analyze_and_generate_guide', {
  projectPath: process.cwd()
});
```

**结果**: 生成 `PROJECT_GUIDE.md`，新人可以快速了解项目

### 场景 2: 添加新页面

**用户**: "我想添加一个用户设置页面"

**AI 工作流**:
1. 调用 `get_contextual_help` 获取相关上下文
2. 调用 `read_project_guide` 读取"路由配置"和"常用组件库"章节
3. 基于指南生成符合项目规范的代码
4. 询问用户是否记录这个案例

**用户**: "是的，记录下来"

**AI 执行**:
```javascript
await mcp.callTool('add_use_case', {
  title: '添加用户设置页面',
  description: '创建用户个人信息设置页面',
  steps: [...],
  code: '...',
  notes: '...'
});
```

### 场景 3: 更新过时文档

**用户**: "项目升级到 Next.js 14 了，路由配置方式变了"

**AI 执行**:
```javascript
await mcp.callTool('update_guide_section', {
  section: '路由配置',
  content: '新的 App Router 配置方式...',
  mode: 'replace'
});
```

## 扩展方向

### 未来可能的功能

1. **团队协作**
   - 多人共同维护指南
   - 案例评审和优化
   - 最佳实践投票

2. **智能推荐**
   - 基于任务自动推荐相关案例
   - 识别代码反模式并建议改进
   - 根据项目演进自动更新指南

3. **可视化**
   - 项目结构图
   - 依赖关系图
   - 组件使用热力图

4. **跨项目学习**
   - 从多个项目中提取通用最佳实践
   - 建立团队级别的知识库
   - 自动同步优秀实践到新项目

## 成功指标

1. **新人上手时间**: 从 3 天降低到 1 天
2. **代码一致性**: 新增代码符合项目规范的比例 > 90%
3. **重复问题**: 相同问题咨询次数降低 70%
4. **开发效率**: 完成标准需求的时间减少 50%

## 技术栈

- **语言**: JavaScript (ES Modules)
- **MCP SDK**: `@modelcontextprotocol/sdk`
- **文件操作**: Node.js `fs/promises`
- **代码解析**: 
  - `@babel/parser` - JavaScript/TypeScript AST 解析
  - `acorn` - 轻量级 JS 解析器
- **Markdown 处理**: `marked` 或手动解析
- **模式匹配**: `fast-glob`

## 项目里程碑

### Milestone 1: MVP (2 周)
- [x] 基础 MCP 服务器
- [ ] `analyze_and_generate_guide` 基础版
- [ ] `read_project_guide`
- [ ] 支持 Next.js 项目

### Milestone 2: 完整功能 (4 周)
- [ ] 完善指南生成（所有章节）
- [ ] `add_use_case` 和 `update_guide_section`
- [ ] 支持 React/Vue 项目
- [ ] 基础的模式检测

### Milestone 3: 智能化 (6 周)
- [ ] `detect_project_patterns` 深度分析
- [ ] `get_contextual_help` 智能推荐
- [ ] 多项目支持
- [ ] 完善文档和示例

## 开发规范

### 代码组织

```
src/
├── main.js                 # MCP 服务器入口
├── tools/                  # 工具实现
│   ├── guideGenerator.js   # 指南生成
│   ├── guideManager.js     # 指南管理
│   ├── patternDetector.js  # 模式检测
│   └── contextHelper.js    # 上下文辅助
├── analyzers/              # 分析器
│   ├── projectAnalyzer.js  # 项目整体分析
│   ├── routeAnalyzer.js    # 路由分析
│   ├── stateAnalyzer.js    # 状态管理分析
│   └── componentAnalyzer.js # 组件分析
└── utils/                  # 工具函数
    ├── fileUtils.js        # 文件操作
    ├── astUtils.js         # AST 解析
    └── markdownUtils.js    # Markdown 处理
```

### 错误处理

所有工具必须返回结构化错误：

```javascript
{
  success: false,
  error: {
    code: 'FILE_NOT_FOUND',
    message: '找不到项目根目录',
    details: { path: '/invalid/path' }
  }
}
```

### 测试

每个工具需要单元测试：
- 正常流程测试
- 边界情况测试
- 错误处理测试

## 总结

这个 MCP 的核心价值是**将项目知识自动化提取和结构化**，让 AI 能够：
1. 快速理解项目规范
2. 生成符合项目风格的代码
3. 持续积累和传承经验

最终目标是让新人通过与 AI 对话就能高效完成开发工作，而不需要反复向老员工请教。