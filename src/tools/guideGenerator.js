import { 
  analyzeProjectType, 
  analyzeRouting, 
  analyzeStateManagement,
  analyzeStyling,
  analyzeComponents,
  analyzeApiPattern 
} from '../analyzers/projectAnalyzer.js';
import { getDirectoryTree, formatTreeToMarkdown, fileExists } from '../utils/fileUtils.js';
import { ensureDir, slugify, getDateString, updateIndexFile, scanMarkdownFiles } from '../utils/docUtils.js';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * 生成项目指南（分散文件结构）
 */
export async function generateProjectGuide(projectPath) {
  const analysis = {
    project: await analyzeProjectType(projectPath),
    routing: null,
    state: await analyzeStateManagement(projectPath),
    styling: await analyzeStyling(projectPath),
    components: await analyzeComponents(projectPath),
    api: await analyzeApiPattern(projectPath),
    structure: null,
  };

  // 分析路由需要项目类型信息
  analysis.routing = await analyzeRouting(projectPath, analysis.project.type);

  // 获取目录结构
  analysis.structure = await getDirectoryTree(projectPath, {
    maxDepth: 3,
    ignore: ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'],
  });

  // 生成 Markdown
  const markdown = buildMarkdownContent(analysis, projectPath);

  return {
    content: markdown,
    analysis,
  };
}

/**
 * 构建 Markdown 内容
 */
function buildMarkdownContent(analysis, projectPath) {
  const sections = [];

  // 标题和概述
  sections.push(`# PROJECT GUIDE\n`);
  sections.push(`> 自动生成的项目开发指南，帮助 AI 快速理解项目结构和开发规范\n`);
  sections.push(`**项目名称**: ${analysis.project.name || 'Unknown'}`);
  sections.push(`**框架**: ${analysis.project.framework} ${analysis.project.version || ''}`);
  sections.push(`**最后更新**: ${new Date().toISOString().split('T')[0]}\n`);

  sections.push(`---\n`);

  // 1. 项目概览
  sections.push(`## 1. 项目概览\n`);
  if (analysis.project.description) {
    sections.push(`${analysis.project.description}\n`);
  }
  
  sections.push(`### 技术栈\n`);
  sections.push(`- **框架**: ${analysis.project.framework || 'Unknown'}`);
  sections.push(`- **路由**: ${analysis.routing.framework || '未检测到'}`);
  sections.push(`- **状态管理**: ${analysis.state.primary || 'React Context/Props'}`);
  sections.push(`- **样式方案**: ${analysis.styling.type || 'CSS'}`);
  sections.push(`- **API 请求**: ${analysis.api.library || 'fetch API'}\n`);

  // 2. 目录结构
  sections.push(`## 2. 目录结构\n`);
  sections.push('```');
  sections.push(formatTreeToMarkdown(analysis.structure));
  sections.push('```\n');

  // 3. 核心概念
  sections.push(`## 3. 核心概念\n`);

  // 路由
  sections.push(`### 3.1 路由系统\n`);
  if (analysis.routing.framework) {
    sections.push(`**使用方案**: ${analysis.routing.framework}`);
    sections.push(`**路由位置**: \`${analysis.routing.location}\``);
    sections.push(`**路由模式**: ${analysis.routing.pattern || '标准路由'}\n`);
    
    if (analysis.routing.examples && analysis.routing.examples.length > 0) {
      sections.push(`**示例路由**:`);
      analysis.routing.examples.forEach(ex => sections.push(`- \`${ex}\``));
      sections.push('');
    }

    // 添加使用指南
    sections.push(getRoutingGuide(analysis.project.type, analysis.routing));
  } else {
    sections.push(`未检测到路由配置\n`);
  }

  // 状态管理
  sections.push(`### 3.2 状态管理\n`);
  if (analysis.state.libraries.length > 0) {
    sections.push(`**主要方案**: ${analysis.state.primary}\n`);
    analysis.state.libraries.forEach(lib => {
      sections.push(`#### ${lib.name}`);
      sections.push(`- 位置: \`${lib.location}\``);
      sections.push('');
    });
  } else {
    sections.push(`使用 React Context API 或组件 props 传递状态\n`);
  }

  // 样式系统
  sections.push(`### 3.3 样式系统\n`);
  sections.push(`**主要方案**: ${analysis.styling.type}\n`);
  if (analysis.styling.solutions.length > 0) {
    analysis.styling.solutions.forEach(solution => {
      sections.push(`- **${solution.name}**${solution.config ? ` - 配置: \`${solution.config}\`` : ''}`);
    });
    sections.push('');
  }

  // 组件
  sections.push(`### 3.4 组件库\n`);
  if (analysis.components.location) {
    sections.push(`**位置**: \`${analysis.components.location}\``);
    sections.push(`**组件数量**: ${analysis.components.count}\n`);
    
    if (analysis.components.components.length > 0) {
      sections.push(`**常用组件**:`);
      analysis.components.components.forEach(comp => {
        sections.push(`- \`${comp.name}\` - \`${comp.path}\``);
      });
      sections.push('');
    }
  } else {
    sections.push(`未检测到组件目录\n`);
  }

  // API 调用
  sections.push(`### 3.5 API 调用\n`);
  sections.push(`**方法**: ${analysis.api.method}`);
  if (analysis.api.location) {
    sections.push(`**封装位置**: \`${analysis.api.location}\``);
  }
  sections.push('');

  // 4. 开发规范
  sections.push(`## 4. 开发规范\n`);
  sections.push(getDevelopmentGuidelines(analysis));

  // 5. 常用命令
  sections.push(`## 5. 常用命令\n`);
  if (analysis.project.scripts && Object.keys(analysis.project.scripts).length > 0) {
    sections.push('```bash');
    Object.entries(analysis.project.scripts).forEach(([name, cmd]) => {
      sections.push(`# ${name}`);
      sections.push(`npm run ${name}`);
      sections.push('');
    });
    sections.push('```\n');
  }

  // 6. 实际用例
  sections.push(`## 6. 实际用例\n`);
  sections.push(`### 用例列表\n`);
  sections.push(`> 记录实际开发中的常见任务和解决方案\n`);
  sections.push(`_使用 add_use_case 工具添加实际用例_\n`);

  sections.push(`---`);
  sections.push(`\n*此文档由 MCP 项目分析工具自动生成*`);

  return sections.join('\n');
}

/**
 * 获取路由使用指南
 */
function getRoutingGuide(projectType, routing) {
  if (projectType === 'nextjs') {
    if (routing.framework?.includes('App Router')) {
      return `
**创建新页面**:
\`\`\`bash
# 创建路由: /about
src/app/about/page.tsx

# 创建动态路由: /blog/[slug]
src/app/blog/[slug]/page.tsx
\`\`\`

**页面组件模板**:
\`\`\`tsx
export default function Page() {
  return <div>页面内容</div>
}
\`\`\`
`;
    } else {
      return `
**创建新页面**:
\`\`\`bash
# 创建路由: /about
${routing.location}/about.tsx

# 创建动态路由: /blog/[id]
${routing.location}/blog/[id].tsx
\`\`\`
`;
    }
  }

  if (routing.framework === 'React Router') {
    return `
**添加新路由**:
1. 在 \`${routing.location}\` 中配置路由
2. 创建对应的页面组件
3. 导入并添加到路由配置中
`;
  }

  return '';
}

/**
 * 生成开发规范指南
 */
function getDevelopmentGuidelines(analysis) {
  const guidelines = [];

  guidelines.push(`### 文件命名`);
  guidelines.push(`- 组件文件: PascalCase (如 \`Button.tsx\`)`);
  guidelines.push(`- 工具函数: camelCase (如 \`formatDate.ts\`)`);
  guidelines.push(`- 样式文件: kebab-case 或与组件同名\n`);

  guidelines.push(`### 组件开发`);
  if (analysis.project.type === 'nextjs') {
    guidelines.push(`- 优先使用 Server Components (默认)`);
    guidelines.push(`- 需要交互时使用 \`'use client'\` 声明 Client Component`);
  } else {
    guidelines.push(`- 使用函数式组件和 Hooks`);
  }
  guidelines.push(`- Props 使用 TypeScript 定义类型`);
  guidelines.push(`- 复杂组件拆分为子组件\n`);

  guidelines.push(`### 状态管理`);
  if (analysis.state.primary !== 'React Context API') {
    guidelines.push(`- 全局状态使用 ${analysis.state.primary}`);
    guidelines.push(`- 局部状态使用 useState`);
  } else {
    guidelines.push(`- 使用 useState 管理组件状态`);
    guidelines.push(`- 跨层级传递使用 Context API`);
  }
  guidelines.push('');

  guidelines.push(`### 样式规范`);
  if (analysis.styling.type === 'Tailwind CSS') {
    guidelines.push(`- 使用 Tailwind 工具类`);
    guidelines.push(`- 避免内联样式`);
    guidelines.push(`- 复用样式定义到 components`);
  }
  guidelines.push('');

  return guidelines.join('\n');
}

/**
 * 将指南写入文件
 */
export async function writeGuideToFile(projectPath, content) {
  const vscodeDir = path.join(projectPath, '.vscode');
  // 确保 .vscode 目录存在
  if (!await fileExists(vscodeDir)) {
    await fs.mkdir(vscodeDir, { recursive: true });
  }
  const guidePath = path.join(vscodeDir, 'PROJECT_GUIDE.md');
  await fs.writeFile(guidePath, content, 'utf-8');
  return guidePath;
}

/**
 * 读取项目指南
 */
export async function readProjectGuide(projectPath) {
  const guidePath = path.join(projectPath, '.vscode', 'PROJECT_GUIDE.md');
  
  if (!await fileExists(guidePath)) {
    return {
      exists: false,
      path: guidePath,
      content: null,
    };
  }

  const content = await fs.readFile(guidePath, 'utf-8');
  
  return {
    exists: true,
    path: guidePath,
    content,
  };
}

/**
 * 添加用例到指南
 */
export async function addUseCaseToGuide(projectPath, useCase) {
  const guide = await readProjectGuide(projectPath);
  
  if (!guide.exists) {
    throw new Error('.vscode/PROJECT_GUIDE.md 不存在，请先运行 analyze_and_generate_guide');
  }

  // 查找用例部分
  const useCaseSection = '## 6. 实际用例';
  const useCaseIndex = guide.content.indexOf(useCaseSection);
  
  if (useCaseIndex === -1) {
    throw new Error('无法找到用例部分');
  }

  // 生成用例内容
  const timestamp = new Date().toISOString().split('T')[0];
  const useCaseContent = `
### ${useCase.title}

**描述**: ${useCase.description}

**场景**: ${useCase.scenario || '常规开发'}

**解决方案**:
\`\`\`${useCase.language || 'typescript'}
${useCase.code}
\`\`\`

${useCase.notes ? `**注意事项**: ${useCase.notes}\n` : ''}
**添加时间**: ${timestamp}

---
`;

  // 找到插入位置（在 "用例列表" 标题之后）
  const insertMarker = '_使用 add_use_case 工具添加实际用例_\n';
  const insertIndex = guide.content.indexOf(insertMarker);
  
  if (insertIndex === -1) {
    // 如果找不到标记，就在用例部分末尾添加
    const nextSectionIndex = guide.content.indexOf('---', useCaseIndex + useCaseSection.length);
    const insertPosition = nextSectionIndex > 0 ? nextSectionIndex : guide.content.length;
    
    const updatedContent = 
      guide.content.slice(0, insertPosition) + 
      useCaseContent + 
      guide.content.slice(insertPosition);
    
    await fs.writeFile(guide.path, updatedContent, 'utf-8');
  } else {
    const insertPosition = insertIndex + insertMarker.length;
    const updatedContent = 
      guide.content.slice(0, insertPosition) + 
      useCaseContent + 
      guide.content.slice(insertPosition);
    
    await fs.writeFile(guide.path, updatedContent, 'utf-8');
  }

  return {
    success: true,
    path: guide.path,
  };
}

/**
 * 更新指南的特定章节
 */
export async function updateGuideSection(projectPath, sectionTitle, newContent) {
  const guide = await readProjectGuide(projectPath);
  
  if (!guide.exists) {
    throw new Error('.vscode/PROJECT_GUIDE.md 不存在，请先运行 analyze_and_generate_guide');
  }

  // 查找章节标题（支持 ## 和 ### 级别）
  const sectionRegex = new RegExp(
    `(###?\\s+\\d*\\.?\\d*\\s*${sectionTitle}[^\n]*\n)([\\s\\S]*?)(?=\n##|$)`,
    'i'
  );

  const match = guide.content.match(sectionRegex);
  
  if (!match) {
    throw new Error(`未找到章节: ${sectionTitle}`);
  }

  const [fullMatch, header, oldContent] = match;
  const timestamp = new Date().toISOString().split('T')[0];
  
  // 添加更新时间标记
  const updatedContent = `${header}${newContent}\n\n_最后更新: ${timestamp}_\n`;
  
  const newGuideContent = guide.content.replace(fullMatch, updatedContent);
  
  await fs.writeFile(guide.path, newGuideContent, 'utf-8');

  return {
    success: true,
    path: guide.path,
    section: sectionTitle,
  };
}
