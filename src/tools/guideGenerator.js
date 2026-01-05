import { 
  analyzeProjectType, 
  analyzeRouting, 
  analyzeStateManagement,
  analyzeStyling,
  analyzeComponents,
  analyzeApiPattern 
} from '../analyzers/projectAnalyzer.js';
import { getDirectoryTree, formatTreeToMarkdown, fileExists } from '../utils/fileUtils.js';
import { ensureDir, slugify, getDateString, scanMarkdownFiles } from '../utils/docUtils.js';
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

  analysis.routing = await analyzeRouting(projectPath, analysis.project.type);
  analysis.structure = await getDirectoryTree(projectPath, {
    maxDepth: 3,
    ignore: ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'],
  });

  // 创建目录结构
  const vscodeDir = path.join(projectPath, '.vscode');
  const guidesDir = path.join(vscodeDir, 'guides');
  const useCasesDir = path.join(guidesDir, 'use-cases');
  
  await ensureDir(guidesDir);
  await ensureDir(useCasesDir);

  // 生成各个专题文件
  await generateOverviewFile(guidesDir, analysis);
  await generateRoutingFile(guidesDir, analysis);
  await generateStateFile(guidesDir, analysis);
  await generateStylingFile(guidesDir, analysis);
  await generateComponentsFile(guidesDir, analysis);
  await generateApiFile(guidesDir, analysis);
  await generateGuidelinesFile(guidesDir, analysis);
  await generateCommandsFile(guidesDir, analysis);
  await generateUseCasesIndex(useCasesDir);

  // 生成主索引文件
  await generateMainIndex(vscodeDir);

  return {
    success: true,
    guidePath: path.join(vscodeDir, 'PROJECT_GUIDE.md'),
    analysis,
  };
}

/**
 * 生成主索引文件
 */
async function generateMainIndex(vscodeDir) {
  const content = `# 项目开发指南

> 快速导航到各个主题

## 📖 目录

- [项目概览](./guides/overview.md) - 技术栈、目录结构
- [路由系统](./guides/routing.md) - 路由配置和使用
- [状态管理](./guides/state.md) - 状态管理方案
- [样式方案](./guides/styling.md) - CSS/样式规范
- [组件库](./guides/components.md) - 常用组件
- [API 调用](./guides/api.md) - API 请求模式
- [开发规范](./guides/guidelines.md) - 代码规范
- [常用命令](./guides/commands.md) - npm scripts
- [实际用例](./guides/use-cases/README.md) - 开发案例

## 🔍 使用方法

1. **新人入门**：按顺序阅读项目概览 → 路由 → 状态管理 → 样式方案
2. **查找规范**：直接点击相关主题链接
3. **参考案例**：查看实际用例了解常见开发模式

---

*此文档由 MCP 项目分析工具自动生成*  
*最后更新: ${new Date().toISOString().split('T')[0]}*
`;

  await fs.writeFile(path.join(vscodeDir, 'PROJECT_GUIDE.md'), content, 'utf-8');
}

/**
 * 生成项目概览文件
 */
async function generateOverviewFile(guidesDir, analysis) {
  const content = `# 项目概览

**项目名称**: ${analysis.project.name || 'Unknown'}  
**框架**: ${analysis.project.framework} ${analysis.project.version || ''}  
**最后更新**: ${new Date().toISOString().split('T')[0]}

---

## 技术栈

- **框架**: ${analysis.project.framework || 'Unknown'}
- **路由**: ${analysis.routing.framework || '未检测到'}
- **状态管理**: ${analysis.state.primary || 'React Context/Props'}
- **样式方案**: ${analysis.styling.type || 'CSS'}
- **API 请求**: ${analysis.api.library || 'fetch API'}

${analysis.project.description ? `\n## 项目描述\n\n${analysis.project.description}\n` : ''}

## 目录结构

\`\`\`
${formatTreeToMarkdown(analysis.structure)}
\`\`\`

---

[返回主索引](../PROJECT_GUIDE.md)
`;

  await fs.writeFile(path.join(guidesDir, 'overview.md'), content, 'utf-8');
}

/**
 * 生成路由系统文件
 */
async function generateRoutingFile(guidesDir, analysis) {
  const { routing, project } = analysis;
  
  let content = `# 路由系统\n\n`;
  
  if (routing.framework) {
    content += `**使用方案**: ${routing.framework}\n`;
    content += `**路由位置**: \`${routing.location}\`\n`;
    content += `**路由模式**: ${routing.pattern || '标准路由'}\n\n`;
    
    if (routing.examples && routing.examples.length > 0) {
      content += `## 示例路由\n\n`;
      routing.examples.forEach(ex => content += `- \`${ex}\`\n`);
      content += '\n';
    }

    // 添加使用指南
    content += getRoutingGuide(project.type, routing);
  } else {
    content += `未检测到路由配置\n`;
  }

  content += `\n---\n\n[返回主索引](../PROJECT_GUIDE.md)`;
  
  await fs.writeFile(path.join(guidesDir, 'routing.md'), content, 'utf-8');
}

function getRoutingGuide(projectType, routing) {
  if (projectType === 'nextjs') {
    if (routing.framework?.includes('App Router')) {
      return `
## 创建新页面

\`\`\`bash
# 创建路由: /about
src/app/about/page.tsx

# 创建动态路由: /blog/[slug]
src/app/blog/[slug]/page.tsx
\`\`\`

## 页面组件模板

\`\`\`tsx
export default function Page() {
  return <div>页面内容</div>
}
\`\`\`
`;
    }
  }
  return '';
}

/**
 * 生成状态管理文件
 */
async function generateStateFile(guidesDir, analysis) {
  const { state } = analysis;
  
  let content = `# 状态管理\n\n`;
  content += `**主要方案**: ${state.primary}\n\n`;
  
  if (state.libraries.length > 0) {
    state.libraries.forEach(lib => {
      content += `## ${lib.name}\n\n`;
      content += `- 位置: \`${lib.location}\`\n\n`;
    });
  } else {
    content += `使用 React Context API 或组件 props 传递状态\n`;
  }

  content += `\n---\n\n[返回主索引](../PROJECT_GUIDE.md)`;
  
  await fs.writeFile(path.join(guidesDir, 'state.md'), content, 'utf-8');
}

/**
 * 生成样式方案文件
 */
async function generateStylingFile(guidesDir, analysis) {
  const { styling } = analysis;
  
  let content = `# 样式系统\n\n`;
  content += `**主要方案**: ${styling.type}\n\n`;
  
  if (styling.solutions.length > 0) {
    content += `## 可用方案\n\n`;
    styling.solutions.forEach(solution => {
      content += `- **${solution.name}**`;
      if (solution.config) {
        content += ` - 配置: \`${solution.config}\``;
      }
      content += '\n';
    });
  }

  content += `\n---\n\n[返回主索引](../PROJECT_GUIDE.md)`;
  
  await fs.writeFile(path.join(guidesDir, 'styling.md'), content, 'utf-8');
}

/**
 * 生成组件库文件
 */
async function generateComponentsFile(guidesDir, analysis) {
  const { components } = analysis;
  
  let content = `# 组件库\n\n`;
  
  if (components.location) {
    content += `**位置**: \`${components.location}\`\n`;
    content += `**组件数量**: ${components.count}\n\n`;
    
    if (components.components.length > 0) {
      content += `## 常用组件\n\n`;
      components.components.forEach(comp => {
        content += `- \`${comp.name}\` - \`${comp.path}\`\n`;
      });
    }
  } else {
    content += `未检测到组件目录\n`;
  }

  content += `\n---\n\n[返回主索引](../PROJECT_GUIDE.md)`;
  
  await fs.writeFile(path.join(guidesDir, 'components.md'), content, 'utf-8');
}

/**
 * 生成 API 调用文件
 */
async function generateApiFile(guidesDir, analysis) {
  const { api } = analysis;
  
  let content = `# API 调用\n\n`;
  content += `**方法**: ${api.method}\n`;
  
  if (api.location) {
    content += `**封装位置**: \`${api.location}\`\n`;
  }

  content += `\n---\n\n[返回主索引](../PROJECT_GUIDE.md)`;
  
  await fs.writeFile(path.join(guidesDir, 'api.md'), content, 'utf-8');
}

/**
 * 生成开发规范文件
 */
async function generateGuidelinesFile(guidesDir, analysis) {
  let content = `# 开发规范\n\n`;
  
  content += `## 文件命名\n\n`;
  content += `- 组件文件: PascalCase (如 \`Button.tsx\`)\n`;
  content += `- 工具函数: camelCase (如 \`formatDate.ts\`)\n`;
  content += `- 样式文件: kebab-case 或与组件同名\n\n`;

  content += `## 组件开发\n\n`;
  if (analysis.project.type === 'nextjs') {
    content += `- 优先使用 Server Components (默认)\n`;
    content += `- 需要交互时使用 \`'use client'\` 声明 Client Component\n`;
  } else {
    content += `- 使用函数式组件和 Hooks\n`;
  }
  content += `- Props 使用 TypeScript 定义类型\n`;
  content += `- 复杂组件拆分为子组件\n\n`;

  content += `## 状态管理\n\n`;
  if (analysis.state.primary !== 'React Context API') {
    content += `- 全局状态使用 ${analysis.state.primary}\n`;
    content += `- 局部状态使用 useState\n`;
  } else {
    content += `- 使用 useState 管理组件状态\n`;
    content += `- 跨层级传递使用 Context API\n`;
  }

  content += `\n---\n\n[返回主索引](../PROJECT_GUIDE.md)`;
  
  await fs.writeFile(path.join(guidesDir, 'guidelines.md'), content, 'utf-8');
}

/**
 * 生成常用命令文件
 */
async function generateCommandsFile(guidesDir, analysis) {
  let content = `# 常用命令\n\n`;
  
  if (analysis.project.scripts && Object.keys(analysis.project.scripts).length > 0) {
    content += `\`\`\`bash\n`;
    Object.entries(analysis.project.scripts).forEach(([name, cmd]) => {
      content += `# ${name}\n`;
      content += `npm run ${name}\n\n`;
    });
    content += `\`\`\`\n`;
  } else {
    content += `未检测到 npm scripts\n`;
  }

  content += `\n---\n\n[返回主索引](../PROJECT_GUIDE.md)`;
  
  await fs.writeFile(path.join(guidesDir, 'commands.md'), content, 'utf-8');
}

/**
 * 生成用例索引
 */
async function generateUseCasesIndex(useCasesDir) {
  const content = `# 实际用例

> 记录实际开发中的常见任务和解决方案

_暂无用例，使用 add_use_case 工具添加_

---

[返回主索引](../../PROJECT_GUIDE.md)
`;

  await fs.writeFile(path.join(useCasesDir, 'README.md'), content, 'utf-8');
}

/**
 * 读取项目指南
 */
export async function readProjectGuide(projectPath, section) {
  const vscodeDir = path.join(projectPath, '.vscode');
  const guidePath = path.join(vscodeDir, 'PROJECT_GUIDE.md');
  
  if (!await fileExists(guidePath)) {
    return {
      exists: false,
      path: guidePath,
      content: null,
    };
  }

  // 如果指定了章节，读取对应的文件
  if (section) {
    const sectionMap = {
      '项目概览': 'overview.md',
      '概览': 'overview.md',
      '路由系统': 'routing.md',
      '路由': 'routing.md',
      '状态管理': 'state.md',
      '状态': 'state.md',
      '样式方案': 'styling.md',
      '样式': 'styling.md',
      '组件库': 'components.md',
      '组件': 'components.md',
      'API调用': 'api.md',
      'API': 'api.md',
      '开发规范': 'guidelines.md',
      '规范': 'guidelines.md',
      '常用命令': 'commands.md',
      '命令': 'commands.md',
    };

    const fileName = sectionMap[section];
    if (fileName) {
      const filePath = path.join(vscodeDir, 'guides', fileName);
      if (await fileExists(filePath)) {
        const content = await fs.readFile(filePath, 'utf-8');
        return { exists: true, path: filePath, content };
      }
    }
  }

  // 读取主索引
  const content = await fs.readFile(guidePath, 'utf-8');
  return { exists: true, path: guidePath, content };
}

/**
 * 添加用例
 */
export async function addUseCaseToGuide(projectPath, useCase) {
  const vscodeDir = path.join(projectPath, '.vscode');
  const useCasesDir = path.join(vscodeDir, 'guides', 'use-cases');
  
  await ensureDir(useCasesDir);

  // 生成文件名：日期-slug.md
  const dateStr = getDateString();
  const slug = slugify(useCase.title);
  const fileName = `${dateStr}-${slug}.md`;
  const filePath = path.join(useCasesDir, fileName);

  // 生成用例内容
  const content = `# ${useCase.title}

**描述**: ${useCase.description}

${useCase.scenario ? `**场景**: ${useCase.scenario}\n` : ''}

## 解决方案

\`\`\`${useCase.language || 'typescript'}
${useCase.code}
\`\`\`

${useCase.notes ? `## 注意事项\n\n${useCase.notes}\n` : ''}

---

*添加时间: ${new Date().toISOString().split('T')[0]}*

[返回用例列表](./README.md) | [返回主索引](../../PROJECT_GUIDE.md)
`;

  await fs.writeFile(filePath, content, 'utf-8');

  // 更新索引
  await updateUseCasesIndex(useCasesDir);

  return { success: true, path: filePath };
}

/**
 * 更新用例索引
 */
async function updateUseCasesIndex(useCasesDir) {
  const files = await scanMarkdownFiles(useCasesDir);
  
  const items = files.map(file => ({
    title: file.title,
    path: `./${file.name}`,
  }));

  let content = `# 实际用例\n\n> 记录实际开发中的常见任务和解决方案\n\n`;
  
  if (items.length === 0) {
    content += `_暂无用例，使用 add_use_case 工具添加_\n`;
  } else {
    items.forEach(item => {
      content += `- [${item.title}](${item.path})\n`;
    });
  }
  
  content += `\n---\n\n[返回主索引](../../PROJECT_GUIDE.md)\n`;
  
  await fs.writeFile(path.join(useCasesDir, 'README.md'), content, 'utf-8');
}

/**
 * 更新指南章节
 */
export async function updateGuideSection(projectPath, sectionTitle, newContent) {
  const vscodeDir = path.join(projectPath, '.vscode');
  
  const sectionMap = {
    '项目概览': 'overview.md',
    '路由系统': 'routing.md',
    '状态管理': 'state.md',
    '样式方案': 'styling.md',
    '组件库': 'components.md',
    'API调用': 'api.md',
    '开发规范': 'guidelines.md',
    '常用命令': 'commands.md',
  };

  const fileName = sectionMap[sectionTitle];
  if (!fileName) {
    throw new Error(`未知的章节: ${sectionTitle}`);
  }

  const filePath = path.join(vscodeDir, 'guides', fileName);
  
  // 添加标题和返回链接
  let content = `# ${sectionTitle}\n\n${newContent}\n\n---\n\n[返回主索引](../PROJECT_GUIDE.md)`;
  
  await fs.writeFile(filePath, content, 'utf-8');

  return { success: true, path: filePath, section: sectionTitle };
}
