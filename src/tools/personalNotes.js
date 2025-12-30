import fs from 'node:fs/promises';
import path from 'node:path';
import { fileExists } from '../utils/fileUtils.js';

/**
 * 初始化个人开发笔记文件
 */
async function initPersonalNotes(projectPath) {
  const vscodeDir = path.join(projectPath, '.vscode');
  // 确保 .vscode 目录存在
  if (!await fileExists(vscodeDir)) {
    await import('node:fs/promises').then(m => m.default.mkdir(vscodeDir, { recursive: true }));
  }
  const notesPath = path.join(vscodeDir, 'PERSONAL_DEV_NOTES.md');
  
  if (await fileExists(notesPath)) {
    return notesPath;
  }

  const initialContent = `# 个人开发笔记

> 记录开发过程中积累的优质组件、工具函数、技巧等

**创建时间**: ${new Date().toISOString().split('T')[0]}

---

## 📦 常用组件

_记录可复用的优质组件_

---

## 🛠️ 工具函数

_记录通用的工具函数_

---

## 🎣 自定义 Hooks

_记录自定义的 React Hooks_

---

## 🎨 样式方案

_记录常用的样式技巧和方案_

---

## 💡 开发技巧

_记录开发过程中的小技巧和最佳实践_

---

## 🐛 问题解决方案

_记录遇到的问题及解决方案_

---

*此文档用于个人开发经验积累，与 PROJECT_GUIDE.md 互补*
`;

  await fs.writeFile(notesPath, initialContent, 'utf-8');
  return notesPath;
}

/**
 * 添加代码片段到个人笔记
 */
export async function addPersonalSnippet(projectPath, snippet) {
  const notesPath = await initPersonalNotes(projectPath);
  let content = await fs.readFile(notesPath, 'utf-8');

  const { category, title, description, code, language = 'typescript', tags = [], notes } = snippet;

  // 确定分类对应的章节
  const categoryMapping = {
    'component': '## 📦 常用组件',
    'function': '## 🛠️ 工具函数',
    'hook': '## 🎣 自定义 Hooks',
    'style': '## 🎨 样式方案',
    'tip': '## 💡 开发技巧',
    'solution': '## 🐛 问题解决方案',
  };

  const sectionTitle = categoryMapping[category] || '## 📦 常用组件';
  
  // 生成片段内容
  const timestamp = new Date().toISOString().split('T')[0];
  const snippetContent = `
### ${title}

**描述**: ${description}

${tags.length > 0 ? `**标签**: ${tags.map(t => `\`${t}\``).join(', ')}\n` : ''}
**代码**:
\`\`\`${language}
${code}
\`\`\`

${notes ? `**使用说明**:\n${notes}\n` : ''}
**添加时间**: ${timestamp}

---
`;

  // 找到对应章节并插入
  const sectionIndex = content.indexOf(sectionTitle);
  if (sectionIndex === -1) {
    throw new Error(`未找到分类章节: ${category}`);
  }

  // 找到章节后第一个 "---" 标记的位置（章节说明后）
  const afterSectionTitle = sectionIndex + sectionTitle.length;
  const descriptionEndIndex = content.indexOf('\n---\n', afterSectionTitle);
  
  if (descriptionEndIndex === -1) {
    throw new Error(`章节格式错误: ${category}`);
  }

  const insertPosition = descriptionEndIndex + 6; // '\n---\n'.length + 1

  // 插入新内容
  const updatedContent = 
    content.slice(0, insertPosition) + 
    snippetContent + 
    content.slice(insertPosition);

  await fs.writeFile(notesPath, updatedContent, 'utf-8');

  return {
    success: true,
    path: notesPath,
    category,
  };
}

/**
 * 读取个人笔记
 */
export async function readPersonalNotes(projectPath, options = {}) {
  const notesPath = path.join(projectPath, '.vscode', 'PERSONAL_DEV_NOTES.md');
  
  if (!await fileExists(notesPath)) {
    return {
      exists: false,
      path: notesPath,
      content: null,
      message: '个人笔记不存在，添加第一个片段后将自动创建',
    };
  }

  let content = await fs.readFile(notesPath, 'utf-8');

  // 如果指定了分类，只返回该分类内容
  if (options.category) {
    const categoryMapping = {
      'component': '## 📦 常用组件',
      'function': '## 🛠️ 工具函数',
      'hook': '## 🎣 自定义 Hooks',
      'style': '## 🎨 样式方案',
      'tip': '## 💡 开发技巧',
      'solution': '## 🐛 问题解决方案',
    };

    const sectionTitle = categoryMapping[options.category];
    if (sectionTitle) {
      const sectionRegex = new RegExp(
        `${sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s\\S]*?)(?=^## |$)`,
        'm'
      );
      const match = content.match(sectionRegex);
      content = match ? match[0] : `未找到分类: ${options.category}`;
    }
  }

  return {
    exists: true,
    path: notesPath,
    content,
  };
}

/**
 * 搜索个人笔记中的片段
 */
export async function searchPersonalSnippets(projectPath, keyword) {
  const notesPath = path.join(projectPath, '.vscode', 'PERSONAL_DEV_NOTES.md');
  
  if (!await fileExists(notesPath)) {
    return {
      exists: false,
      results: [],
      message: '个人笔记不存在',
    };
  }

  const content = await fs.readFile(notesPath, 'utf-8');
  
  // 按章节分割
  const sections = content.split(/^## /m).filter(s => s.trim());
  const results = [];

  // 在每个章节中搜索
  for (const section of sections) {
    const lines = section.split('\n');
    const categoryName = lines[0].trim();
    
    // 提取所有三级标题（每个片段）
    const snippets = section.split(/^### /m).filter(s => s.trim() && !s.startsWith(categoryName));
    
    for (const snippet of snippets) {
      const snippetLines = snippet.split('\n');
      const title = snippetLines[0].trim();
      
      // 检查关键词是否在标题或内容中
      if (snippet.toLowerCase().includes(keyword.toLowerCase())) {
        // 提取描述
        const descLine = snippetLines.find(l => l.startsWith('**描述**:'));
        const description = descLine ? descLine.replace('**描述**:', '').trim() : '';
        
        // 提取标签
        const tagsLine = snippetLines.find(l => l.startsWith('**标签**:'));
        const tags = tagsLine 
          ? tagsLine.replace('**标签**:', '').split(',').map(t => t.trim().replace(/`/g, ''))
          : [];

        results.push({
          category: categoryName,
          title,
          description,
          tags,
          preview: snippet.slice(0, 200) + (snippet.length > 200 ? '...' : ''),
        });
      }
    }
  }

  return {
    exists: true,
    keyword,
    count: results.length,
    results,
  };
}

/**
 * 列出所有片段的概要
 */
export async function listPersonalSnippets(projectPath) {
  const notesPath = path.join(projectPath, '.vscode', 'PERSONAL_DEV_NOTES.md');
  
  if (!await fileExists(notesPath)) {
    return {
      exists: false,
      categories: [],
      total: 0,
    };
  }

  const content = await fs.readFile(notesPath, 'utf-8');
  
  // 按章节统计
  const categories = [
    { name: 'component', title: '常用组件', icon: '📦', count: 0 },
    { name: 'function', title: '工具函数', icon: '🛠️', count: 0 },
    { name: 'hook', title: '自定义 Hooks', icon: '🎣', count: 0 },
    { name: 'style', title: '样式方案', icon: '🎨', count: 0 },
    { name: 'tip', title: '开发技巧', icon: '💡', count: 0 },
    { name: 'solution', title: '问题解决方案', icon: '🐛', count: 0 },
  ];

  let total = 0;

  for (const cat of categories) {
    const regex = new RegExp(`## ${cat.icon} ${cat.title}([\\s\\S]*?)(?=^## |$)`, 'm');
    const match = content.match(regex);
    
    if (match) {
      // 统计该章节中的三级标题数量
      const snippetCount = (match[0].match(/^### /gm) || []).length;
      cat.count = snippetCount;
      total += snippetCount;
    }
  }

  return {
    exists: true,
    categories: categories.filter(c => c.count > 0),
    total,
  };
}
