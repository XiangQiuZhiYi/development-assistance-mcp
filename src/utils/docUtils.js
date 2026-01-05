import fs from 'node:fs/promises';
import path from 'node:path';
import { fileExists } from './fileUtils.js';

/**
 * 确保目录存在
 */
export async function ensureDir(dirPath) {
  if (!await fileExists(dirPath)) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * 字符串转 slug（用于文件名）
 * 支持中文和英文，使用时间戳保证唯一性
 */
export function slugify(text) {
  // 如果包含中文，使用拼音或者时间戳
  const hasChinese = /[\u4e00-\u9fa5]/.test(text);
  
  if (hasChinese) {
    // 对于中文，使用时间戳 + 原始文本的前几个字符
    const timestamp = Date.now();
    const prefix = text.slice(0, 10); // 取前10个字符
    return `${timestamp}-${prefix}`;
  }
  
  // 英文：转小写并替换特殊字符
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-') // 替换空格和特殊字符为 -
    .replace(/^-+|-+$/g, ''); // 移除首尾的 -
}

/**
 * 获取当前日期 YYYYMMDD 格式
 */
export function getDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * 更新索引文件（追加链接）
 */
export async function appendToIndex(indexPath, linkText, linkPath, prefix = '-') {
  let content = '';
  
  if (await fileExists(indexPath)) {
    content = await fs.readFile(indexPath, 'utf-8');
  }
  
  // 检查是否已存在
  if (content.includes(linkPath)) {
    return; // 已存在，不重复添加
  }
  
  // 在文件末尾追加
  const newLine = `${prefix} [${linkText}](${linkPath})`;
  content = content.trim() + '\n' + newLine + '\n';
  
  await fs.writeFile(indexPath, content, 'utf-8');
}

/**
 * 创建或更新索引文件
 */
export async function updateIndexFile(indexPath, title, items) {
  let content = `# ${title}\n\n`;
  
  if (items.length === 0) {
    content += '_暂无内容_\n';
  } else {
    items.forEach(item => {
      content += `- [${item.title}](${item.path})`;
      if (item.description) {
        content += ` - ${item.description}`;
      }
      content += '\n';
    });
  }
  
  content += `\n*最后更新: ${new Date().toISOString().split('T')[0]}*\n`;
  
  await fs.writeFile(indexPath, content, 'utf-8');
}

/**
 * 扫描目录获取所有 markdown 文件
 */
export async function scanMarkdownFiles(dirPath) {
  if (!await fileExists(dirPath)) {
    return [];
  }
  
  const files = await fs.readdir(dirPath);
  const mdFiles = [];
  
  for (const file of files) {
    if (file.endsWith('.md') && file !== 'README.md') {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isFile()) {
        // 读取文件第一行作为标题
        const content = await fs.readFile(filePath, 'utf-8');
        const firstLine = content.split('\n')[0];
        const title = firstLine.replace(/^#\s*/, '').trim();
        
        mdFiles.push({
          name: file,
          path: file,
          title: title || file.replace('.md', ''),
          mtime: stat.mtime,
        });
      }
    }
  }
  
  return mdFiles.sort((a, b) => b.mtime - a.mtime); // 按修改时间倒序
}
