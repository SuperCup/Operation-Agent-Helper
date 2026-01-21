import { 
  AIModel, 
  AgentConfig, 
  PromptTemplate, 
  WorkflowTemplate,
  PromptTestResult
} from '@/types';

// AI模型数据
export const mockModels: AIModel[] = [
  {
    id: 'model-1',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    type: 'gpt-4-turbo',
    description: '最新的GPT-4模型，性能强大，适合复杂任务',
    maxTokens: 128000,
    temperature: 0.7,
    costPer1kTokens: 0.01,
    capabilities: ['文本生成', '数据分析', '代码生成', '推理'],
    enabled: true,
  },
  {
    id: 'model-2',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    type: 'gpt-3.5-turbo',
    description: '高性价比选择，适合日常任务',
    maxTokens: 16000,
    temperature: 0.7,
    costPer1kTokens: 0.002,
    capabilities: ['文本生成', '数据分析', '简单推理'],
    enabled: true,
  },
  {
    id: 'model-3',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    type: 'claude-3-opus',
    description: 'Anthropic最强模型，擅长复杂推理',
    maxTokens: 200000,
    temperature: 0.7,
    costPer1kTokens: 0.015,
    capabilities: ['文本生成', '深度分析', '代码生成', '高级推理'],
    enabled: true,
  },
  {
    id: 'model-4',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    type: 'claude-3-sonnet',
    description: '平衡性能和成本的选择',
    maxTokens: 200000,
    temperature: 0.7,
    costPer1kTokens: 0.003,
    capabilities: ['文本生成', '数据分析', '推理'],
    enabled: true,
  },
  {
    id: 'model-5',
    name: 'Gemini Pro',
    provider: 'google',
    type: 'gemini-pro',
    description: 'Google的多模态AI模型',
    maxTokens: 32000,
    temperature: 0.7,
    costPer1kTokens: 0.0005,
    capabilities: ['文本生成', '图像理解', '数据分析'],
    enabled: true,
  },
];

// 提示词模板数据
export const mockPromptTemplates: PromptTemplate[] = [
  {
    id: 'prompt-1',
    name: '运营方案生成',
    description: '根据项目信息生成完整的运营方案',
    phase: 'preparation',
    category: 'planning',
    systemPrompt: '你是一位资深的电商运营专家，擅长制定到家平台的活动运营和广告投放方案。',
    template: `请为以下项目生成详细的运营方案：

项目信息：
- 品牌：{{brand}}
- 品类：{{category}}
- 平台：{{platform}}
- 预算：{{budget}}元
- 时间：{{startDate}} 至 {{endDate}}
- 运营目标：{{objectives}}

要求：
1. 分析市场环境和竞品情况
2. 提出3-5个具体的运营策略
3. 为每个策略预估ROI
4. 给出详细的预算分配建议
5. 提供执行时间表

请以专业、结构化的方式输出方案。`,
    variables: [
      { name: 'brand', type: 'string', description: '品牌名称', required: true },
      { name: 'category', type: 'string', description: '产品品类', required: true },
      { name: 'platform', type: 'string', description: '投放平台', required: true },
      { name: 'budget', type: 'number', description: '总预算', required: true },
      { name: 'startDate', type: 'string', description: '开始日期', required: true },
      { name: 'endDate', type: 'string', description: '结束日期', required: true },
      { name: 'objectives', type: 'string', description: '运营目标', required: false },
    ],
    examples: [
      {
        input: {
          brand: '某饮料品牌',
          category: '饮料',
          platform: '美团',
          budget: 500000,
          startDate: '2026-01-15',
          endDate: '2026-02-15',
          objectives: '提升品牌曝光，增加销量',
        },
        output: '【运营方案】\n\n一、市场分析...',
      },
    ],
    version: 1,
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-15'),
  },
  {
    id: 'prompt-2',
    name: '活动提报表生成',
    description: '生成平台活动提报所需的表格和内容',
    phase: 'execution',
    category: 'execution',
    systemPrompt: '你是一位经验丰富的活动运营专员，熟悉各大平台的活动提报流程和要求。',
    template: `请根据以下信息生成美团平台的活动提报表：

活动信息：
- 活动名称：{{activityName}}
- 活动类型：{{activityType}}
- 活动时间：{{startTime}} 至 {{endTime}}
- 活动预算：{{budget}}元
- 商品信息：{{products}}
- 优惠力度：{{discount}}

要求：
1. 生成标准的提报表格式
2. 包含活动标题、卖点、规则说明
3. 列出参与商品和价格
4. 说明预期效果
5. 符合平台审核要求

请输出完整的提报表内容。`,
    variables: [
      { name: 'activityName', type: 'string', description: '活动名称', required: true },
      { name: 'activityType', type: 'string', description: '活动类型', required: true },
      { name: 'startTime', type: 'string', description: '开始时间', required: true },
      { name: 'endTime', type: 'string', description: '结束时间', required: true },
      { name: 'budget', type: 'number', description: '活动预算', required: true },
      { name: 'products', type: 'array', description: '商品列表', required: true },
      { name: 'discount', type: 'string', description: '优惠力度', required: true },
    ],
    version: 1,
    createdAt: new Date('2026-01-12'),
    updatedAt: new Date('2026-01-12'),
  },
  {
    id: 'prompt-3',
    name: '数据分析洞察',
    description: '分析运营数据并提供优化建议',
    phase: 'monitoring',
    category: 'evaluation',
    systemPrompt: '你是一位数据分析专家，擅长从运营数据中发现问题和机会。',
    template: `请分析以下运营数据并提供洞察：

数据周期：{{period}}
数据指标：
- 曝光量：{{exposure}}
- 点击量：{{clicks}}
- 订单量：{{orders}}
- GMV：{{gmv}}元
- 投放成本：{{cost}}元
- ROI：{{roi}}
- 点击率：{{ctr}}%
- 转化率：{{cvr}}%

历史对比：
{{historicalData}}

要求：
1. 分析各项指标的表现
2. 识别异常数据和趋势变化
3. 找出表现最好和最差的时段/渠道
4. 提供3-5条具体的优化建议
5. 预测未来趋势

请给出专业的分析报告。`,
    variables: [
      { name: 'period', type: 'string', description: '数据周期', required: true },
      { name: 'exposure', type: 'number', description: '曝光量', required: true },
      { name: 'clicks', type: 'number', description: '点击量', required: true },
      { name: 'orders', type: 'number', description: '订单量', required: true },
      { name: 'gmv', type: 'number', description: 'GMV', required: true },
      { name: 'cost', type: 'number', description: '成本', required: true },
      { name: 'roi', type: 'number', description: 'ROI', required: true },
      { name: 'ctr', type: 'number', description: '点击率', required: true },
      { name: 'cvr', type: 'number', description: '转化率', required: true },
      { name: 'historicalData', type: 'string', description: '历史数据', required: false },
    ],
    version: 1,
    createdAt: new Date('2026-01-14'),
    updatedAt: new Date('2026-01-18'),
  },
];

// Agent配置数据
export const mockAgentConfigs: AgentConfig[] = [
  {
    id: 'agent-1',
    name: '运营方案生成Agent',
    description: '用于项目准备阶段，生成完整的运营方案',
    phase: 'preparation',
    model: 'model-1',
    temperature: 0.7,
    maxTokens: 4000,
    prompts: {
      systemPrompt: '你是一位资深的电商运营专家，擅长制定到家平台的活动运营和广告投放方案。',
      taskPrompts: {
        analyze: '请分析市场环境和竞品情况',
        strategy: '请提出具体的运营策略',
        budget: '请给出详细的预算分配建议',
      },
    },
    tools: [
      { id: 'tool-1', name: '知识库检索', description: '从历史案例中检索相似方案', enabled: true },
      { id: 'tool-2', name: '数据分析', description: '分析历史数据趋势', enabled: true },
    ],
    enabled: true,
    publishStatus: 'published',
    version: 3,
    publishedAt: new Date('2026-01-15'),
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-15'),
  },
  {
    id: 'agent-2',
    name: '执行计划生成Agent',
    description: '用于项目启动阶段，生成详细的执行计划',
    phase: 'planning',
    model: 'model-2',
    temperature: 0.6,
    maxTokens: 3000,
    prompts: {
      systemPrompt: '你是一位活动执行专家，擅长制定详细的执行计划和时间表。',
      taskPrompts: {
        timeline: '请生成详细的执行时间线',
        activities: '请规划具体的活动内容',
        resources: '请评估所需资源',
      },
    },
    tools: [
      { id: 'tool-3', name: '时间规划', description: '自动生成时间表', enabled: true },
      { id: 'tool-4', name: '资源评估', description: '评估所需资源', enabled: true },
    ],
    enabled: true,
    publishStatus: 'testing',
    version: 1,
    createdAt: new Date('2026-01-11'),
    updatedAt: new Date('2026-01-11'),
  },
  {
    id: 'agent-3',
    name: '数据分析Agent',
    description: '用于监控阶段，分析数据并提供优化建议',
    phase: 'monitoring',
    model: 'model-3',
    temperature: 0.5,
    maxTokens: 2500,
    prompts: {
      systemPrompt: '你是一位数据分析专家，擅长从运营数据中发现问题和机会。',
      taskPrompts: {
        analyze: '请分析数据指标表现',
        insight: '请提供数据洞察',
        optimize: '请给出优化建议',
      },
    },
    tools: [
      { id: 'tool-5', name: '统计分析', description: '进行统计分析', enabled: true },
      { id: 'tool-6', name: '趋势预测', description: '预测未来趋势', enabled: true },
    ],
    enabled: true,
    publishStatus: 'draft',
    version: 1,
    createdAt: new Date('2026-01-12'),
    updatedAt: new Date('2026-01-18'),
  },
];

// 工作流模板数据
export const mockWorkflowTemplates: WorkflowTemplate[] = [
  {
    id: 'wf-template-1',
    name: '标准运营方案生成流程',
    description: '适用于大多数项目的运营方案生成工作流',
    phase: 'preparation',
    agentConfig: 'agent-1',
    enabled: true,
    isDefault: true,
    usageCount: 45,
    successRate: 92.5,
    steps: [
      {
        id: 'step-t1',
        name: '收集项目信息',
        description: '收集项目基本信息和需求',
        type: 'analysis',
        estimatedDuration: 60,
        requiresHumanInput: true,
        humanInputPrompt: '请确认项目信息是否完整',
      },
      {
        id: 'step-t2',
        name: '检索历史案例',
        description: '从知识库中检索相似的成功案例',
        type: 'analysis',
        estimatedDuration: 90,
        promptTemplate: 'prompt-1',
      },
      {
        id: 'step-t3',
        name: '生成运营策略',
        description: '根据分析结果生成运营策略方案',
        type: 'generation',
        estimatedDuration: 180,
        promptTemplate: 'prompt-1',
      },
      {
        id: 'step-t4',
        name: '方案审核',
        description: '人工审核生成的方案',
        type: 'validation',
        estimatedDuration: 300,
        requiresHumanInput: true,
        humanInputPrompt: '请审核运营方案，确认是否需要调整',
      },
    ],
    createdAt: new Date('2026-01-05'),
    updatedAt: new Date('2026-01-15'),
  },
  {
    id: 'wf-template-2',
    name: '快速执行计划生成流程',
    description: '快速生成执行计划，适合紧急项目',
    phase: 'planning',
    agentConfig: 'agent-2',
    enabled: true,
    isDefault: false,
    usageCount: 28,
    successRate: 87.3,
    steps: [
      {
        id: 'step-t5',
        name: '解析运营方案',
        description: '解析已有的运营方案',
        type: 'analysis',
        estimatedDuration: 45,
      },
      {
        id: 'step-t6',
        name: '生成执行时间表',
        description: '生成详细的执行时间表',
        type: 'generation',
        estimatedDuration: 120,
      },
      {
        id: 'step-t7',
        name: '生成活动提报表',
        description: '生成平台提报所需的表格',
        type: 'generation',
        estimatedDuration: 150,
        promptTemplate: 'prompt-2',
      },
    ],
    createdAt: new Date('2026-01-08'),
    updatedAt: new Date('2026-01-12'),
  },
  {
    id: 'wf-template-3',
    name: '数据分析与优化流程',
    description: '定期分析运营数据并给出优化建议',
    phase: 'monitoring',
    agentConfig: 'agent-3',
    enabled: true,
    isDefault: true,
    usageCount: 67,
    successRate: 94.8,
    steps: [
      {
        id: 'step-t8',
        name: '收集运营数据',
        description: '从平台收集最新的运营数据',
        type: 'analysis',
        estimatedDuration: 30,
      },
      {
        id: 'step-t9',
        name: '数据清洗与处理',
        description: '清洗和处理收集到的数据',
        type: 'analysis',
        estimatedDuration: 60,
      },
      {
        id: 'step-t10',
        name: '生成分析报告',
        description: '生成数据分析报告和洞察',
        type: 'evaluation',
        estimatedDuration: 120,
        promptTemplate: 'prompt-3',
      },
      {
        id: 'step-t11',
        name: '提供优化建议',
        description: '根据分析结果提供优化建议',
        type: 'evaluation',
        estimatedDuration: 90,
      },
      {
        id: 'step-t12',
        name: '发送通知',
        description: '将报告发送给相关人员',
        type: 'notification',
        estimatedDuration: 10,
      },
    ],
    createdAt: new Date('2026-01-06'),
    updatedAt: new Date('2026-01-19'),
  },
];

// 提示词测试结果数据
export const mockTestResults: PromptTestResult[] = [
  {
    id: 'test-1',
    promptId: 'prompt-1',
    input: {
      brand: '某饮料品牌',
      category: '饮料',
      platform: '美团',
      budget: 500000,
      startDate: '2026-01-15',
      endDate: '2026-02-15',
    },
    output: '【运营方案】\n\n一、市场分析\n当前饮料品类在美团平台...',
    model: 'gpt-4-turbo',
    duration: 8.5,
    tokens: {
      input: 156,
      output: 892,
      total: 1048,
    },
    cost: 0.0105,
    success: true,
    timestamp: new Date('2026-01-15T10:30:00'),
  },
  {
    id: 'test-2',
    promptId: 'prompt-2',
    input: {
      activityName: '新春满减',
      activityType: '满减活动',
      startTime: '2026-01-20',
      endTime: '2026-02-15',
      budget: 150000,
    },
    output: '【活动提报表】\n\n活动名称：新春满减...',
    model: 'claude-3-sonnet',
    duration: 6.2,
    tokens: {
      input: 128,
      output: 654,
      total: 782,
    },
    cost: 0.0023,
    success: true,
    timestamp: new Date('2026-01-16T14:20:00'),
  },
];
