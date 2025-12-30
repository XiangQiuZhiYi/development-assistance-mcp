import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * 检查文件是否存在
 */
export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 安全读取 JSON 文件
 */
export async function readJson(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * 获取目录结构树
 */
export async function getDirectoryTree(dirPath, options = {}) {
  const {
    maxDepth = 3,
    currentDepth = 0,
    ignore = ['node_modules', 'dist', '.git', '.next', 'build', 'coverage'],
  } = options;

  if (currentDepth >= maxDepth) {
    return { truncated: true };
  }

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const tree = {};

    for (const entry of entries) {
      if (ignore.includes(entry.name)) continue;

      if (entry.isDirectory()) {
        tree[entry.name + '/'] = await getDirectoryTree(
          path.join(dirPath, entry.name),
          { ...options, currentDepth: currentDepth + 1 }
        );
      } else {
        tree[entry.name] = 'file';
      }
    }

    return tree;
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * 格式化目录树为 Markdown
 */
export function formatTreeToMarkdown(tree, prefix = '', isLast = true) {
  const lines = [];
  const entries = Object.entries(tree);

  entries.forEach(([name, value], index) => {
    const isLastEntry = index === entries.length - 1;
    const connector = isLastEntry ? '└── ' : '├── ';
    const extension = isLastEntry ? '    ' : '│   ';

    lines.push(prefix + connector + name);

    if (typeof value === 'object' && !value.truncated && !value.error) {
      const newPrefix = prefix + extension;
      lines.push(...formatTreeToMarkdown(value, newPrefix, isLastEntry).split('\n'));
    }
  });

  return lines.join('\n');
}
