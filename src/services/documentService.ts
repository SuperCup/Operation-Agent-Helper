import PptxGenJS from 'pptxgenjs';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

interface DocumentData {
  title?: string;
  sections?: Array<{ title: string; content: string }>;
  rows?: Array<Record<string, any>>;
  sheets?: Array<{ name: string; data: any[][] }>;
  content?: string[];
  [key: string]: any;
}

interface DocumentGenerationOptions {
  type: 'ppt' | 'excel' | 'doc';
  data: DocumentData;
  filename?: string;
  template?: string;
  style?: Record<string, any>;
}

interface DocumentGenerationResult {
  blob: Blob;
  url: string;
  size: number;
  filename: string;
}

class DocumentService {
  /**
   * 生成PPT
   */
  async generatePPT(
    data: DocumentData,
    options?: { template?: string; filename?: string }
  ): Promise<DocumentGenerationResult> {
    const pptx = new PptxGenJS();

    // 设置演示文稿属性
    pptx.author = 'AI Agent';
    pptx.company = 'Operation Agent Helper';
    pptx.title = data.title || '运营方案';

    // 添加标题页
    const titleSlide = pptx.addSlide();
    titleSlide.addText(data.title || '运营方案', {
      x: 0.5,
      y: 2,
      w: 9,
      h: 1.5,
      fontSize: 44,
      bold: true,
      align: 'center',
      color: '363636',
    });

    if (data.subtitle) {
      titleSlide.addText(data.subtitle, {
        x: 0.5,
        y: 3.5,
        w: 9,
        h: 0.8,
        fontSize: 24,
        align: 'center',
        color: '666666',
      });
    }

    // 添加目录页（如果有多个章节）
    if (data.sections && data.sections.length > 1) {
      const tocSlide = pptx.addSlide();
      tocSlide.addText('目录', {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.8,
        fontSize: 32,
        bold: true,
      });

      data.sections.forEach((section, index) => {
        tocSlide.addText(`${index + 1}. ${section.title}`, {
          x: 1,
          y: 1.5 + index * 0.6,
          w: 8,
          h: 0.5,
          fontSize: 18,
        });
      });
    }

    // 添加内容页
    if (data.sections) {
      data.sections.forEach((section) => {
        const contentSlide = pptx.addSlide();
        
        // 章节标题
        contentSlide.addText(section.title, {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 0.8,
          fontSize: 28,
          bold: true,
          color: '1F4E78',
        });

        // 章节内容
        const contentLines = section.content.split('\n').filter((line) => line.trim());
        contentLines.forEach((line, index) => {
          contentSlide.addText(`• ${line}`, {
            x: 0.8,
            y: 1.5 + index * 0.4,
            w: 8.4,
            h: 0.35,
            fontSize: 16,
            bullet: true,
          });
        });
      });
    } else if (data.content) {
      // 如果没有章节，使用content数组
      data.content.forEach((paragraph) => {
        const contentSlide = pptx.addSlide();
        contentSlide.addText(paragraph, {
          x: 0.5,
          y: 1,
          w: 9,
          h: 5,
          fontSize: 18,
        });
      });
    }

    // 生成Blob
    const result = await pptx.write({ outputType: 'blob' });
    const blob = result instanceof Blob ? result : new Blob([result as BlobPart]);
    const filename = options?.filename || `${data.title || '运营方案'}.pptx`;
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      size: blob.size,
      filename,
    };
  }

  /**
   * 生成Excel
   */
  async generateExcel(
    data: DocumentData,
    options?: { template?: string; filename?: string }
  ): Promise<DocumentGenerationResult> {
    const workbook = XLSX.utils.book_new();

    // 如果有多个工作表
    if (data.sheets && data.sheets.length > 0) {
      data.sheets.forEach((sheet) => {
        const worksheet = XLSX.utils.aoa_to_sheet(sheet.data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
      });
    } else if (data.rows && data.rows.length > 0) {
      // 单个工作表，使用JSON数据
      const worksheet = XLSX.utils.json_to_sheet(data.rows);
      
      // 设置列宽
      const maxWidth = 50;
      const wcols = Object.keys(data.rows[0]).map(() => ({ wch: maxWidth }));
      worksheet['!cols'] = wcols;

      XLSX.utils.book_append_sheet(workbook, worksheet, '数据表');
    } else {
      // 创建空工作表
      const worksheet = XLSX.utils.aoa_to_sheet([['暂无数据']]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    }

    // 生成Blob
    const result = XLSX.write(workbook, {
      type: 'array',
      bookType: 'xlsx',
    });
    const blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const filename = options?.filename || `${data.title || '数据表'}.xlsx`;
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      size: blob.size,
      filename,
    };
  }

  /**
   * 生成Doc
   */
  async generateDoc(
    data: DocumentData,
    options?: { template?: string; filename?: string }
  ): Promise<DocumentGenerationResult> {
    const children: (Paragraph | any)[] = [];

    // 标题
    if (data.title) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: data.title,
              bold: true,
              size: 32,
            }),
          ],
          heading: HeadingLevel.TITLE,
          spacing: { after: 400 },
        })
      );
    }

    // 副标题
    if (data.subtitle) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: data.subtitle,
              size: 24,
              color: '666666',
            }),
          ],
          spacing: { after: 300 },
        })
      );
    }

    // 章节内容
    if (data.sections) {
      data.sections.forEach((section) => {
        // 章节标题
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.title,
                bold: true,
                size: 28,
                color: '1F4E78',
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 200 },
          })
        );

        // 章节内容
        const contentLines = section.content.split('\n').filter((line) => line.trim());
        contentLines.forEach((line) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  size: 22,
                }),
              ],
              spacing: { after: 200 },
            })
          );
        });
      });
    } else if (data.content) {
      // 使用content数组
      data.content.forEach((paragraph) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: paragraph,
                size: 22,
              }),
            ],
            spacing: { after: 200 },
          })
        );
      });
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children,
        },
      ],
    });

    // 生成Blob
    const blob = await Packer.toBlob(doc);
    const filename = options?.filename || `${data.title || '文档'}.docx`;
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      size: blob.size,
      filename,
    };
  }

  /**
   * 统一生成接口
   */
  async generateDocument(
    options: DocumentGenerationOptions
  ): Promise<DocumentGenerationResult> {
    let result: DocumentGenerationResult;

    switch (options.type) {
      case 'ppt':
        result = await this.generatePPT(options.data, {
          template: options.template,
          filename: options.filename,
        });
        break;
      case 'excel':
        result = await this.generateExcel(options.data, {
          template: options.template,
          filename: options.filename,
        });
        break;
      case 'doc':
        result = await this.generateDoc(options.data, {
          template: options.template,
          filename: options.filename,
        });
        break;
      default:
        throw new Error(`Unsupported document type: ${options.type}`);
    }

    return result;
  }

  /**
   * 下载文档
   */
  async downloadDocument(
    blob: Blob,
    filename: string
  ): Promise<void> {
    saveAs(blob, filename);
  }

  /**
   * 格式化文档数据（从任务输出转换为文档数据）
   */
  /**
   * 将任务输出格式化为文档数据
   */
  formatTaskOutputToDocumentData(
    taskOutput: any,
    type: 'ppt' | 'excel' | 'doc'
  ): DocumentData {
    // 如果已经是格式化好的数据，直接返回
    if (taskOutput.title || taskOutput.sections || taskOutput.rows) {
      return taskOutput;
    }

    // 如果是字符串，尝试解析
    if (typeof taskOutput === 'string') {
      try {
        const parsed = JSON.parse(taskOutput);
        return this.formatTaskOutputToDocumentData(parsed, type);
      } catch {
        // 如果不是JSON，作为纯文本处理
        return {
          title: '运营方案',
          content: taskOutput.split('\n').filter((line: string) => line.trim()),
        };
      }
    }

    // 如果是对象，尝试提取关键信息
    if (typeof taskOutput === 'object' && taskOutput !== null) {
      // 优先使用工作流输出数据
      let sourceData = taskOutput;
      
      // 如果有finalOutput，优先使用
      if (taskOutput.finalOutput) {
        sourceData = taskOutput.finalOutput;
      } 
      // 如果有workflowOutput，尝试提取最后一个步骤的输出
      else if (taskOutput.workflowOutput && typeof taskOutput.workflowOutput === 'object') {
        const workflowSteps = Object.values(taskOutput.workflowOutput);
        if (workflowSteps.length > 0) {
          sourceData = workflowSteps[workflowSteps.length - 1] as any;
        }
      }
      // 如果有workflowContext，尝试从中提取
      else if (taskOutput.workflowContext) {
        sourceData = taskOutput.workflowContext;
      }

      const data: DocumentData = {
        title: sourceData.title || taskOutput.title || taskOutput.name || taskOutput.projectName || '运营方案',
      };

      // 添加副标题（如果有项目名称）
      if (taskOutput.projectName && !sourceData.subtitle) {
        data.subtitle = `${taskOutput.brand || ''} ${taskOutput.platform || ''} 运营方案`.trim();
      }

      // 尝试提取章节
      if (sourceData.sections) {
        data.sections = sourceData.sections;
      } else if (sourceData.content) {
        // 如果content是字符串，转换为数组
        if (typeof sourceData.content === 'string') {
          data.content = sourceData.content.split('\n').filter((line: string) => line.trim());
        } else if (Array.isArray(sourceData.content)) {
          data.content = sourceData.content;
        } else {
          data.content = [String(sourceData.content)];
        }
      } else if (sourceData.data) {
        // 如果是表格数据
        if (type === 'excel') {
          data.rows = Array.isArray(sourceData.data) ? sourceData.data : [sourceData.data];
        } else {
          data.content = [JSON.stringify(sourceData.data, null, 2)];
        }
      } else if (sourceData.recommendations) {
        // 如果有推荐项，转换为内容
        data.content = Array.isArray(sourceData.recommendations)
          ? sourceData.recommendations
          : [String(sourceData.recommendations)];
      } else if (taskOutput.projectName || taskOutput.brand || taskOutput.platform) {
        // 如果有基本信息，至少生成一个基本文档
        const basicInfo = [];
        if (taskOutput.projectName) basicInfo.push(`项目名称: ${taskOutput.projectName}`);
        if (taskOutput.brand) basicInfo.push(`品牌: ${taskOutput.brand}`);
        if (taskOutput.platform) basicInfo.push(`平台: ${taskOutput.platform}`);
        if (taskOutput.budget) basicInfo.push(`预算: ${taskOutput.budget}万元`);
        data.content = basicInfo.length > 0 ? basicInfo : ['运营方案内容'];
      }

      return data;
    }

    // 默认返回
    return {
      title: '运营方案',
      content: ['暂无内容'],
    };
  }
}

export const documentService = new DocumentService();
