import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { pathToFileURL } from 'node:url';
import { z } from 'zod';
import {
  generateProjectGuide,
  readProjectGuide,
  addUseCaseToGuide,
  updateGuideSection,
} from './tools/guideGenerator.js';
import { detectCodePatterns, detectFileContext } from './analyzers/patternDetector.js';
import {
  addPersonalSnippet,
  readPersonalNotes,
  searchPersonalSnippets,
  listPersonalSnippets,
  setCoreGuidelines,
  readCoreGuidelines,
} from './tools/personalNotes.js';

export async function startServer() {
  const server = new McpServer({
    name: 'mcp-xb',
    version: '1.0.0',
  });

  // ==================== Prompts 模板 ====================

  // Prompt 1: 分析新项目
  server.prompt(
    'analyze-new-project',
    '分析新项目并生成完整的开发指南',
    [
      {
        name: 'projectPath',
        description: '项目根目录的绝对路径',
        required: true,
      },
    ],
    async ({ projectPath }) => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `请帮我分析这个项目并生成开发指南：

**项目路径**: ${projectPath || '当前项目'}

请执行以下步骤：
1. 使用 analyze_and_generate_guide 工具分析项目结构
2. 总结项目的技术栈和关键信息
3. 提醒我查看生成的 .vscode/PROJECT_GUIDE.md 文件
4. 建议我接下来可以做什么（比如添加用例、检测代码模式等）`,
            },
          },
        ],
      };
    }
  );

  // Prompt 2: 记录开发用例
  server.prompt(
    'record-use-case',
    '记录刚完成的功能实现，添加到项目指南',
    [
      {
        name: 'projectPath',
        description: '项目根目录的绝对路径',
        required: true,
      },
      {
        name: 'feature',
        description: '完成的功能描述（如：用户登录页面）',
        required: false,
      },
    ],
    async ({ projectPath, feature }) => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `我刚完成了一个功能开发，想记录到项目指南中：

**项目路径**: ${projectPath || '当前项目'}
**功能描述**: ${feature || '（请说明完成了什么功能）'}

请帮我：
1. 询问这个功能的实现步骤和关键代码
2. 使用 add_use_case 工具将其记录到项目指南
3. 包含必要的代码示例和注意事项
4. 确认记录成功后，总结这个用例的价值`,
            },
          },
        ],
      };
    }
  );

  // Prompt 3: 保存优质代码片段
  server.prompt(
    'save-code-snippet',
    '保存优质的代码片段到个人笔记',
    [
      {
        name: 'projectPath',
        description: '项目根目录的绝对路径',
        required: true,
      },
      {
        name: 'category',
        description: '片段类型：component/function/hook/style/tip/solution',
        required: false,
      },
    ],
    async ({ projectPath, category }) => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `我想保存一个优质的代码片段到个人笔记：

**项目路径**: ${projectPath || '当前项目'}
**片段类型**: ${category || '（请选择：component/function/hook/style/tip/solution）'}

请帮我：
1. 询问代码片段的标题、描述和代码内容
2. 建议合适的标签
3. 使用 add_personal_snippet 工具保存
4. 确认保存位置：.vscode/PERSONAL_DEV_NOTES.md`,
            },
          },
        ],
      };
    }
  );

  // Prompt 4: 搜索并复用代码
  server.prompt(
    'find-code-snippet',
    '在个人笔记中搜索可复用的代码片段',
    [
      {
        name: 'projectPath',
        description: '项目根目录的绝对路径',
        required: true,
      },
      {
        name: 'keyword',
        description: '搜索关键词',
        required: false,
      },
    ],
    async ({ projectPath, keyword }) => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `我需要查找之前保存的代码片段：

**项目路径**: ${projectPath || '当前项目'}
**关键词**: ${keyword || '（请说明要找什么类型的代码）'}

请帮我：
1. 使用 search_personal_snippets 工具搜索相关片段
2. 展示找到的代码片段列表
3. 如果找到多个，帮我选择最合适的
4. 提供完整的代码和使用说明`,
            },
          },
        ],
      };
    }
  );

  // Prompt 5: 项目规范咨询
  server.prompt(
    'check-project-guide',
    '查看项目开发规范和最佳实践',
    [
      {
        name: 'projectPath',
        description: '项目根目录的绝对路径',
        required: true,
      },
      {
        name: 'topic',
        description: '想了解的主题（如：路由、状态管理、样式规范）',
        required: false,
      },
    ],
    async ({ projectPath, topic }) => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `我想了解这个项目的开发规范：

**项目路径**: ${projectPath || '当前项目'}
**关注主题**: ${topic || '（请说明想了解项目的哪方面规范）'}

请帮我：
1. 使用 read_project_guide 工具读取项目指南
2. ${topic ? `重点说明"${topic}"相关的规范` : '总结项目的核心规范'}
3. 提供具体的代码示例
4. 给出开发建议`,
            },
          },
        ],
      };
    }
  );

  // Prompt 6: 代码模式分析
  server.prompt(
    'analyze-code-patterns',
    '分析项目的代码模式和规范',
    [
      {
        name: 'projectPath',
        description: '项目根目录的绝对路径',
        required: true,
      },
    ],
    async ({ projectPath }) => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `请分析这个项目的代码规范和模式：

**项目路径**: ${projectPath || '当前项目'}

请帮我：
1. 使用 detect_project_patterns 工具分析代码模式
2. 总结命名约定（PascalCase、camelCase等）
3. 说明文件组织方式
4. 总结代码风格（引号、分号、缩进等）
5. 分析常用的 Hooks 和导入模式
6. 给出统一代码风格的建议`,
            },
          },
        ],
      };
    }
  );

  // Prompt 7: 完整项目入门
  server.prompt(
    'onboard-project',
    '新项目完整入门流程（分析+规范+模式）',
    [
      {
        name: 'projectPath',
        description: '项目根目录的绝对路径',
        required: true,
      },
    ],
    async ({ projectPath }) => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `这是一个新项目，请帮我完整分析：

**项目路径**: ${projectPath || '当前项目'}

请按以下顺序执行：
1. 使用 analyze_and_generate_guide 生成项目指南
2. 使用 detect_project_patterns 分析代码规范
3. 总结项目的：
   - 技术栈和框架版本
   - 目录结构
   - 路由方案
   - 状态管理
   - 样式方案
   - 代码规范（命名、组织、风格）
4. 给出快速上手建议
5. 提醒我 .vscode/PROJECT_GUIDE.md 的位置

这样我就能快速理解整个项目了！`,
            },
          },
        ],
      };
    }
  );

  // ==================== Tools 工具 ====================

  // 工具 1: 分析项目并生成指南
  server.tool(
    'analyze_and_generate_guide',
    '分析项目结构和技术栈，自动生成 PROJECT_GUIDE.md 文件',
    {
      projectPath: z.string().describe('项目根目录的绝对路径'),
    },
    async ({ projectPath }) => {
      try {
        const result = await generateProjectGuide(projectPath);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: '项目指南生成成功',
                  guidePath: result.guidePath,
                  summary: {
                    framework: result.analysis.project.framework,
                    routing: result.analysis.routing.framework,
                    stateManagement: result.analysis.state.primary,
                    styling: result.analysis.styling.type,
                    componentsCount: result.analysis.components.count,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 工具 2: 读取项目指南
  server.tool(
    'read_project_guide',
    '读取项目的 PROJECT_GUIDE.md 文件内容',
    {
      projectPath: z.string().describe('项目根目录的绝对路径'),
      section: z
        .string()
        .optional()
        .describe("可选：指定要读取的章节（如 '路由系统', '状态管理'）"),
    },
    async ({ projectPath, section }) => {
      try {
        const guide = await readProjectGuide(projectPath, section);

        if (!guide.exists) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: '.vscode/PROJECT_GUIDE.md 不存在，请先运行 analyze_and_generate_guide',
                  guidePath: guide.path,
                }),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: guide.content,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 工具 3: 添加实际用例
  server.tool(
    'add_use_case',
    '向 PROJECT_GUIDE.md 添加实际开发用例',
    {
      projectPath: z.string().describe('项目根目录的绝对路径'),
      title: z.string().describe('用例标题'),
      description: z.string().describe('用例描述'),
      code: z.string().describe('示例代码'),
      scenario: z.string().optional().describe('使用场景'),
      language: z.string().optional().default('typescript').describe('代码语言'),
      notes: z.string().optional().describe('注意事项'),
    },
    async ({ projectPath, title, description, code, scenario, language, notes }) => {
      try {
        const result = await addUseCaseToGuide(projectPath, {
          title,
          description,
          code,
          scenario,
          language,
          notes,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: '用例添加成功',
                guidePath: result.path,
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 工具 4: 更新指南章节
  server.tool(
    'update_guide_section',
    '更新 PROJECT_GUIDE.md 中的特定章节内容',
    {
      projectPath: z.string().describe('项目根目录的绝对路径'),
      sectionTitle: z.string().describe('要更新的章节标题（如 "路由系统", "状态管理"）'),
      newContent: z.string().describe('新的章节内容（Markdown 格式）'),
    },
    async ({ projectPath, sectionTitle, newContent }) => {
      try {
        const result = await updateGuideSection(projectPath, sectionTitle, newContent);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: '章节更新成功',
                guidePath: result.path,
                section: result.section,
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 工具 5: 检测项目代码模式
  server.tool(
    'detect_project_patterns',
    '检测项目中的代码模式、命名约定、文件组织方式等',
    {
      projectPath: z.string().describe('项目根目录的绝对路径'),
    },
    async ({ projectPath }) => {
      try {
        const patterns = await detectCodePatterns(projectPath);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  patterns: {
                    naming: patterns.naming,
                    fileOrganization: patterns.fileOrganization,
                    codeStyle: patterns.codeStyle,
                    hooks: patterns.hooks,
                    imports: patterns.imports,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 工具 6: 获取上下文帮助
  server.tool(
    'get_contextual_help',
    '根据当前文件类型和位置，提供相关的开发建议和最佳实践',
    {
      filePath: z.string().describe('当前文件的绝对路径'),
      projectPath: z.string().describe('项目根目录的绝对路径'),
    },
    async ({ filePath, projectPath }) => {
      try {
        const context = await detectFileContext(filePath, projectPath);
        const guide = await readProjectGuide(projectPath);

        let helpText = `# 上下文帮助\n\n`;
        helpText += `**文件类型**: ${context.type || '未知'}\n`;
        helpText += `**位置**: \`${context.location}\`\n\n`;

        if (context.relatedFiles.length > 0) {
          helpText += `## 相关文件\n\n`;
          context.relatedFiles.forEach(file => {
            helpText += `- \`${file}\`\n`;
          });
          helpText += '\n';
        }

        if (context.suggestedPatterns.length > 0) {
          helpText += `## 建议的开发模式\n\n`;
          context.suggestedPatterns.forEach(pattern => {
            helpText += `- ${pattern}\n`;
          });
          helpText += '\n';
        }

        // 如果存在项目指南，添加相关章节
        if (guide.exists && context.type) {
          helpText += `## 项目规范\n\n`;
          helpText += `查看 PROJECT_GUIDE.md 中的相关章节以了解项目特定的规范\n`;
        }

        return {
          content: [
            {
              type: 'text',
              text: helpText,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 工具 7: 添加个人代码片段
  server.tool(
    'add_personal_snippet',
    '添加个人开发笔记中的代码片段（组件、工具函数、Hooks等）',
    {
      projectPath: z.string().describe('项目根目录的绝对路径'),
      category: z.enum(['component', 'function', 'hook', 'style', 'tip', 'solution'])
        .describe('片段分类：component(组件), function(工具函数), hook(Hooks), style(样式), tip(技巧), solution(问题解决)'),
      title: z.string().describe('片段标题'),
      description: z.string().describe('片段描述'),
      code: z.string().describe('代码内容'),
      language: z.string().optional().default('typescript').describe('代码语言'),
      tags: z.array(z.string()).optional().default([]).describe('标签列表'),
      notes: z.string().optional().describe('使用说明或注意事项'),
    },
    async ({ projectPath, category, title, description, code, language, tags, notes }) => {
      try {
        const result = await addPersonalSnippet(projectPath, {
          category,
          title,
          description,
          code,
          language,
          tags,
          notes,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: '个人代码片段添加成功',
                path: result.path,
                category: result.category,
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 工具 8: 读取个人笔记
  server.tool(
    'read_personal_notes',
    '读取个人开发笔记内容',
    {
      projectPath: z.string().describe('项目根目录的绝对路径'),
      category: z.enum(['component', 'function', 'hook', 'style', 'tip', 'solution'])
        .optional()
        .describe('可选：指定要读取的分类'),
    },
    async ({ projectPath, category }) => {
      try {
        const result = await readPersonalNotes(projectPath, category);

        if (!result.exists) {
          return {
            content: [
              {
                type: 'text',
                text: result.content || 'PERSONAL_NOTES.md 不存在',
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: result.content,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 工具 9: 搜索个人代码片段
  server.tool(
    'search_personal_snippets',
    '在个人开发笔记中搜索代码片段',
    {
      projectPath: z.string().describe('项目根目录的绝对路径'),
      keyword: z.string().describe('搜索关键词'),
    },
    async ({ projectPath, keyword }) => {
      try {
        const result = await searchPersonalSnippets(projectPath, keyword);

        if (!result.exists) {
          return {
            content: [
              {
                type: 'text',
                text: result.message,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                keyword: result.keyword,
                count: result.count,
                results: result.results,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 工具 10: 列出个人笔记概要
  server.tool(
    'list_personal_snippets',
    '列出个人开发笔记中所有片段的概要统计',
    {
      projectPath: z.string().describe('项目根目录的绝对路径'),
    },
    async ({ projectPath }) => {
      try {
        const result = await listPersonalSnippets(projectPath);

        if (!result.exists) {
          return {
            content: [
              {
                type: 'text',
                text: result.message || '个人笔记不存在，添加第一个片段后将自动创建',
              },
            ],
          };
        }

        let summary = `# 个人笔记概要\n\n`;
        summary += `**总计**: ${result.totalCount} 个片段\n\n`;
        
        if (result.categories.length > 0) {
          summary += `## 分类统计\n\n`;
          result.categories.forEach(cat => {
            summary += `- **${cat.name}**: ${cat.count} 个\n`;
          });
        }

        return {
          content: [
            {
              type: 'text',
              text: summary,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 工具 11: 设置核心必读内容
  server.tool(
    'set_core_guidelines',
    '设置核心必读内容 - AI 在生成任何代码前必须阅读的强制规范',
    {
      projectPath: z.string().describe('项目根目录的绝对路径'),
      content: z.string().describe('核心必读内容（Markdown 格式），包含强制性开发规范、禁止事项、核心约定等'),
    },
    async ({ projectPath, content }) => {
      try {
        const result = await setCoreGuidelines(projectPath, content);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: result.success,
                message: result.message,
                filePath: result.filePath,
                notice: '⚠️ AI 在生成代码前会优先读取此文档，请确保内容准确',
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 工具 12: 读取核心必读内容
  server.tool(
    'read_core_guidelines',
    '读取核心必读内容 - 获取 AI 必须遵循的强制性开发规范',
    {
      projectPath: z.string().describe('项目根目录的绝对路径'),
    },
    async ({ projectPath }) => {
      try {
        const result = await readCoreGuidelines(projectPath);

        if (!result.exists) {
          return {
            content: [
              {
                type: 'text',
                text: result.message,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: result.content,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

const executedFileUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';

if (import.meta.url === executedFileUrl) {
  startServer().catch((error) => {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  });
}
