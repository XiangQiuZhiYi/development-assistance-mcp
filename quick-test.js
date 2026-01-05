// 快速测试新的文件结构
import { generateProjectGuide } from './src/tools/guideGenerator.js';
import { addPersonalSnippet } from './src/tools/personalNotes.js';

const testPath = process.cwd();

console.log('🧪 测试新文件结构\n');

try {
  console.log('1️⃣ 生成项目指南...');
  const result = await generateProjectGuide(testPath);
  console.log('✅ 成功生成');
  console.log('   索引路径:', result.guidePath);
  console.log('   项目框架:', result.analysis.project.framework);
  console.log('');

  console.log('2️⃣ 添加代码片段...');
  const snippet = await addPersonalSnippet(testPath, {
    category: 'function',
    title: '测试函数',
    description: '这是测试',
    code: 'function test() { return true; }',
    language: 'javascript',
    tags: ['test'],
  });
  console.log('✅ 成功保存');
  console.log('   文件路径:', snippet.filePath);
  console.log('   索引路径:', snippet.indexPath);
  console.log('');

  console.log('🎉 测试完成！');
} catch (error) {
  console.error('❌ 错误:', error.message);
  console.error(error.stack);
  process.exit(1);
}
