import fg from 'fast-glob';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * 检测项目中的代码模式
 */
export async function detectCodePatterns(projectPath) {
  const patterns = {
    naming: await detectNamingPatterns(projectPath),
    fileOrganization: await detectFileOrganization(projectPath),
    codeStyle: await detectCodeStyle(projectPath),
    hooks: await detectHookPatterns(projectPath),
    imports: await detectImportPatterns(projectPath),
  };

  return patterns;
}

/**
 * 检测命名模式
 */
async function detectNamingPatterns(projectPath) {
  const patterns = {
    components: { pattern: null, examples: [] },
    files: { pattern: null, examples: [] },
    functions: { pattern: null, examples: [] },
  };

  // 检测组件命名
  const componentFiles = await fg(['src/**/*.{jsx,tsx}', 'components/**/*.{jsx,tsx}'], {
    cwd: projectPath,
    ignore: ['node_modules', '**/*.test.*', '**/*.spec.*'],
    absolute: false,
  });

  if (componentFiles.length > 0) {
    const sampleFiles = componentFiles.slice(0, 10);
    const pascalCaseCount = sampleFiles.filter(f => {
      const name = path.basename(f, path.extname(f));
      return /^[A-Z][a-zA-Z]*$/.test(name);
    }).length;

    patterns.components.pattern = pascalCaseCount > sampleFiles.length / 2 
      ? 'PascalCase' 
      : 'Mixed';
    patterns.components.examples = sampleFiles.slice(0, 5).map(f => path.basename(f));
  }

  // 检测工具函数命名
  const utilFiles = await fg(['src/**/utils/**/*.{js,ts}', 'src/**/helpers/**/*.{js,ts}'], {
    cwd: projectPath,
    ignore: ['node_modules', '**/*.test.*'],
    absolute: false,
  });

  if (utilFiles.length > 0) {
    patterns.files.pattern = 'camelCase';
    patterns.files.examples = utilFiles.slice(0, 5).map(f => path.basename(f));
  }

  return patterns;
}

/**
 * 检测文件组织模式
 */
async function detectFileOrganization(projectPath) {
  const organization = {
    structure: null,
    colocation: false,
    separation: false,
    examples: [],
  };

  // 检测是否使用 feature-based 结构
  const featureDirs = await fg(['src/features/**', 'src/modules/**'], {
    cwd: projectPath,
    onlyDirectories: true,
    deep: 1,
  });

  if (featureDirs.length > 0) {
    organization.structure = 'feature-based';
    organization.colocation = true;
    organization.examples = featureDirs.slice(0, 3);
    return organization;
  }

  // 检测是否使用分层结构
  const layerDirs = await fg(['src/components', 'src/pages', 'src/services', 'src/utils'], {
    cwd: projectPath,
    onlyDirectories: true,
  });

  if (layerDirs.length >= 3) {
    organization.structure = 'layered';
    organization.separation = true;
    organization.examples = layerDirs;
    return organization;
  }

  organization.structure = 'flat';
  return organization;
}

/**
 * 检测代码风格
 */
async function detectCodeStyle(projectPath) {
  const style = {
    quotes: null,
    semicolons: null,
    indentation: null,
    arrowFunctions: false,
    asyncAwait: false,
  };

  // 读取几个样本文件
  const sampleFiles = await fg(['src/**/*.{js,jsx,ts,tsx}'], {
    cwd: projectPath,
    ignore: ['node_modules', 'dist', 'build'],
  });

  if (sampleFiles.length === 0) return style;

  const fileToRead = path.join(projectPath, sampleFiles[0]);
  try {
    const content = await fs.readFile(fileToRead, 'utf-8');
    const lines = content.split('\n').slice(0, 50); // 只检查前50行

    // 检测引号风格
    const singleQuotes = (content.match(/'/g) || []).length;
    const doubleQuotes = (content.match(/"/g) || []).length;
    style.quotes = singleQuotes > doubleQuotes ? 'single' : 'double';

    // 检测分号
    const semicolonLines = lines.filter(l => l.trim().endsWith(';')).length;
    style.semicolons = semicolonLines > lines.length / 3 ? 'required' : 'omitted';

    // 检测缩进
    const spacedLines = lines.filter(l => l.startsWith('  ') || l.startsWith('    ')).length;
    if (spacedLines > 0) {
      const firstIndent = lines.find(l => l.match(/^\s+\S/));
      const spaces = firstIndent ? firstIndent.match(/^\s+/)?.[0].length : 2;
      style.indentation = `${spaces} spaces`;
    }

    // 检测箭头函数
    style.arrowFunctions = content.includes('=>');

    // 检测 async/await
    style.asyncAwait = content.includes('async') && content.includes('await');

  } catch (error) {
    // 文件读取失败，返回默认值
  }

  return style;
}

/**
 * 检测 Hook 使用模式
 */
async function detectHookPatterns(projectPath) {
  const hooks = {
    customHooks: [],
    commonHooks: [],
    location: null,
  };

  // 查找自定义 hooks
  const hookFiles = await fg(['src/**/use*.{js,ts,jsx,tsx}', 'hooks/**/use*.{js,ts}'], {
    cwd: projectPath,
    ignore: ['node_modules', '**/*.test.*'],
    absolute: false,
  });

  if (hookFiles.length > 0) {
    hooks.location = hookFiles[0].includes('hooks/') ? 'hooks/' : 'src/hooks/';
    hooks.customHooks = hookFiles.slice(0, 10).map(f => {
      const name = path.basename(f, path.extname(f));
      return { name, path: f };
    });

    // 读取第一个 hook 文件分析常用 hooks
    try {
      const firstHook = path.join(projectPath, hookFiles[0]);
      const content = await fs.readFile(firstHook, 'utf-8');
      
      const hookPattern = /use[A-Z]\w+/g;
      const matches = content.match(hookPattern) || [];
      hooks.commonHooks = [...new Set(matches)].slice(0, 8);
    } catch (error) {
      // 忽略读取错误
    }
  }

  return hooks;
}

/**
 * 检测导入模式
 */
async function detectImportPatterns(projectPath) {
  const imports = {
    style: null, // 'named', 'default', 'mixed'
    aliasUsage: false,
    pathAliases: [],
    examples: [],
  };

  const sampleFiles = await fg(['src/**/*.{js,jsx,ts,tsx}'], {
    cwd: projectPath,
    ignore: ['node_modules'],
  });

  if (sampleFiles.length === 0) return imports;

  const fileToRead = path.join(projectPath, sampleFiles[0]);
  try {
    const content = await fs.readFile(fileToRead, 'utf-8');
    const lines = content.split('\n').slice(0, 30);

    // 提取 import 语句
    const importLines = lines.filter(l => l.trim().startsWith('import'));
    imports.examples = importLines.slice(0, 5);

    // 检测导入风格
    const namedImports = importLines.filter(l => l.includes('{')).length;
    const defaultImports = importLines.filter(l => !l.includes('{')).length;
    
    if (namedImports > defaultImports * 2) {
      imports.style = 'named';
    } else if (defaultImports > namedImports * 2) {
      imports.style = 'default';
    } else {
      imports.style = 'mixed';
    }

    // 检测路径别名
    const aliasPattern = /@\/|~\//g;
    imports.aliasUsage = aliasPattern.test(content);
    
    if (imports.aliasUsage) {
      const aliasMatches = content.match(/@\/[\w/]+|~\/[\w/]+/g) || [];
      imports.pathAliases = [...new Set(aliasMatches.map(m => m.split('/')[0]))];
    }

  } catch (error) {
    // 忽略读取错误
  }

  return imports;
}

/**
 * 检测特定文件的上下文模式
 */
export async function detectFileContext(filePath, projectPath) {
  const relativePath = path.relative(projectPath, filePath);
  const context = {
    type: null,
    location: null,
    relatedFiles: [],
    suggestedPatterns: [],
  };

  // 判断文件类型
  const ext = path.extname(filePath);
  const basename = path.basename(filePath, ext);
  const dirname = path.dirname(relativePath);

  // 组件文件
  if (['.jsx', '.tsx'].includes(ext) && /^[A-Z]/.test(basename)) {
    context.type = 'component';
    context.location = dirname;
    
    // 查找相关的样式文件
    const possibleStyles = [
      `${path.join(dirname, basename)}.module.css`,
      `${path.join(dirname, basename)}.module.scss`,
      `${path.join(dirname, basename)}.css`,
      `${path.join(dirname, basename)}.scss`,
    ];
    
    for (const stylePath of possibleStyles) {
      const fullPath = path.join(projectPath, stylePath);
      try {
        await fs.access(fullPath);
        context.relatedFiles.push(stylePath);
      } catch {
        // 文件不存在
      }
    }

    context.suggestedPatterns = [
      '使用 PascalCase 命名组件',
      '导出为 default export',
      '使用 TypeScript 定义 Props 类型',
      '样式文件与组件同目录',
    ];
  }

  // 页面文件
  if (dirname.includes('pages') || dirname.includes('app')) {
    context.type = 'page';
    context.location = dirname;
    context.suggestedPatterns = [
      '页面组件通常不包含复杂逻辑',
      '使用布局组件包裹',
      '数据获取使用 getServerSideProps 或 getStaticProps (Pages Router)',
    ];
  }

  // Hook 文件
  if (basename.startsWith('use') && ['.js', '.ts'].includes(ext)) {
    context.type = 'hook';
    context.location = dirname;
    context.suggestedPatterns = [
      '以 use 开头命名',
      '只在组件或其他 hooks 中调用',
      '返回数组或对象',
    ];
  }

  // 工具函数
  if (dirname.includes('utils') || dirname.includes('helpers')) {
    context.type = 'utility';
    context.location = dirname;
    context.suggestedPatterns = [
      '纯函数，无副作用',
      '使用 camelCase 命名',
      '单一职责原则',
      '添加 JSDoc 注释',
    ];
  }

  // API 相关
  if (dirname.includes('api') || dirname.includes('services')) {
    context.type = 'api';
    context.location = dirname;
    context.suggestedPatterns = [
      '统一错误处理',
      '使用 try-catch 包裹',
      '返回一致的响应格式',
    ];
  }

  return context;
}
