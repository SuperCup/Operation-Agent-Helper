import { AgentMessage, IntentType } from '@/types';

interface IntentRecognitionResult {
  intent: IntentType | null;
  confidence: number;
  summary: string;
  reasoning?: string;
}

interface AgentExecutionResult {
  output: any;
  thinking?: string;
  logs?: string[];
}

class AgentService {
  private apiKey: string | null = null;
  private apiBaseUrl: string = 'https://api.deepseek.com';
  private useProxy: boolean = false;
  private proxyBaseUrl: string = '';

  constructor() {
    // 从环境变量读取配置
    this.apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || null;
    this.apiBaseUrl = import.meta.env.VITE_DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com';
    this.useProxy = import.meta.env.VITE_USE_API_PROXY === 'true';
    this.proxyBaseUrl = import.meta.env.VITE_PROXY_BASE_URL || '';

    // 如果没有配置API密钥，使用模拟模式
    if (!this.apiKey && !this.useProxy) {
      console.warn('⚠️ DeepSeek API key not configured. Using mock mode.');
    }
  }

  /**
   * 意图识别
   */
  async recognizeIntent(
    message: string,
    context?: { history?: AgentMessage[] }
  ): Promise<IntentRecognitionResult> {
      // 如果未配置API，使用模拟识别
    if (!this.apiKey && !this.useProxy) {
      return this.mockRecognizeIntent(message);
    }

    try {
      const prompt = this.buildIntentRecognitionPrompt(message, context);

      if (this.useProxy) {
        return await this.callViaProxy('/api/intent/recognize', {
          message,
          context,
          prompt,
        });
      }

      // 直接调用OpenAI API
      return await this.callOpenAI(prompt, message);
    } catch (error: any) {
      console.error('Intent recognition failed:', error);
      // 降级到模拟识别
      return this.mockRecognizeIntent(message);
    }
  }

  /**
   * 执行Agent任务
   */
  async executeAgent(
    agentId: string,
    taskId: string,
    params: Record<string, any>,
    systemPrompt?: string
  ): Promise<AgentExecutionResult> {
      // 如果未配置API，使用模拟执行
    if (!this.apiKey && !this.useProxy) {
      return this.mockExecuteAgent(agentId, params);
    }

    try {
      const prompt = this.buildExecutionPrompt(agentId, params, systemPrompt);

      if (this.useProxy) {
        return await this.callViaProxy('/api/agents/execute', {
          agentId,
          taskId,
          params,
          prompt,
        });
      }

      // 直接调用OpenAI API
      const response = await this.callOpenAIForExecution(prompt, params);
      return {
        output: response.content,
        thinking: response.thinking,
        logs: response.logs,
      };
    } catch (error: any) {
      console.error('Agent execution failed:', error);
      // 降级到模拟执行
      return this.mockExecuteAgent(agentId, params);
    }
  }

  /**
   * 调用DeepSeek API（意图识别）
   */
  private async callOpenAI(
    systemPrompt: string,
    userMessage: string
  ): Promise<IntentRecognitionResult> {
    // 动态导入openai库（如果已安装）
    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({
        apiKey: this.apiKey!,
        baseURL: this.apiBaseUrl,
        dangerouslyAllowBrowser: true,
      });

      const response = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      // 如果openai库未安装，使用fetch
      return await this.callOpenAIWithFetch(systemPrompt, userMessage);
    }
  }

  /**
   * 使用fetch调用DeepSeek API
   */
  private async callOpenAIWithFetch(
    systemPrompt: string,
    userMessage: string
  ): Promise<IntentRecognitionResult> {
    const response = await fetch(`${this.apiBaseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content || '{}';
    return JSON.parse(content);
  }

  /**
   * 调用DeepSeek API（执行任务）
   */
  private async callOpenAIForExecution(
    prompt: string,
    params: Record<string, any>
  ): Promise<{ content: string; thinking?: string; logs?: string[] }> {
    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({
        apiKey: this.apiKey!,
        baseURL: this.apiBaseUrl,
        dangerouslyAllowBrowser: true,
      });

      const response = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: prompt },
          {
            role: 'user',
            content: `请基于以下参数执行任务：\n${JSON.stringify(params, null, 2)}`,
          },
        ],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content || '';
      return {
        content,
        thinking: content, // 简化处理，实际应该分离thinking和output
        logs: ['任务执行完成'],
      };
    } catch (error) {
      // 如果openai库未安装，使用fetch
      return await this.callOpenAIForExecutionWithFetch(prompt, params);
    }
  }

  /**
   * 使用fetch调用DeepSeek API（执行任务）
   */
  private async callOpenAIForExecutionWithFetch(
    prompt: string,
    params: Record<string, any>
  ): Promise<{ content: string; thinking?: string; logs?: string[] }> {
    const response = await fetch(`${this.apiBaseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: prompt },
          {
            role: 'user',
            content: `请基于以下参数执行任务：\n${JSON.stringify(params, null, 2)}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content || '';
    return {
      content,
      thinking: content,
      logs: ['任务执行完成'],
    };
  }

  /**
   * 通过代理调用
   */
  private async callViaProxy(endpoint: string, data: any): Promise<any> {
    const url = `${this.proxyBaseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Proxy API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 构建意图识别Prompt
   */
  private buildIntentRecognitionPrompt(
    message: string,
    context?: { history?: AgentMessage[] }
  ): string {
    const historyContext = context?.history
      ? `\n对话历史：\n${context.history
          .slice(-5)
          .map((m) => `${m.type}: ${m.content}`)
          .join('\n')}`
      : '';

    return `你是一个意图识别专家。请分析用户的输入，识别用户的意图。

可用的意图类型：
1. operation_plan - 运营方案生成
2. budget_split - 预算拆分
3. activity_config - 活动配置
4. activity_ops - 活动运营
5. rtb_plan - RTB方案
6. rtb_config - RTB配置
7. rtb_ops - RTB运营

${historyContext}

用户输入：${message}

请以JSON格式返回：
{
  "intent": "意图类型或null",
  "confidence": 0.0-1.0,
  "summary": "用户意图摘要",
  "reasoning": "识别理由"
}`;
  }

  /**
   * 构建执行Prompt
   */
  private buildExecutionPrompt(
    _agentId: string,
    params: Record<string, any>,
    systemPrompt?: string
  ): string {
    return (
      systemPrompt ||
      `你是一个专业的运营助手。请根据提供的参数执行任务，并返回详细的结果。

任务参数：
${JSON.stringify(params, null, 2)}

请提供：
1. 详细的分析和思考过程
2. 具体的执行方案或结果
3. 相关的建议和注意事项`
    );
  }

  /**
   * 模拟意图识别（降级方案）
   */
  private mockRecognizeIntent(message: string): IntentRecognitionResult {
    const lowerInput = message.toLowerCase();

    const intentKeywords: Record<IntentType, string[]> = {
      operation_plan: ['方案', '运营方案', '生成方案', '制定方案'],
      budget_split: ['预算', '预算拆分', '预算分配'],
      activity_config: ['活动配置', '配置活动', '活动设置'],
      activity_ops: ['活动运营', '活动执行', '活动监控'],
      rtb_plan: ['rtb方案', '竞价方案', '广告方案'],
      rtb_config: ['rtb配置', '广告配置', '竞价配置'],
      rtb_ops: ['rtb运营', '广告运营', '竞价运营'],
    };

    let matchedIntent: IntentType | null = null;
    let maxMatches = 0;

    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      const matches = keywords.filter((keyword) => lowerInput.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        matchedIntent = intent as IntentType;
      }
    }

    const confidence = maxMatches > 0 ? 0.8 : 0.3;
    const summary = message.length > 50 ? message.substring(0, 50) + '...' : message;

    return {
      intent: matchedIntent,
      confidence,
      summary,
      reasoning: matchedIntent
        ? `检测到关键词匹配：${intentKeywords[matchedIntent].join(', ')}`
        : '未检测到明确的意图关键词',
    };
  }

  /**
   * 模拟Agent执行（降级方案）
   */
  private mockExecuteAgent(
    _agentId: string,
    params: Record<string, any>
  ): AgentExecutionResult {
    // 模拟执行延迟
    const mockOutput = {
      title: '模拟执行结果',
      content: `基于参数 ${JSON.stringify(params)} 生成的模拟结果`,
      recommendations: ['建议1', '建议2', '建议3'],
    };

    return {
      output: mockOutput,
      thinking: '这是模拟的思考过程，实际使用时需要配置API密钥',
      logs: ['步骤1完成', '步骤2完成', '执行完成'],
    };
  }
}

export const agentService = new AgentService();
