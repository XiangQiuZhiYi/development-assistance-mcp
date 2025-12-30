#!/usr/bin/env node

/**
 * MCP-XB 测试脚本
 * 用于验证所有工具是否正常工作
 */

import {
  generateProjectGuide,
  writeGuideToFile,
  readProjectGuide,
  addUseCaseToGuide,
  updateGuideSection,
} from './src/tools/guideGenerator.js';
import { detectCodePatterns, detectFileContext } from './src/analyzers/patternDetector.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('🚀 MCP-XB 工具测试\n');
  
  const projectPath = __dirname;
  
  try {
    // Test 1: 分析并生成指南
    console.log('📝 测试 1: 分析项目并生成指南...');
    const result = await generateProjectGuide(projectPath);
    console.log('✅ 分析完成');
    console.log(`   - 框架: ${result.analysis.project.framework}`);
    console.log(`   - 依赖数量: ${Object.keys(result.analysis.project.dependencies).length}`);
    
    await writeGuideToFile(projectPath, result.content);
    console.log('✅ PROJECT_GUIDE.md 已生成\n');
    
    // Test 2: 读取指南
    console.log('📖 测试 2: 读取项目指南...');
    const guide = await readProjectGuide(projectPath);
    if (guide.exists) {
      console.log('✅ 成功读取指南');
      console.log(`   - 文件大小: ${guide.content.length} 字符\n`);
    } else {
      console.log('❌ 指南不存在\n');
    }
    
    // Test 3: 检测代码模式
    console.log('🔍 测试 3: 检测代码模式...');
    const patterns = await detectCodePatterns(projectPath);
    console.log('✅ 模式检测完成');
    console.log(`   - 组件命名: ${patterns.naming.components.pattern || '未检测到'}`);
    console.log(`   - 文件组织: ${patterns.fileOrganization.structure}`);
    console.log(`   - 代码风格: ${patterns.codeStyle.quotes} quotes, ${patterns.codeStyle.semicolons} semicolons`);
    console.log(`   - 自定义 Hooks: ${patterns.hooks.customHooks.length} 个\n`);
    
    // Test 4: 获取上下文帮助
    console.log('💡 测试 4: 获取上下文帮助...');
    const testFile = path.join(projectPath, 'src/main.js');
    const context = await detectFileContext(testFile, projectPath);
    console.log('✅ 上下文分析完成');
    console.log(`   - 文件类型: ${context.type || '未知'}`);
    console.log(`   - 位置: ${context.location}`);
    console.log(`   - 建议模式: ${context.suggestedPatterns.length} 条\n`);
    
    // Test 5: 添加用例
    console.log('➕ 测试 5: 添加用例到指南...');
    await addUseCaseToGuide(projectPath, {
      title: '测试用例：启动 MCP 服务器',
      description: '展示如何在项目中启动 MCP 服务器',
      code: `node src/main.js`,
      scenario: '开发测试',
      language: 'bash',
      notes: '这是一个自动生成的测试用例',
    });
    console.log('✅ 用例添加成功\n');
    
    // Test 6: 更新章节
    console.log('📝 测试 6: 更新指南章节...');
    await updateGuideSection(projectPath, '项目概览', `
这是一个 MCP 项目分析工具，可以自动生成项目开发指南。

### 主要功能
- 自动分析项目结构
- 生成标准化的开发文档
- 检测代码模式和规范
- 提供上下文相关的开发建议
`);
    console.log('✅ 章节更新成功\n');
    
    console.log('🎉 所有测试通过！\n');
    console.log('💡 提示：查看生成的 PROJECT_GUIDE.md 文件');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTests();
