import { ensureDir, slugify, scanMarkdownFiles } from '../utils/docUtils.js';
import { fileExists } from '../utils/fileUtils.js';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * 添加个人代码片段
 */
export async function addPersonalSnippet(projectPath, snippet) {
  const { category, title, description, code, language = 'typescript', tags = [], notes } = snippet;

  const vscodeDir = path.join(projectPath, '.vscode');
  const snippetsDir = path.join(vscodeDir, 'snippets', category);
  
  await ensureDir(snippetsDir);

  // 生成文件名：slug.md
  const slug = slugify(title);
  const fileName = `${slug}.md`;
  const filePath = path.join(snippetsDir, fileName);

  // 生成片段内容
  const content = `# ${title}

**分类**: ${getCategoryName(category)}  
**描述**: ${description}  
${tags.length > 0 ? `**标签**: ${tags.join(', ')}  \n` : ''}
**添加时间**: ${new Date().toISOString().split('T')[0]}

---

## 代码

\`\`\`${language}
${code}
\`\`\`

${notes ? `## 使用说明\n\n${notes}\n` : ''}

---

[返回个人笔记](../PERSONAL_NOTES.md)
`;

  await fs.writeFile(filePath, content, 'utf-8');

  // 更新主索引
  await updatePersonalNotesIndexWithCore(vscodeDir);

  const indexPath = path.join(vscodeDir, 'PERSONAL_NOTES.md');

  return { 
    success: true, 
    filePath: filePath,
    indexPath: indexPath,
  };
}

/**
 * 读取个人笔记
 */
export async function readPersonalNotes(projectPath, category) {
  const vscodeDir = path.join(projectPath, '.vscode');
  const notesPath = path.join(vscodeDir, 'PERSONAL_NOTES.md');
  
  if (!await fileExists(notesPath)) {
    return {
      exists: false,
      path: notesPath,
      content: null,
    };
  }

  // 如果指定了分类，读取该分类下的所有片段
  if (category) {
    const categoryDir = path.join(vscodeDir, 'snippets', category);
    if (!await fileExists(categoryDir)) {
      return {
        exists: true,
        path: categoryDir,
        content: `分类 "${getCategoryName(category)}" 下暂无片段\n`,
      };
    }

    const files = await scanMarkdownFiles(categoryDir);
    
    if (files.length === 0) {
      return {
        exists: true,
        path: categoryDir,
        content: `分类 "${getCategoryName(category)}" 下暂无片段\n`,
      };
    }

    // 返回该分类下所有片段的列表
    let content = `# ${getCategoryName(category)}\n\n`;
    for (const file of files) {
      content += `- [${file.title}](./snippets/${category}/${file.name})\n`;
    }
    
    return { exists: true, path: categoryDir, content };
  }

  // 读取主索引
  const content = await fs.readFile(notesPath, 'utf-8');
  return { exists: true, path: notesPath, content };
}

/**
 * 搜索个人片段
 */
export async function searchPersonalSnippets(projectPath, keyword) {
  const vscodeDir = path.join(projectPath, '.vscode');
  const snippetsDir = path.join(vscodeDir, 'snippets');
  
  if (!await fileExists(snippetsDir)) {
    return { 
      exists: false,
      keyword,
      results: [],
      count: 0,
      message: '个人笔记尚未创建，添加第一个片段后将自动创建',
    };
  }

  const results = [];
  const categories = ['component', 'function', 'hook', 'style', 'tip', 'solution'];

  // 搜索所有分类
  for (const category of categories) {
    const categoryDir = path.join(snippetsDir, category);
    if (!await fileExists(categoryDir)) continue;

    const files = await scanMarkdownFiles(categoryDir);
    
    for (const file of files) {
      const filePath = path.join(categoryDir, file.name);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // 搜索标题、描述和代码内容
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        results.push({
          title: file.title,
          category: getCategoryName(category),
          path: `./snippets/${category}/${file.name}`,
          filePath,
        });
      }
    }
  }

  return { 
    exists: true,
    keyword,
    results, 
    count: results.length,
  };
}

/**
 * 列出所有个人片段概要
 */
export async function listPersonalSnippets(projectPath) {
  const vscodeDir = path.join(projectPath, '.vscode');
  const snippetsDir = path.join(vscodeDir, 'snippets');
  
  if (!await fileExists(snippetsDir)) {
    return { 
      exists: false,
      categories: [], 
      totalCount: 0,
      message: '个人笔记不存在，添加第一个片段后将自动创建',
    };
  }

  const categories = [];
  const categoryTypes = ['component', 'function', 'hook', 'style', 'tip', 'solution'];
  let totalCount = 0;

  for (const category of categoryTypes) {
    const categoryDir = path.join(snippetsDir, category);
    if (!await fileExists(categoryDir)) {
      categories.push({
        name: getCategoryName(category),
        type: category,
        count: 0,
        snippets: [],
      });
      continue;
    }

    const files = await scanMarkdownFiles(categoryDir);
    totalCount += files.length;

    categories.push({
      name: getCategoryName(category),
      type: category,
      count: files.length,
      snippets: files.map(f => ({
        title: f.title,
        path: `./snippets/${category}/${f.name}`,
      })),
    });
  }

  return { 
    exists: true,
    categories, 
    totalCount,
  };
}

/**
 * 更新个人笔记主索引
 */
async function updatePersonalNotesIndex(vscodeDir) {
  const snippetsDir = path.join(vscodeDir, 'snippets');
  const indexPath = path.join(vscodeDir, 'PERSONAL_NOTES.md');

  const categories = [];
  const categoryTypes = ['component', 'function', 'hook', 'style', 'tip', 'solution'];
  
  for (const category of categoryTypes) {
    const categoryDir = path.join(snippetsDir, category);
    if (!await fileExists(categoryDir)) {
      categories.push({
        name: getCategoryName(category),
        type: category,
        count: 0,
        files: [],
      });
      continue;
    }

    const files = await scanMarkdownFiles(categoryDir);
    
    categories.push({
      name: getCategoryName(category),
      type: category,
      count: files.length,
      files: files.map(f => ({
        title: f.title,
        path: `./snippets/${category}/${f.name}`,
      })),
    });
  }

  // 生成索引内容
  let content = `# 个人开发笔记

> 记录个人收集的代码片段、工具函数、组件等

## 📚 分类导航

`;

  for (const cat of categories) {
    content += `### ${cat.name} (${cat.count})\n\n`;
    if (cat.files.length === 0) {
      content += `_暂无片段_\n\n`;
    } else {
      cat.files.forEach(file => {
        content += `- [${file.title}](${file.path})\n`;
      });
      content += '\n';
    }
  }

  content += `---\n\n`;
  content += `**总计**: ${categories.reduce((sum, c) => sum + c.count, 0)} 个片段\n\n`;
  content += `*最后更新: ${new Date().toISOString().split('T')[0]}*\n`;

  await fs.writeFile(indexPath, content, 'utf-8');
}

/**
 * 设置核心必读内容
 */
export async function setCoreGuidelines(projectPath, content) {
  const vscodeDir = path.join(projectPath, '.vscode');
  const coreFilePath = path.join(vscodeDir, 'CORE_GUIDELINES.md');
  
  await ensureDir(vscodeDir);

  // 生成核心必读内容
  const fullContent = `# 🚨 核心必读 - 代码生成强制规范

> **重要提示**: AI 在生成任何代码之前，必须先阅读本文档！
> 
> 本文档包含项目的核心开发规范和强制要求，违反这些规范将导致代码不可用。

---

## 📋 核心规范

${content}

---

*最后更新: ${new Date().toISOString().split('T')[0]}*

**使用说明**:
- 此文档由开发者手动维护
- AI 必须在生成代码前完整阅读
- 与 PROJECT_GUIDE.md 配合使用，本文档优先级更高
`;

  await fs.writeFile(coreFilePath, fullContent, 'utf-8');

  // 更新个人笔记索引，添加核心必读链接
  await updatePersonalNotesIndexWithCore(vscodeDir);

  return {
    success: true,
    filePath: coreFilePath,
    message: '核心必读内容已设置',
  };
}

/**
 * 读取核心必读内容
 */
export async function readCoreGuidelines(projectPath) {
  const vscodeDir = path.join(projectPath, '.vscode');
  const coreFilePath = path.join(vscodeDir, 'CORE_GUIDELINES.md');
  
  if (!await fileExists(coreFilePath)) {
    return {
      exists: false,
      path: coreFilePath,
      content: null,
      message: '核心必读文档尚未创建，建议使用 set_core_guidelines 工具创建',
    };
  }

  const content = await fs.readFile(coreFilePath, 'utf-8');
  return {
    exists: true,
    path: coreFilePath,
    content,
  };
}

/**
 * 更新个人笔记索引（包含核心必读）
 */
async function updatePersonalNotesIndexWithCore(vscodeDir) {
  const snippetsDir = path.join(vscodeDir, 'snippets');
  const indexPath = path.join(vscodeDir, 'PERSONAL_NOTES.md');
  const coreFilePath = path.join(vscodeDir, 'CORE_GUIDELINES.md');
  const hasCoreGuidelines = await fileExists(coreFilePath);

  const categories = [];
  const categoryTypes = ['component', 'function', 'hook', 'style', 'tip', 'solution'];
  
  for (const category of categoryTypes) {
    const categoryDir = path.join(snippetsDir, category);
    if (!await fileExists(categoryDir)) {
      categories.push({
        name: getCategoryName(category),
        type: category,
        count: 0,
        files: [],
      });
      continue;
    }

    const files = await scanMarkdownFiles(categoryDir);
    
    categories.push({
      name: getCategoryName(category),
      type: category,
      count: files.length,
      files: files.map(f => ({
        title: f.title,
        path: `./snippets/${category}/${f.name}`,
      })),
    });
  }

  // 生成索引内容
  let content = `# 个人开发笔记

> 记录个人收集的代码片段、工具函数、组件等

`;

  // 如果存在核心必读，优先显示
  if (hasCoreGuidelines) {
    content += `## 🚨 核心必读（优先级最高）

⚠️ **重要**: AI 生成代码前必须先阅读此文档！

- [**核心必读 - 代码生成强制规范**](./CORE_GUIDELINES.md) ⭐

---

`;
  }

  content += `## 📚 分类导航

`;

  for (const cat of categories) {
    content += `### ${cat.name} (${cat.count})\n\n`;
    if (cat.files.length === 0) {
      content += `_暂无片段_\n\n`;
    } else {
      cat.files.forEach(file => {
        content += `- [${file.title}](${file.path})\n`;
      });
      content += '\n';
    }
  }

  content += `---\n\n`;
  content += `**总计**: ${categories.reduce((sum, c) => sum + c.count, 0)} 个片段\n\n`;
  content += `*最后更新: ${new Date().toISOString().split('T')[0]}*\n`;

  await fs.writeFile(indexPath, content, 'utf-8');
}

/**
 * 获取分类中文名称
 */
function getCategoryName(category) {
  const names = {
    component: '组件',
    function: '工具函数',
    hook: 'Hooks',
    style: '样式',
    tip: '技巧',
    solution: '问题解决',
  };
  return names[category] || category;
}
