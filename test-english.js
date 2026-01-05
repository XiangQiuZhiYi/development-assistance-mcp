import { addPersonalSnippet } from './src/tools/personalNotes.js';

const result = await addPersonalSnippet(process.cwd(), {
  category: 'hook',
  title: 'useDebounce Hook',
  description: 'Debounce hook for React',
  code: 'function useDebounce(value, delay) { /* ... */ }',
  language: 'typescript',
  tags: ['react', 'hooks', 'performance'],
  notes: 'Use this to debounce input values',
});

console.log('✅ 添加成功:', result.filePath);
