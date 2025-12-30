# Prompt 模板使用指南

## 🎯 什么是 Prompt 模板？

Prompt 模板是预设的对话流程，让你无需记忆复杂的工具调用，通过自然对话即可完成操作。

## 📋 7 个可用模板

### 1️⃣ onboard-project - 新项目完整入门 ⭐ 推荐

**使用场景**：刚接手一个新项目，想快速了解

**参数**：
- `projectPath`: 项目根目录路径（必填）

**AI 会做什么**：
1. 生成完整的项目指南（技术栈、目录结构、路由、状态管理等）
2. 分析代码模式（命名规范、文件组织、代码风格）
3. 总结项目核心信息
4. 给出快速上手建议

**示例对话**：
```
你: [选择 onboard-project 模板]
    项目路径: /Users/username/my-nextjs-app

AI: 好的！我来帮你完整分析这个项目...
    [执行 analyze_and_generate_guide]
    [执行 detect_project_patterns]
    
    项目分析完成！
    - 框架: Next.js 14 (App Router)
    - 状态管理: Zustand
    - 样式: Tailwind CSS
    - 代码规范: PascalCase 组件，camelCase 函数
    
    项目指南已生成到: .vscode/PROJECT_GUIDE.md
```

---

### 2️⃣ analyze-new-project - 生成项目指南

**使用场景**：只需要生成项目文档，不需要代码模式分析

**参数**：
- `projectPath`: 项目根目录路径（必填）

**示例对话**：
```
你: [选择 analyze-new-project 模板]
    项目路径: /Users/username/my-project

AI: 开始分析项目...
    ✅ 项目指南生成成功！
    📍 位置: .vscode/PROJECT_GUIDE.md
    
    接下来你可以：
    - 使用 check-project-guide 查看规范
    - 使用 record-use-case 记录开发用例
```

---

### 3️⃣ record-use-case - 记录开发用例

**使用场景**：刚完成一个功能，想记录实现过程

**参数**：
- `projectPath`: 项目根目录路径（必填）
- `feature`: 功能描述（可选）

**示例对话**：
```
你: [选择 record-use-case 模板]
    项目路径: /Users/username/my-project
    功能: 用户登录页面

AI: 请告诉我这个功能的实现步骤和关键代码

你: 1. 创建 src/app/login/page.tsx
    2. 使用 react-hook-form 处理表单
    3. 调用 /api/auth/login 接口
    
    关键代码：
    ```tsx
    export default function LoginPage() {
      const { register, handleSubmit } = useForm();
      // ...
    }
    ```

AI: 好的！我来记录到项目指南...
    [执行 add_use_case]
    ✅ 用例已添加到 .vscode/PROJECT_GUIDE.md
```

---

### 4️⃣ save-code-snippet - 保存代码片段

**使用场景**：写了一个优质的组件/函数/Hook，想保存复用

**参数**：
- `projectPath`: 项目根目录路径（必填）
- `category`: 片段类型（可选）

**示例对话**：
```
你: [选择 save-code-snippet 模板]
    项目路径: /Users/username/my-project
    类型: hook

AI: 请提供代码片段的信息：
    - 标题
    - 描述
    - 代码内容

你: 标题: useDebounce
    描述: 防抖 Hook，用于搜索输入等场景
    
    代码:
    ```typescript
    export function useDebounce<T>(value: T, delay: number) {
      const [debouncedValue, setDebouncedValue] = useState(value);
      useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
      }, [value, delay]);
      return debouncedValue;
    }
    ```

AI: 建议标签: react, hooks, performance, debounce
    [执行 add_personal_snippet]
    ✅ 代码片段已保存到 .vscode/PERSONAL_DEV_NOTES.md
```

---

### 5️⃣ find-code-snippet - 搜索代码片段

**使用场景**：需要之前写过的某种代码

**参数**：
- `projectPath`: 项目根目录路径（必填）
- `keyword`: 搜索关键词（可选）

**示例对话**：
```
你: [选择 find-code-snippet 模板]
    项目路径: /Users/username/my-project
    关键词: debounce

AI: 正在搜索 "debounce" 相关的代码片段...
    [执行 search_personal_snippets]
    
    找到 2 个相关片段：
    
    1️⃣ useDebounce Hook
       描述: 防抖 Hook，用于搜索输入等场景
       标签: react, hooks, performance
       
       代码:
       ```typescript
       export function useDebounce<T>(value: T, delay: number) {
         // ...
       }
       ```
    
    2️⃣ debounce 函数
       描述: 通用防抖函数
       标签: utility, performance
```

---

### 6️⃣ check-project-guide - 查看项目规范

**使用场景**：开发前想了解项目的某个规范

**参数**：
- `projectPath`: 项目根目录路径（必填）
- `topic`: 关注的主题（可选）

**示例对话**：
```
你: [选择 check-project-guide 模板]
    项目路径: /Users/username/my-project
    主题: 路由系统

AI: [执行 read_project_guide，提取路由相关章节]
    
    ### 路由系统规范
    
    **使用方案**: Next.js App Router
    **路由位置**: src/app
    **路由模式**: 文件系统路由
    
    **创建新页面**:
    ```bash
    # 创建 /about 页面
    src/app/about/page.tsx
    
    # 创建动态路由 /blog/[slug]
    src/app/blog/[slug]/page.tsx
    ```
    
    **最佳实践**:
    - 优先使用 Server Components
    - 需要交互时添加 'use client'
```

---

### 7️⃣ analyze-code-patterns - 分析代码模式

**使用场景**：想了解或统一项目的代码风格

**参数**：
- `projectPath`: 项目根目录路径（必填）

**示例对话**：
```
你: [选择 analyze-code-patterns 模板]
    项目路径: /Users/username/my-project

AI: 正在分析项目代码模式...
    [执行 detect_project_patterns]
    
    ### 代码规范总结
    
    **命名约定**:
    - 组件: PascalCase (如 Button.tsx)
    - 函数: camelCase (如 formatDate)
    - 常量: UPPER_SNAKE_CASE
    
    **文件组织**:
    - 按功能模块组织 (feature-based)
    - 组件目录: src/components
    
    **代码风格**:
    - 单引号
    - 使用分号
    - 2 空格缩进
    
    **常用模式**:
    - Hooks: useState, useEffect, useRouter
    - 导入顺序: React → 第三方库 → 本地组件
```

---

## 💡 使用技巧

### 1. 组合使用模板

**新项目标准流程**:
```
1. onboard-project        → 完整入门
2. check-project-guide    → 查看具体规范
3. record-use-case        → 完成功能后记录
```

### 2. 个人代码库积累

**持续积累流程**:
```
开发中写了好代码
  ↓
save-code-snippet        → 保存到个人笔记
  ↓
下次需要类似功能
  ↓
find-code-snippet        → 搜索并复用
```

### 3. 团队协作

**团队最佳实践**:
```
新成员入职
  ↓
onboard-project          → 快速了解项目
  ↓
开发过程中
  ↓
check-project-guide      → 随时查看规范
  ↓
完成功能
  ↓
record-use-case          → 记录到团队知识库
```

---

## 🆚 Prompt vs 直接调用工具

### 使用 Prompt 模板（推荐新手）
✅ 自然对话，无需记忆命令  
✅ AI 引导完成流程  
✅ 自动处理多个步骤  
✅ 提供上下文建议  

### 直接调用工具（适合高级用户）
✅ 精确控制参数  
✅ 适合自动化脚本  
✅ 批量操作  

---

## 📚 相关文档

- [README.md](./README.md) - 完整功能文档
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - 快速参考
- [PROJECT_PLAN.md](./PROJECT_PLAN.md) - 项目规划
