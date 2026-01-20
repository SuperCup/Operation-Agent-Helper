// 项目阶段
export type ProjectPhase = 
  | 'preparation'      // 项目准备阶段
  | 'planning'         // 项目启动阶段
  | 'execution'        // 项目进行阶段
  | 'monitoring'       // 计划执行监控
  | 'completion';      // 项目结束阶段

// 项目状态
export type ProjectStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

// Agent执行步骤状态
export type StepStatus = 'pending' | 'running' | 'success' | 'failed' | 'waiting_human';

// 运营类型
export type OperationType = 'activity' | 'ad' | 'both';

// 平台类型
export type PlatformType = 'meituan' | 'eleme' | 'jd' | 'douyin';

// 项目
export interface Project {
  id: string;
  name: string;
  description: string;
  phase: ProjectPhase;
  status: ProjectStatus;
  platform: PlatformType;
  operationType: OperationType;
  createdAt: Date;
  updatedAt: Date;
  brand: string;
  category: string;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
}

// 工作流步骤
export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: StepStatus;
  progress: number;
  startTime?: Date;
  endTime?: Date;
  output?: any;
  requiresHumanInput?: boolean;
  humanInputPrompt?: string;
  logs: string[];
}

// 工作流
export interface Workflow {
  id: string;
  projectId: string;
  phase: ProjectPhase;
  name: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
}

// 文档类型
export type DocumentType = 
  | 'operation_plan'      // 运营方案
  | 'execution_plan'      // 执行计划
  | 'submission_form'     // 提报表
  | 'evaluation_report'   // 效果评估报告
  | 'final_report';       // 结案报告

// 文档
export interface Document {
  id: string;
  projectId: string;
  type: DocumentType;
  title: string;
  content: any;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: 'ai' | 'human';
}

// 数据指标
export interface Metrics {
  date: string;
  exposure: number;        // 曝光量
  clicks: number;          // 点击量
  orders: number;          // 订单量
  gmv: number;             // 成交额
  cost: number;            // 投放成本
  roi: number;             // 投资回报率
  ctr: number;             // 点击率
  cvr: number;             // 转化率
}

// 知识库条目
export interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  brand?: string;
  platform: PlatformType;
  operationType: OperationType;
  content: any;
  tags: string[];
  performance: {
    roi: number;
    gmv: number;
    orders: number;
  };
  createdAt: Date;
}

// Agent消息
export interface AgentMessage {
  id: string;
  type: 'system' | 'agent' | 'user' | 'error' | 'success';
  content: string;
  timestamp: Date;
  metadata?: any;
}

// AI模型类型
export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'azure' | 'local';

export type ModelType = 
  | 'gpt-4'
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo'
  | 'claude-3-opus'
  | 'claude-3-sonnet'
  | 'claude-3-haiku'
  | 'gemini-pro'
  | 'gemini-ultra'
  | 'azure-gpt-4'
  | 'local-llama';

// AI模型配置
export interface AIModel {
  id: string;
  name: string;
  provider: ModelProvider;
  type: ModelType;
  description: string;
  maxTokens: number;
  temperature: number;
  costPer1kTokens: number;
  capabilities: string[];
  enabled: boolean;
}

// 提示词模板
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  phase: ProjectPhase;
  category: 'analysis' | 'planning' | 'execution' | 'evaluation' | 'reporting';
  template: string;
  variables: PromptVariable[];
  systemPrompt?: string;
  examples?: PromptExample[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  defaultValue?: any;
}

export interface PromptExample {
  input: Record<string, any>;
  output: string;
}

// Agent配置
export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  phase: ProjectPhase;
  model: string; // model id
  temperature: number;
  maxTokens: number;
  prompts: {
    systemPrompt: string;
    taskPrompts: Record<string, string>;
  };
  tools: AgentTool[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

// 工作流模板
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  phase: ProjectPhase;
  steps: WorkflowStepTemplate[];
  agentConfig?: string; // agent config id
  enabled: boolean;
  isDefault: boolean;
  usageCount: number;
  successRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStepTemplate {
  id: string;
  name: string;
  description: string;
  type: 'analysis' | 'generation' | 'validation' | 'submission' | 'notification' | 'evaluation';
  estimatedDuration: number; // seconds
  promptTemplate?: string; // prompt template id
  requiresHumanInput?: boolean;
  humanInputPrompt?: string;
  config?: Record<string, any>;
}

// 提示词测试结果
export interface PromptTestResult {
  id: string;
  promptId: string;
  input: Record<string, any>;
  output: string;
  model: string;
  duration: number;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  success: boolean;
  error?: string;
  timestamp: Date;
}
