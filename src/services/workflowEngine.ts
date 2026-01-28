import { WorkflowTemplate, StepStatus } from '@/types';
import { agentService } from './agentService';

interface WorkflowExecution {
  id: string;
  templateId: string;
  taskId: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  currentStepId?: string;
  steps: WorkflowStepExecution[];
  context: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowStepExecution {
  id: string;
  stepTemplateId: string;
  name: string;
  description: string;
  status: StepStatus;
  progress: number;
  input?: any;
  output?: any;
  error?: string;
  thinking?: string;
  logs: string[];
  startTime?: Date;
  endTime?: Date;
  requiresHumanInput?: boolean;
  humanInputPrompt?: string;
}

type ExecutionListener = (execution: WorkflowExecution) => void;

class WorkflowEngine {
  private executions: Map<string, WorkflowExecution> = new Map();
  private listeners: Map<string, Set<ExecutionListener>> = new Map();
  private dbName = 'WorkflowDB';
  private dbVersion = 1;
  private storeName = 'executions';

  constructor() {
    // 初始化IndexedDB
    this.initDB();
  }

  /**
   * 初始化IndexedDB
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * 启动工作流
   */
  async startWorkflow(
    template: WorkflowTemplate,
    taskId: string,
    initialParams: Record<string, any>
  ): Promise<string> {
    const executionId = `wf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const execution: WorkflowExecution = {
      id: executionId,
      templateId: template.id,
      taskId,
      status: 'running',
      steps: template.steps.map((stepTemplate) => ({
        id: `step-${Date.now()}-${stepTemplate.id}-${Math.random().toString(36).substr(2, 5)}`,
        stepTemplateId: stepTemplate.id,
        name: stepTemplate.name,
        description: stepTemplate.description,
        status: 'pending' as StepStatus,
        progress: 0,
        logs: [],
        requiresHumanInput: stepTemplate.requiresHumanInput,
        humanInputPrompt: stepTemplate.humanInputPrompt,
      })),
      context: initialParams,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.executions.set(executionId, execution);
    await this.persistExecution(execution);
    this.notifyListeners(executionId, execution);

    // 异步执行
    this.executeWorkflow(executionId).catch((error) => {
      console.error('Workflow execution failed:', error);
      this.updateExecution(executionId, {
        status: 'failed',
        steps: execution.steps.map((s) =>
          s.id === execution.currentStepId
            ? {
                ...s,
                status: 'failed' as StepStatus,
                error: error.message,
                endTime: new Date(),
              }
            : s
        ),
      });
    });

    return executionId;
  }

  /**
   * 执行工作流
   */
  private async executeWorkflow(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    // 如果已暂停或失败，不执行
    if (execution.status === 'paused' || execution.status === 'failed') {
      return;
    }

    const template = await this.getTemplate(execution.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // 顺序执行步骤
    for (let i = 0; i < template.steps.length; i++) {
      const stepTemplate = template.steps[i];
      const step = execution.steps[i];

      // 重新获取最新状态
      const currentExecution = this.executions.get(executionId);
      if (!currentExecution) break;

      // 检查是否需要暂停
      if (currentExecution.status === 'paused' || currentExecution.status === 'failed') {
        break;
      }

      // 更新当前步骤
      this.updateExecution(executionId, {
        currentStepId: step.id,
        steps: execution.steps.map((s) =>
          s.id === step.id
            ? {
                ...s,
                status: 'running' as StepStatus,
                startTime: new Date(),
                progress: 0,
              }
            : s
        ),
      });

      try {
        // 执行步骤
        const result = await this.executeStep(
          stepTemplate,
          execution.context
        );

        // 更新步骤结果
        this.updateExecution(executionId, {
          steps: execution.steps.map((s) =>
            s.id === step.id
              ? {
                  ...s,
                  status: 'success' as StepStatus,
                  progress: 100,
                  output: result.output,
                  thinking: result.thinking,
                  logs: result.logs,
                  endTime: new Date(),
                }
              : s
          ),
          context: { ...execution.context, ...result.context },
        });

        // 演示模式：跳过人工确认，自动继续
        // 如果需要人工确认，暂停（演示模式下已禁用）
        // if (stepTemplate.requiresHumanInput) {
        //   const currentExec = this.executions.get(executionId);
        //   if (currentExec) {
        //     this.updateExecution(executionId, {
        //       status: 'paused',
        //       steps: currentExec.steps.map((s) =>
        //         s.id === step.id
        //           ? { ...s, status: 'waiting_human' as StepStatus }
        //           : s
        //       ),
        //     });
        //     break;
        //   }
        // }
      } catch (error: any) {
        // 步骤失败
        this.updateExecution(executionId, {
          steps: execution.steps.map((s) =>
            s.id === step.id
              ? {
                  ...s,
                  status: 'failed' as StepStatus,
                  error: error.message,
                  endTime: new Date(),
                }
              : s
          ),
          status: 'failed',
        });
        throw error;
      }
    }

    // 所有步骤完成
    const currentExecution = this.executions.get(executionId);
    if (
      currentExecution &&
      currentExecution.status !== 'paused' &&
      currentExecution.status !== 'failed'
    ) {
      this.updateExecution(executionId, { status: 'completed' });
    }
  }

  /**
   * 执行单个步骤
   */
  private async executeStep(
    stepTemplate: any,
    context: Record<string, any>
  ): Promise<{
    output: any;
    thinking?: string;
    logs: string[];
    context: Record<string, any>;
  }> {
    const logs: string[] = [];
    logs.push(`开始执行: ${stepTemplate.name}`);

    // 根据步骤类型执行
    switch (stepTemplate.type) {
      case 'analysis':
        return await this.executeAnalysisStep(stepTemplate, context, logs);
      case 'generation':
        return await this.executeGenerationStep(stepTemplate, context, logs);
      case 'validation':
        return await this.executeValidationStep(stepTemplate, context, logs);
      default:
        logs.push(`未知步骤类型: ${stepTemplate.type}`);
        return {
          output: null,
          logs,
          context,
        };
    }
  }

  /**
   * 执行分析步骤
   */
  private async executeAnalysisStep(
    stepTemplate: any,
    context: Record<string, any>,
    logs: string[]
  ): Promise<{
    output: any;
    thinking?: string;
    logs: string[];
    context: Record<string, any>;
  }> {
    logs.push('正在调用Agent进行分析...');

    try {
      // 获取Agent配置
      const agentConfig = stepTemplate.agentConfig
        ? await this.getAgentConfig(stepTemplate.agentConfig)
        : null;

      // 调用Agent
      const result = await agentService.executeAgent(
        stepTemplate.agentConfig || context.agentId || '',
        context.taskId || '',
        context,
        agentConfig?.prompts?.systemPrompt
      );

      logs.push('分析完成');
      return {
        output: result.output,
        thinking: result.thinking,
        logs,
        context: { ...context, analysis: result.output },
      };
    } catch (error: any) {
      logs.push(`分析失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 执行生成步骤
   */
  private async executeGenerationStep(
    stepTemplate: any,
    context: Record<string, any>,
    logs: string[]
  ): Promise<{
    output: any;
    thinking?: string;
    logs: string[];
    context: Record<string, any>;
  }> {
    logs.push('正在调用Agent进行生成...');

    try {
      // 获取Agent配置
      const agentConfig = stepTemplate.agentConfig
        ? await this.getAgentConfig(stepTemplate.agentConfig)
        : null;

      // 调用Agent
      const result = await agentService.executeAgent(
        stepTemplate.agentConfig || context.agentId || '',
        context.taskId || '',
        context,
        agentConfig?.prompts?.systemPrompt
      );

      logs.push('生成完成');
      return {
        output: result.output,
        thinking: result.thinking,
        logs,
        context: { ...context, generated: result.output },
      };
    } catch (error: any) {
      logs.push(`生成失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 执行验证步骤
   */
  private async executeValidationStep(
    _stepTemplate: any,
    context: Record<string, any>,
    logs: string[]
  ): Promise<{
    output: any;
    thinking?: string;
    logs: string[];
    context: Record<string, any>;
  }> {
    // 演示模式：自动通过验证
    logs.push('自动验证通过（演示模式）');
    return {
      output: { validated: true, timestamp: new Date().toISOString() },
      thinking: '演示模式下自动通过验证，无需人工确认',
      logs,
      context,
    };
  }

  /**
   * 更新执行状态
   */
  private updateExecution(
    executionId: string,
    updates: Partial<WorkflowExecution>
  ): void {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    const updated = {
      ...execution,
      ...updates,
      updatedAt: new Date(),
    };

    this.executions.set(executionId, updated);
    this.persistExecution(updated);
    this.notifyListeners(executionId, updated);
  }

  /**
   * 持久化到IndexedDB
   */
  private async persistExecution(execution: WorkflowExecution): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      await new Promise<void>((resolve, reject) => {
        const request = store.put(execution);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to persist execution:', error);
    }
  }

  /**
   * 从IndexedDB恢复
   */
  async restoreExecution(executionId: string): Promise<WorkflowExecution | null> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      return new Promise<WorkflowExecution | null>((resolve, reject) => {
        const request = store.get(executionId);
        request.onsuccess = () => {
          const execution = request.result as WorkflowExecution | null;
          if (execution) {
            this.executions.set(executionId, execution);
          }
          resolve(execution || null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to restore execution:', error);
      return null;
    }
  }

  /**
   * 获取IndexedDB实例
   */
  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * 订阅执行更新
   */
  onExecutionUpdate(
    executionId: string,
    callback: ExecutionListener
  ): () => void {
    if (!this.listeners.has(executionId)) {
      this.listeners.set(executionId, new Set());
    }
    this.listeners.get(executionId)!.add(callback);

    // 返回取消订阅函数
    return () => {
      const listeners = this.listeners.get(executionId);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * 通知监听器
   */
  private notifyListeners(executionId: string, execution: WorkflowExecution): void {
    const listeners = this.listeners.get(executionId);
    if (listeners) {
      listeners.forEach((callback) => callback(execution));
    }
  }

  /**
   * 获取模板（模拟数据）
   */
  private async getTemplate(templateId: string): Promise<WorkflowTemplate | null> {
    // 返回模拟的工作流模板
    return {
      id: templateId,
      name: '运营方案生成工作流',
      description: '生成运营方案的完整工作流',
      phase: 'preparation',
      steps: [
        { id: 'step-1', name: '需求分析', description: '分析用户需求', type: 'analysis', estimatedDuration: 30 },
        { id: 'step-2', name: '方案生成', description: '生成运营方案', type: 'generation', estimatedDuration: 60 },
        { id: 'step-3', name: '方案优化', description: '优化方案内容', type: 'validation', estimatedDuration: 30 },
      ],
      enabled: true,
      isDefault: true,
      usageCount: 0,
      successRate: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * 获取Agent配置（模拟数据）
   */
  private async getAgentConfig(agentId: string): Promise<any> {
    // 返回模拟的Agent配置
    return {
      id: agentId,
      name: '运营方案生成Agent',
      description: '专门用于生成运营方案的智能体',
      phase: 'preparation',
      model: 'deepseek-chat',
      temperature: 0.7,
      maxTokens: 2000,
      prompts: {
        systemPrompt: '你是一个专业的运营方案生成助手。',
        taskPrompts: {},
      },
      tools: [],
      enabled: true,
      publishStatus: 'published',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * 获取执行状态
   */
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  /**
   * 暂停工作流
   */
  pauseWorkflow(executionId: string): void {
    this.updateExecution(executionId, { status: 'paused' });
  }

  /**
   * 恢复工作流
   */
  resumeWorkflow(executionId: string): void {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'paused') {
      this.updateExecution(executionId, { status: 'running' });
      this.executeWorkflow(executionId);
    }
  }

  /**
   * 取消工作流
   */
  cancelWorkflow(executionId: string): void {
    this.updateExecution(executionId, { status: 'failed' });
  }

  /**
   * 确认人工输入
   */
  confirmHumanInput(executionId: string, input?: any): void {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'paused') {
      // 更新上下文
      const updatedContext = input
        ? { ...execution.context, humanInput: input }
        : execution.context;

      // 继续执行
      this.updateExecution(executionId, {
        status: 'running',
        context: updatedContext,
      });
      this.executeWorkflow(executionId);
    }
  }
}

export const workflowEngine = new WorkflowEngine();
