import { fileExists, readJson } from '../utils/fileUtils.js';
import path from 'node:path';
import fg from 'fast-glob';

/**
 * 分析项目类型和技术栈
 */
export async function analyzeProjectType(projectPath) {
  const packageJson = await readJson(path.join(projectPath, 'package.json'));
  if (!packageJson) {
    return { type: 'unknown', framework: null, dependencies: {} };
  }

  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const framework = detectFramework(deps, projectPath);
  
  return {
    type: framework.type,
    framework: framework.name,
    version: framework.version,
    dependencies: deps,
    name: packageJson.name,
    description: packageJson.description,
    scripts: packageJson.scripts || {},
  };
}

/**
 * 检测项目框架
 */
function detectFramework(deps, projectPath) {
  // Next.js
  if (deps.next) {
    return { type: 'nextjs', name: 'Next.js', version: deps.next };
  }
  
  // Vue
  if (deps.vue) {
    return { type: 'vue', name: 'Vue', version: deps.vue };
  }
  
  // React
  if (deps.react) {
    if (deps['react-scripts']) {
      return { type: 'cra', name: 'Create React App', version: deps.react };
    }
    if (deps.vite) {
      return { type: 'react-vite', name: 'React + Vite', version: deps.react };
    }
    return { type: 'react', name: 'React', version: deps.react };
  }
  
  return { type: 'unknown', name: 'Unknown', version: null };
}

/**
 * 检测路由方案
 */
export async function analyzeRouting(projectPath, projectType) {
  const result = {
    type: null,
    framework: null,
    location: null,
    pattern: null,
    examples: [],
  };

  if (projectType === 'nextjs') {
    // 检测 App Router (Next.js 13+)
    const appDir = path.join(projectPath, 'src', 'app');
    const appDirExists = await fileExists(appDir);
    
    if (appDirExists) {
      const pages = await fg(['**/page.{js,jsx,ts,tsx}'], {
        cwd: appDir,
        ignore: ['node_modules'],
      });
      result.type = 'file-based';
      result.framework = 'Next.js App Router';
      result.location = 'src/app';
      result.pattern = 'src/app/[route]/page.tsx';
      result.examples = pages.slice(0, 5).map(p => path.join('src/app', p));
      return result;
    }

    // 检测 Pages Router
    const pagesDir = path.join(projectPath, 'src', 'pages');
    const pagesDirExists = await fileExists(pagesDir);
    
    if (pagesDirExists || await fileExists(path.join(projectPath, 'pages'))) {
      result.type = 'file-based';
      result.framework = 'Next.js Pages Router';
      result.location = await fileExists(pagesDir) ? 'src/pages' : 'pages';
      result.pattern = `${result.location}/[route].tsx`;
      return result;
    }
  }

  // 检测 React Router
  const packageJson = await readJson(path.join(projectPath, 'package.json'));
  if (packageJson?.dependencies?.['react-router-dom']) {
    result.type = 'config-based';
    result.framework = 'React Router';
    
    // 尝试找到路由配置文件
    const routerFiles = await fg(['**/router.{js,jsx,ts,tsx}', '**/routes.{js,jsx,ts,tsx}'], {
      cwd: projectPath,
      ignore: ['node_modules', 'dist'],
      absolute: false,
    });
    
    result.location = routerFiles[0] || 'src/routes';
    result.pattern = '配置式路由';
    return result;
  }

  // 检测 Vue Router
  if (packageJson?.dependencies?.['vue-router']) {
    result.type = 'config-based';
    result.framework = 'Vue Router';
    result.location = 'src/router';
    result.pattern = '配置式路由';
    return result;
  }

  return result;
}

/**
 * 检测状态管理方案
 */
export async function analyzeStateManagement(projectPath) {
  const packageJson = await readJson(path.join(projectPath, 'package.json'));
  if (!packageJson) return { type: null, libraries: [] };

  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const libraries = [];

  if (deps.redux || deps['@reduxjs/toolkit']) {
    libraries.push({ name: 'Redux', location: 'src/store' });
  }
  if (deps.zustand) {
    libraries.push({ name: 'Zustand', location: 'src/store' });
  }
  if (deps.mobx) {
    libraries.push({ name: 'MobX', location: 'src/stores' });
  }
  if (deps.jotai) {
    libraries.push({ name: 'Jotai', location: 'src/atoms' });
  }
  if (deps.recoil) {
    libraries.push({ name: 'Recoil', location: 'src/recoil' });
  }
  if (deps.pinia) {
    libraries.push({ name: 'Pinia', location: 'src/stores' });
  }
  if (deps.vuex) {
    libraries.push({ name: 'Vuex', location: 'src/store' });
  }

  return {
    type: libraries.length > 0 ? 'library' : 'context',
    primary: libraries[0]?.name || 'React Context API',
    libraries,
  };
}

/**
 * 检测样式方案
 */
export async function analyzeStyling(projectPath) {
  const packageJson = await readJson(path.join(projectPath, 'package.json'));
  if (!packageJson) return { type: 'css', solutions: [] };

  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const solutions = [];

  if (deps.tailwindcss) {
    solutions.push({ name: 'Tailwind CSS', config: 'tailwind.config.js' });
  }
  if (deps['styled-components']) {
    solutions.push({ name: 'Styled Components', config: null });
  }
  if (deps['@emotion/react']) {
    solutions.push({ name: 'Emotion', config: null });
  }
  if (deps.sass || deps.scss) {
    solutions.push({ name: 'Sass/SCSS', config: null });
  }
  if (deps.less) {
    solutions.push({ name: 'Less', config: null });
  }

  // 检测 CSS Modules
  const cssModules = await fg(['**/*.module.{css,scss,sass}'], {
    cwd: projectPath,
    ignore: ['node_modules', 'dist'],
  });
  
  if (cssModules.length > 0) {
    solutions.push({ name: 'CSS Modules', config: null });
  }

  return {
    type: solutions.length > 0 ? solutions[0].name : 'Plain CSS',
    solutions,
  };
}

/**
 * 查找常用组件
 */
export async function analyzeComponents(projectPath) {
  const componentDirs = ['src/components', 'components', 'src/ui'];
  const components = [];

  for (const dir of componentDirs) {
    const fullPath = path.join(projectPath, dir);
    if (await fileExists(fullPath)) {
      const files = await fg(['**/*.{jsx,tsx,vue}'], {
        cwd: fullPath,
        ignore: ['**/*.test.*', '**/*.spec.*'],
      });

      for (const file of files.slice(0, 20)) {
        const name = path.basename(file, path.extname(file));
        components.push({
          name,
          path: path.join(dir, file),
        });
      }

      break; // 只分析第一个找到的组件目录
    }
  }

  return {
    location: componentDirs.find(async (dir) => await fileExists(path.join(projectPath, dir))),
    components: components.slice(0, 15),
    count: components.length,
  };
}

/**
 * 分析 API 调用模式
 */
export async function analyzeApiPattern(projectPath) {
  const packageJson = await readJson(path.join(projectPath, 'package.json'));
  if (!packageJson) return { method: 'fetch', location: null };

  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  let method = 'fetch';
  let library = null;

  if (deps.axios) {
    method = 'axios';
    library = 'axios';
  } else if (deps['@tanstack/react-query']) {
    method = 'react-query';
    library = '@tanstack/react-query';
  } else if (deps.swr) {
    method = 'swr';
    library = 'swr';
  }

  // 查找 API 相关文件
  const apiFiles = await fg(['**/api.{js,ts}', '**/request.{js,ts}', '**/http.{js,ts}'], {
    cwd: projectPath,
    ignore: ['node_modules', 'dist', 'pages/api'],
  });

  return {
    method,
    library,
    location: apiFiles[0] || null,
  };
}
