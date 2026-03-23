import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, Paperclip, X, FileText, Image as ImageIcon, Brain, ChevronDown, ChevronUp, Presentation, FileSpreadsheet, Download, Eye, Copy, RefreshCw, MoreVertical } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { AgentMessage, IntentType, ParamDefinition, WorkflowTemplate } from '@/types';
import { agentService } from '@/services/agentService';
import { workflowEngine } from '@/services/workflowEngine';
import { fileService } from '@/services/fileService';
import { documentService } from '@/services/documentService';
import InfoCollectionModal from './InfoCollectionModal';
import WorkflowExecutionDisplay from './WorkflowExecutionDisplay';

/** Agent 意图 → 配置映射（模块级常量，避免每次渲染重建） */
const INTENT_AGENT_MAP: Record<IntentType, { id: string; name: string; description: string }> = {
  category_insight: { id: 'agent-0',   name: '品类洞察Agent',     description: '专门用于品类洞察分析的智能体' },
  operation_plan:   { id: 'agent-1',   name: '运营方案生成Agent', description: '专门用于生成运营方案的智能体' },
  merchant_guide:   { id: 'agent-1.5', name: '招商指引Agent',     description: '专门用于招商指引的智能体' },
  budget_split:     { id: 'agent-2',   name: '预算拆分Agent',     description: '专门用于预算拆分的智能体' },
  activity_config:  { id: 'agent-3',   name: '活动配置Agent',     description: '专门用于活动配置的智能体' },
  activity_ops:     { id: 'agent-4',   name: '活动运营Agent',     description: '专门用于活动运营的智能体' },
  rtb_plan:         { id: 'agent-5',   name: 'RTB方案Agent',      description: '专门用于RTB方案的智能体' },
  rtb_config:       { id: 'agent-6',   name: 'RTB配置Agent',      description: '专门用于RTB配置的智能体' },
  rtb_ops:          { id: 'agent-7',   name: 'RTB运营Agent',      description: '专门用于RTB运营的智能体' },
  review_report:    { id: 'agent-8',   name: '复盘报告Agent',     description: '专门用于生成复盘报告的智能体' },
};

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
}

interface Props {
  placeholder?: string;
}

export default function EnhancedAIChatBox({ placeholder = '请输入或"/"选择技能...' }: Props) {
  const {
    currentSession,
    activeIntent,
    pendingAgentIntent,
    setPendingAgentIntent,
    updateSession,
    addDocumentGenerationTask,
  } = useStore();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showInfoCollection, setShowInfoCollection] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<IntentType | null>(null);
  const [openFileMenuId, setOpenFileMenuId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 监听导航栏触发的前置表单
  useEffect(() => {
    if (!pendingAgentIntent) return;
    const agentConfig = INTENT_AGENT_MAP[pendingAgentIntent];
    if (!agentConfig) return;
    setSelectedIntent(pendingAgentIntent);
    setSelectedAgentId(agentConfig.id);
    setShowInfoCollection(true);
    setPendingAgentIntent(null);
  }, [pendingAgentIntent, setPendingAgentIntent]);

  // 初始化模拟完整会话流程
  useEffect(() => {
    if (currentSession && (!currentSession.messages || currentSession.messages.length === 0)) {
      // 检查是否应该显示模拟会话（可以通过环境变量或配置控制）
      const showDemoSession = false; // 当前：交互演示由用户选择 Agent 后触发真实流程
      
      if (showDemoSession) {
        // 模拟完整会话流程
        const demoMessages: AgentMessage[] = [];
        
        // 2. 用户选择能力（模拟用户点击）
        const userSelectMessage: AgentMessage = {
          id: 'user-select-1',
          type: 'user',
          content: '我想生成一个运营方案',
          timestamp: new Date(Date.now() - 240000), // 4分钟前
        };
        demoMessages.push(userSelectMessage);
        
        // 3. Agent推荐
        const agentRecommendMessage: AgentMessage = {
          id: 'agent-recommend-1',
          type: 'agent',
          content: `我理解您想要生成运营方案。

我推荐使用以下Agent来完成这个任务：

🎯 运营方案生成Agent
专门用于生成完整的运营方案，包括活动策略、执行计划、预期效果等`,
          timestamp: new Date(Date.now() - 230000), // 3分50秒前
          metadata: {
            showAgentSelection: true,
            recommendedAgentId: 'agent-1',
            intent: 'operation_plan',
          },
        };
        demoMessages.push(agentRecommendMessage);
        
        // 4. 用户上传文件（模拟不同文件类型）
        const userFileMessage: AgentMessage = {
          id: 'user-file-1',
          type: 'user',
          content: '我上传了一些参考文件',
          timestamp: new Date(Date.now() - 200000), // 3分20秒前
          metadata: {
            attachments: [
              {
                id: 'file-1',
                name: '运营方案参考.pdf',
                type: 'application/pdf',
                size: 2048576, // 2MB
                url: '#',
              },
              {
                id: 'file-2',
                name: '活动数据.xlsx',
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                size: 512000, // 500KB
                url: '#',
              },
              {
                id: 'file-3',
                name: '品牌素材.jpg',
                type: 'image/jpeg',
                size: 1024000, // 1MB
                url: '#',
              },
            ],
          },
        };
        demoMessages.push(userFileMessage);

        // 5. Agent思考过程（模拟）
        const agentThinkingMessage: AgentMessage = {
          id: 'agent-thinking-1',
          type: 'agent',
          content: '我正在分析您上传的文件和需求...',
          timestamp: new Date(Date.now() - 190000), // 3分10秒前
          metadata: {
            showThinking: true,
            thinking: `让我分析一下您的需求：

1. **需求理解**：
   - 项目名称：春节大促活动
   - 品牌：达能
   - 平台：美团
   - 预算：50万元

2. **文件分析**：
   - 已收到运营方案参考文档，包含历史活动策略
   - 已收到活动数据表格，包含历史效果数据
   - 已收到品牌素材图片，可用于活动设计

3. **方案规划**：
   基于历史数据和品牌特点，我将制定一个包含以下要素的运营方案：
   - 活动主题设计
   - 促销策略规划
   - 预算分配方案
   - 执行时间表
   - 预期效果评估

现在开始生成详细方案...`,
          },
        };
        demoMessages.push(agentThinkingMessage);

        // 6. 用户提交表单（模拟表单数据）
        const formData = {
          projectName: '春节大促活动',
          brand: '达能',
          platform: 'meituan',
          budget: 50,
        };
        const formatFormData = (data: Record<string, any>): string => {
          const keyMap: Record<string, string> = {
            projectName: '项目名称',
            brand: '品牌',
            platform: '平台',
            budget: '预算（万元）',
          };
          return Object.entries(data)
            .map(([key, value]) => `${keyMap[key] || key}: ${value}`)
            .join('\n');
        };
        
        const userFormMessage: AgentMessage = {
          id: 'user-form-1',
          type: 'user',
          content: formatFormData(formData),
          timestamp: new Date(Date.now() - 180000), // 3分钟前
          metadata: {
            isFormSubmission: true,
            formData: formData,
            attachments: [
              {
                id: 'file-4',
                name: '历史参考方案.docx',
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                size: 1536000, // 1.5MB
                url: '#',
              },
            ],
          },
        };
        demoMessages.push(userFormMessage);
        
        // 7. Agent确认
        const confirmMessage: AgentMessage = {
          id: 'agent-confirm-1',
          type: 'agent',
          content: '✅ 已收集所有必要信息，开始生成...',
          timestamp: new Date(Date.now() - 170000), // 2分50秒前
        };
        demoMessages.push(confirmMessage);
        
        // 8. 工作流执行消息（模拟）
        const workflowMessage: AgentMessage = {
          id: 'workflow-1',
          type: 'agent',
          content: '🚀 工作流已启动，开始执行...',
          timestamp: new Date(Date.now() - 160000), // 2分40秒前
          metadata: {
            showWorkflow: true,
            workflowId: 'demo-workflow-1',
            isCompleted: true, // 标记为已完成，可折叠
          },
        };
        demoMessages.push(workflowMessage);
        
        // 9. Agent回复（模拟最终结果，包含生成的附件）
        const agentReplyMessage: AgentMessage = {
          id: 'agent-reply-1',
          type: 'agent',
          content: `我已经为您生成了完整的运营方案！

**方案概述**：
- 活动主题：春节团圆，达能相伴
- 活动周期：2024年1月15日 - 2月5日
- 预算分配：线上推广40万，线下活动10万

**核心策略**：
1. 限时秒杀：每日10点、20点开启秒杀活动
2. 满减优惠：满99减20，满199减50
3. 品牌联动：与美团平台联合推广
4. 用户裂变：邀请好友下单可获得优惠券

**预期效果**：
- 预计GMV：500万元
- 预计订单量：5万单
- 预计ROI：1:10

您是否需要我将方案生成为文档？我可以为您生成：
- 📊 PPT演示文稿
- 📈 Excel数据分析报表
- 📄 Word详细方案文档`,
          timestamp: new Date(Date.now() - 10000), // 10秒前
          metadata: {
            showThinking: true,
            thinking: `在生成方案的过程中，我进行了以下思考：

1. **数据分析**：
   - 分析了历史活动数据，发现春节期间的订单量通常比平时增长300%
   - 参考了类似品牌的成功案例，学习其促销策略

2. **策略制定**：
   - 考虑到春节是家庭消费高峰期，设计了家庭装优惠套餐
   - 结合美团平台的流量特点，制定了精准的推广计划

3. **预算优化**：
   - 将70%预算用于线上推广，确保最大曝光
   - 保留30%预算用于线下活动和应急调整

4. **风险控制**：
   - 设置了每日预算上限，避免超支
   - 准备了备选方案，应对突发情况`,
            isCompleted: true, // 标记为已完成，可折叠
            showDocumentGeneration: true, // 显示文档生成选择
            attachments: [
              {
                id: 'agent-attachment-1',
                name: '运营方案图表.png',
                type: 'image/png',
                size: 512000,
                url: '#',
              },
              {
                id: 'agent-attachment-2',
                name: '数据分析结果.pdf',
                type: 'application/pdf',
                size: 1024000,
                url: '#',
              },
            ],
          },
        };
        demoMessages.push(agentReplyMessage);
        
        // 添加所有消息到会话
        updateSession({ messages: demoMessages });
        
        // 添加模拟的生成文件
        const demoGeneratedFiles = [
          {
            id: 'generated-file-1',
            name: '春节大促活动运营方案.pptx',
            type: 'ppt' as const,
            url: '#',
            previewUrl: '#',
            generatedAt: new Date(Date.now() - 5000),
            sourceTaskId: 'demo-task-1',
          },
          {
            id: 'generated-file-2',
            name: '活动数据分析报表.xlsx',
            type: 'excel' as const,
            url: '#',
            previewUrl: '#',
            generatedAt: new Date(Date.now() - 3000),
            sourceTaskId: 'demo-task-1',
          },
          {
            id: 'generated-file-3',
            name: '运营方案详细文档.docx',
            type: 'doc' as const,
            url: '#',
            previewUrl: '#',
            generatedAt: new Date(Date.now() - 1000),
            sourceTaskId: 'demo-task-1',
          },
        ];
        
        updateSession({ 
          messages: demoMessages,
          generatedFiles: demoGeneratedFiles,
          currentTask: {
            id: 'demo-task-1',
            type: 'operation_plan',
            agentId: 'agent-1',
            status: 'running', // 改为running，避免自动归档
            collectedParams: formData,
            createdAt: new Date(Date.now() - 180000),
            updatedAt: new Date(Date.now() - 10000),
          },
          hasActiveTask: true,
        });
      } else {
        const intent = (currentSession.identifiedIntent || activeIntent || 'operation_plan') as IntentType;
        const intentLabelMap: Record<IntentType, string> = {
          category_insight: '品类洞察',
          operation_plan: '运营方案',
          merchant_guide: '招商指引',
          budget_split: '预算拆分',
          activity_config: '活动配置',
          activity_ops: '活动运营',
          rtb_plan: 'RTB方案',
          rtb_config: 'RTB配置',
          rtb_ops: 'RTB运营',
          review_report: '复盘报告',
        };

        const promptMessage: AgentMessage = {
          id: 'agent-prompt-1',
          type: 'agent',
          content: `已选择「${intentLabelMap[intent]}」Agent。请输入你的需求（或上传文件），我会按该方向生成对应的运营结果。`,
          timestamp: new Date(),
        };

        updateSession({ messages: [promptMessage] });
      }
    }
  }, [currentSession?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  // 意图识别（使用真实API）
  const recognizeIntent = async (userInput: string): Promise<{
    intent: IntentType | null;
    confidence: number;
    summary: string;
  }> => {
    try {
      const result = await agentService.recognizeIntent(userInput, {
        history: currentSession?.messages,
      });
      return {
        intent: result.intent,
        confidence: result.confidence,
        summary: result.summary,
      };
    } catch (error) {
      console.error('Intent recognition failed:', error);
      // 降级到简单匹配
      return {
        intent: null,
        confidence: 0.3,
        summary: userInput.length > 50 ? userInput.substring(0, 50) + '...' : userInput,
      };
    }
  };

  // intentToAgentConfigMap 已提取到模块顶层（INTENT_AGENT_MAP）

  const handleSend = async (message: string = input) => {
    if ((!message.trim() && attachments.length === 0) || !currentSession) return;

    // 保存附件信息到消息metadata
    const messageAttachments = attachments.map(att => ({
      id: att.id,
      name: att.name,
      type: att.type,
      size: att.size,
      url: att.url,
    }));

    // 添加用户消息
    const userMessage: AgentMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: message || (attachments.length > 0 ? `已上传 ${attachments.length} 个文件` : ''),
      timestamp: new Date(),
      metadata: {
        attachments: messageAttachments,
      },
    };

    updateSession({
      messages: [...(currentSession.messages || []), userMessage],
    });

    setInput('');
    setAttachments([]); // 清空附件
    setIsTyping(true);
    updateSession({ intentStatus: 'recognizing' });

    const forcedIntent = (useStore.getState().currentSession?.identifiedIntent || activeIntent) as IntentType | null;

    setTimeout(async () => {
      setIsTyping(false);

      // 导航栏已选择 Agent：跳过意图识别，直接按选定方向收集输入并执行工作流
      if (forcedIntent) {
        setSelectedIntent(forcedIntent);
        const agentConfig = INTENT_AGENT_MAP[forcedIntent];
        setSelectedAgentId(agentConfig.id);
        setShowInfoCollection(true);

        const latestSession = useStore.getState().currentSession;
        const agentPrompt: AgentMessage = {
          id: `agent-intent-known-${Date.now()}`,
          type: 'agent',
          content: `已切换到「${agentConfig.name}」，接下来请在弹窗中填写所需信息。`,
          timestamp: new Date(),
        };

        useStore.getState().updateSession({
          messages: [...(latestSession?.messages || []), agentPrompt],
          intentStatus: 'identified',
          identifiedIntent: forcedIntent,
        });
        return;
      }

      // 未选择 Agent：走意图识别逻辑
      const intentResult = await recognizeIntent(message);
      if (intentResult.confidence < 0.7 || !intentResult.intent) {
        handleUnclearIntent();
      } else {
        handleClearIntent(intentResult.intent, intentResult.summary);
      }
    }, 1500);
  };

  const handleUnclearIntent = () => {
    const response: AgentMessage = {
      id: `agent-${Date.now()}`,
      type: 'agent',
      content: '我理解您想要完成运营相关工作，但需要更多信息来确定具体任务。\n\n请从以下能力中选择您想要执行的任务：',
      timestamp: new Date(),
      metadata: { showCapabilities: true },
    };

    updateSession({
      messages: [...(currentSession?.messages || []), response],
      intentStatus: 'unclear',
    });
  };

  const handleClearIntent = (intent: IntentType, summary: string) => {
    setSelectedIntent(intent);
    const agentConfig = INTENT_AGENT_MAP[intent];

    const response: AgentMessage = {
      id: `agent-${Date.now()}`,
      type: 'agent',
      content: `我理解您想要${summary}。

我推荐使用以下Agent来完成这个任务：

🎯 ${agentConfig.name}
${agentConfig.description}`,
      timestamp: new Date(),
      metadata: {
        showAgentSelection: true,
        recommendedAgentId: agentConfig.id,
        intent,
      },
    };

    updateSession({
      messages: [...(currentSession?.messages || []), response],
      intentStatus: 'identified',
      identifiedIntent: intent,
      recommendedAgents: [agentConfig.id],
    });
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgentId(agentId);
    setShowInfoCollection(true);
  };

  const handleInfoCollectionConfirm = async (params: Record<string, any>) => {
    setShowInfoCollection(false);

    if (!selectedAgentId || !selectedIntent) return;

    // 从参数中提取文件信息
    const fileAttachments: Attachment[] = [];
    const fileKeys = ['referenceFiles', 'materialFiles', 'dataFiles'];
    
    for (const key of fileKeys) {
      if (params[key] && Array.isArray(params[key]) && params[key].length > 0) {
        // 如果是文件ID数组，从fileService获取文件信息
        if (typeof params[key][0] === 'string') {
          try {
            for (const fileId of params[key]) {
              const file = await fileService.getFile(fileId);
              if (file) {
                const url = file.previewUrl || URL.createObjectURL(file.data);
                fileAttachments.push({
                  id: file.id,
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  url: url,
                });
              }
            }
          } catch (error) {
            console.error('Failed to load files:', error);
          }
        }
      }
    }

    // 格式化表单数据用于显示
    const formatFormDataForDisplay = (data: Record<string, any>): string => {
      const lines: string[] = [];
      Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') return;
        
        // 跳过文件ID数组（这些会在文件列表中显示）
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
          // 可能是文件ID，跳过
          return;
        }
        
        // 格式化键名（将驼峰转换为中文）
        const keyMap: Record<string, string> = {
          projectName: '项目名称',
          brand: '品牌',
          platform: '平台',
          budget: '预算（万元）',
          startDate: '开始日期',
          endDate: '结束日期',
          objectives: '运营目标',
          category: '品类',
          targetAudience: '目标受众',
          referenceFiles: '历史参考方案',
          materialFiles: '方案素材',
          dataFiles: '数据来源',
        };
        
        const displayKey = keyMap[key] || key;
        
        if (Array.isArray(value)) {
          lines.push(`${displayKey}: ${value.join(', ')}`);
        } else if (typeof value === 'object') {
          lines.push(`${displayKey}: ${JSON.stringify(value, null, 2)}`);
        } else {
          lines.push(`${displayKey}: ${value}`);
        }
      });
      return lines.join('\n');
    };

    // 添加用户提交的表单消息
    const formDataDisplay = formatFormDataForDisplay(params);
    const userFormMessage: AgentMessage = {
      id: `user-form-${Date.now()}`,
      type: 'user',
      content: formDataDisplay || '已提交表单信息',
      timestamp: new Date(),
      metadata: {
        isFormSubmission: true,
        formData: params,
        attachments: fileAttachments.map(att => ({
          id: att.id,
          name: att.name,
          type: att.type,
          size: att.size,
          url: att.url,
        })),
      },
    };

    updateSession({
      messages: [...(currentSession?.messages || []), userFormMessage],
    });

    // 创建任务
    const task = {
      id: `task-${Date.now()}`,
      type: selectedIntent,
      agentId: selectedAgentId,
      status: 'running' as const,
      collectedParams: params,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 模拟工作流模板（直接启动工作流）
    if (selectedAgentId) {
      // 创建工作流并开始执行（使用模拟模板ID）
      startWorkflow(`template-${selectedAgentId}`, task.id, params);
    }

    updateSession({
      currentTask: task,
      hasActiveTask: true,
      infoCollection: undefined,
    });

    // 添加确认消息
    const confirmMessage: AgentMessage = {
      id: `agent-${Date.now()}`,
      type: 'agent',
      content: '✅ 已收集所有必要信息，开始生成...',
      timestamp: new Date(),
    };

    updateSession({
      messages: [...(currentSession?.messages || []), confirmMessage],
    });
  };

  const startWorkflow = async (templateId: string, taskId: string, params: Record<string, any>) => {
    try {
      // 模拟工作流模板（简化实现）
      const template: WorkflowTemplate = {
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

      // 启动工作流
      const workflowId = await workflowEngine.startWorkflow(template, taskId, params);

      // 先添加一个工作流执行消息
      const workflowMessageId = `workflow-${workflowId}`;
      const initialWorkflowMessage: AgentMessage = {
        id: workflowMessageId,
        type: 'agent',
        content: '🚀 工作流已启动，开始执行...',
        timestamp: new Date(),
        metadata: {
          showWorkflow: true,
          workflowId: workflowId,
        },
      };

      updateSession({
        messages: [...(currentSession?.messages || []), initialWorkflowMessage],
      });

      // 订阅工作流更新
      const unsubscribe = workflowEngine.onExecutionUpdate(workflowId, (execution) => {
        // 更新任务状态和输出数据
        if (currentSession?.currentTask) {
          // 收集工作流输出数据
          const workflowOutput = execution.steps
            .filter(s => s.status === 'success' && s.output)
            .reduce((acc, step) => {
              if (step.output) {
                acc[step.id] = step.output;
              }
              return acc;
            }, {} as Record<string, any>);

          // 合并工作流输出到任务参数中
          const updatedParams = {
            ...currentSession.currentTask.collectedParams,
            workflowOutput,
            workflowContext: execution.context,
          };

          updateSession({
            currentTask: {
              ...currentSession.currentTask,
              workflowId: execution.id,
              status: execution.status === 'completed' ? 'completed' : 
                      execution.status === 'failed' ? 'archived' : 'running',
              collectedParams: updatedParams,
            },
          });
        }

        // 更新工作流消息（而不是添加新消息）
        const messages = currentSession?.messages || [];
        const workflowMessageIndex = messages.findIndex(m => m.id === workflowMessageId);
        
        if (workflowMessageIndex >= 0) {
          // 更新现有消息
          const updatedMessages = [...messages];
          const currentStep = execution.steps.find(s => s.status === 'running');
          const completedSteps = execution.steps.filter(s => s.status === 'success').length;
          const totalSteps = execution.steps.length;

          updatedMessages[workflowMessageIndex] = {
            ...updatedMessages[workflowMessageIndex],
            content: execution.status === 'completed' 
              ? `✅ 工作流执行完成！已完成 ${totalSteps} 个步骤。`
              : execution.status === 'failed'
              ? `❌ 工作流执行失败`
              : `🔄 工作流执行中... (${completedSteps}/${totalSteps}) ${currentStep ? `当前步骤: ${currentStep.name}` : ''}`,
            metadata: {
              showWorkflow: true,
              workflowId: execution.id,
            },
          };

          updateSession({
            messages: updatedMessages,
          });
        }

        // 如果完成，添加完成消息并保存工作流输出
        if (execution.status === 'completed') {
          // 收集最终输出
          const finalOutput = execution.steps
            .filter(s => s.status === 'success' && s.output)
            .map(s => s.output)
            .pop(); // 获取最后一个步骤的输出

          const completedMessage: AgentMessage = {
            id: `workflow-completed-${execution.id}`,
            type: 'agent',
            content: finalOutput?.content 
              ? `✅ 工作流执行完成！\n\n${finalOutput.content}`
              : '✅ 工作流执行完成！您现在可以生成对应文档。',
            timestamp: new Date(),
            metadata: {
              showDocumentGeneration: true,
            },
          };

          // 更新任务，保存工作流输出
          if (currentSession?.currentTask) {
            const workflowOutput = execution.steps
              .filter(s => s.status === 'success' && s.output)
              .reduce((acc, step) => {
                if (step.output) {
                  acc[step.id] = step.output;
                }
                return acc;
              }, {} as Record<string, any>);

            updateSession({
              messages: [...(currentSession?.messages || []), completedMessage],
              currentTask: {
                ...currentSession.currentTask,
                status: 'completed',
                collectedParams: {
                  ...currentSession.currentTask.collectedParams,
                  workflowOutput,
                  workflowContext: execution.context,
                  finalOutput: finalOutput,
                },
              },
            });
          }
        }
      });

      // 返回取消订阅函数（如果需要）
      return { workflowId, unsubscribe };
    } catch (error: any) {
      console.error('Failed to start workflow:', error);
      const errorMessage: AgentMessage = {
        id: `error-${Date.now()}`,
        type: 'error',
        content: `工作流启动失败: ${error.message}`,
        timestamp: new Date(),
      };
      updateSession({
        messages: [...(currentSession?.messages || []), errorMessage],
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 处理文档生成
  const handleGenerateDocument = async (type: 'ppt' | 'excel' | 'doc') => {
    if (!currentSession || !currentSession.currentTask) return;

    const taskId = currentSession.currentTask.id;
    
    // 创建文档生成任务
    const generationTask = {
      id: `doc-gen-${Date.now()}-${type}`,
      type: type,
      sourceTaskId: taskId,
      status: 'generating' as const,
      progress: 0,
      createdAt: new Date(),
    };

    addDocumentGenerationTask(generationTask);

    // 添加用户确认消息
    const userConfirmMessage: AgentMessage = {
      id: `user-confirm-${Date.now()}`,
      type: 'user',
      content: `请生成${type === 'ppt' ? 'PPT' : type === 'excel' ? 'Excel' : 'Word'}文档`,
      timestamp: new Date(),
    };

    updateSession({
      messages: [...(currentSession.messages || []), userConfirmMessage],
    });

    // 模拟文档生成过程
    const progressInterval = setInterval(() => {
      const currentTask = useStore.getState().documentGenerationTasks.find(t => t.id === generationTask.id);
      if (currentTask && currentTask.progress < 100) {
        const newProgress = Math.min(currentTask.progress + 10, 100);
        useStore.getState().updateDocumentGenerationTask(generationTask.id, { progress: newProgress });
      }
    }, 300);

    // 模拟生成完成
    setTimeout(async () => {
      clearInterval(progressInterval);
      
      try {
        // 使用documentService生成文档
        const taskData = currentSession.currentTask?.collectedParams || {};
        const documentData = documentService.formatTaskOutputToDocumentData(taskData, type);
        
        let result: { url: string; previewUrl?: string } | undefined;
        const filename = type === 'ppt' 
          ? `运营方案_${Date.now()}.pptx`
          : type === 'excel'
          ? `数据分析_${Date.now()}.xlsx`
          : `运营方案_${Date.now()}.docx`;
        
        if (type === 'ppt') {
          const docResult = await documentService.generatePPT(documentData, { filename });
          result = { url: docResult.url, previewUrl: docResult.url };
        } else if (type === 'excel') {
          const docResult = await documentService.generateExcel(documentData, { filename });
          result = { url: docResult.url, previewUrl: docResult.url };
        } else if (type === 'doc') {
          const docResult = await documentService.generateDoc(documentData, { filename });
          result = { url: docResult.url, previewUrl: docResult.url };
        }

        // 更新任务状态
        useStore.getState().updateDocumentGenerationTask(generationTask.id, {
          status: 'completed',
          progress: 100,
          result: result,
          completedAt: new Date(),
        });

        // 添加Agent确认消息，带生成的文件信息
        const agentConfirmMessage: AgentMessage = {
          id: `agent-confirm-doc-${Date.now()}`,
          type: 'agent',
          content: `文档已生成完成！`,
          timestamp: new Date(),
          metadata: {
            generatedFile: {
              id: generationTask.id,
              name: filename,
              type: type,
              url: result?.url,
              previewUrl: result?.previewUrl,
            },
          },
        };

        const updatedSession = useStore.getState().currentSession;
        if (updatedSession) {
          useStore.getState().updateSession({
            messages: [...(updatedSession.messages || []), agentConfirmMessage],
          });
        }
      } catch (error: any) {
        console.error('Document generation failed:', error);
        useStore.getState().updateDocumentGenerationTask(generationTask.id, {
          status: 'failed',
          error: error.message || '生成失败',
        });
      }
    }, 2000);
  };

  // 思考过程显示组件
  const ThinkingDisplay = ({ thinking, isCompleted }: { thinking: string; isCompleted?: boolean }) => {
    const [isExpanded, setIsExpanded] = useState(!isCompleted);

    if (!isCompleted) {
      return (
        <div className="mt-2 bg-gray-50 border border-gray-100 rounded-lg p-2.5">
          <div className="flex items-center space-x-2 mb-1.5">
            <Brain className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[11px] font-medium text-gray-600">正在思考...</span>
          </div>
          <div className="text-[11px] text-gray-500 whitespace-pre-wrap leading-relaxed">
            {thinking}
          </div>
        </div>
      );
    }

    return (
      <div className="mt-2 border border-gray-100 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-1.5">
            <Brain className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] font-medium text-gray-500">思考过程</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          )}
        </button>
        {isExpanded && (
          <div className="p-2.5 bg-gray-50/50 border-t border-gray-100">
            <div className="text-[11px] text-gray-500 whitespace-pre-wrap leading-relaxed">
              {thinking}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 可折叠的工作流显示组件
  const CollapsibleWorkflowDisplay = ({ workflowId, isCompleted }: { workflowId: string; isCompleted?: boolean }) => {
    const [isExpanded, setIsExpanded] = useState(!isCompleted);
    const execution = workflowEngine.getExecution(workflowId);

    if (!execution) {
      return (
        <div className="text-[11px] text-gray-400 p-2 bg-gray-50 rounded">
          工作流执行信息未找到
        </div>
      );
    }

    const allCompleted = execution.steps.every(s => s.status === 'success' || s.status === 'failed');

    return (
      <div className="border border-gray-100 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-medium text-gray-500">
              工作流 {allCompleted && `(${execution.steps.length}步)`}
            </span>
            {!allCompleted && (
              <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          )}
        </button>
        {isExpanded && (
          <div className="p-2.5 bg-white border-t border-gray-100">
            <WorkflowExecutionDisplay
              workflowId={workflowId}
              steps={execution.steps}
            />
          </div>
        )}
      </div>
    );
  };

  // 获取工作流模板的参数定义（模拟）
  const getRequiredParams = (_agentId: string): ParamDefinition[] => {
    // TODO: 从工作流模板中获取实际参数定义
    return [
      {
        key: 'projectName',
        label: '项目名称',
        type: 'text',
        required: true,
        placeholder: '请输入项目名称',
      },
      {
        key: 'brand',
        label: '品牌',
        type: 'select',
        required: true,
        options: [
          { label: '达能', value: '达能' },
          { label: '嘉士伯', value: '嘉士伯' },
          { label: '康师傅', value: '康师傅' },
        ],
      },
      {
        key: 'platform',
        label: '平台',
        type: 'select',
        required: true,
        options: [
          { label: '美团', value: 'meituan' },
          { label: '饿了么', value: 'eleme' },
          { label: '京东', value: 'jd' },
        ],
      },
      {
        key: 'budget',
        label: '预算范围（万元）',
        type: 'number',
        required: false,
        placeholder: '请输入预算范围',
      },
      {
        key: 'referenceFiles',
        label: '历史参考方案',
        type: 'file',
        required: false,
        description: '上传历史参考方案文件',
      },
    ];
  };

  // 模拟Agent配置
  const agentConfigMap: Record<string, { id: string; name: string; description: string }> = {
    'agent-0': { id: 'agent-0', name: '品类洞察Agent', description: '专门用于品类洞察分析的智能体' },
    'agent-1': { id: 'agent-1', name: '运营方案生成Agent', description: '专门用于生成运营方案的智能体' },
    'agent-1.5': { id: 'agent-1.5', name: '招商指引Agent', description: '专门用于招商指引的智能体' },
    'agent-2': { id: 'agent-2', name: '预算拆分Agent', description: '专门用于预算拆分的智能体' },
    'agent-3': { id: 'agent-3', name: '活动配置Agent', description: '专门用于活动配置的智能体' },
    'agent-4': { id: 'agent-4', name: '活动运营Agent', description: '专门用于活动运营的智能体' },
    'agent-5': { id: 'agent-5', name: 'RTB方案Agent', description: '专门用于RTB方案的智能体' },
    'agent-6': { id: 'agent-6', name: 'RTB配置Agent', description: '专门用于RTB配置的智能体' },
    'agent-7': { id: 'agent-7', name: 'RTB运营Agent', description: '专门用于RTB运营的智能体' },
    'agent-8': { id: 'agent-8', name: '复盘报告Agent', description: '专门用于生成复盘报告的智能体' },
  };

  const agentConfig = selectedAgentId ? agentConfigMap[selectedAgentId] : null;

  const messages = currentSession?.messages || [];

  return (
    <>
      <div className="flex flex-col h-full bg-white">
        {/* 消息列表 - 可滚动 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((message) => (
            <div key={message.id} id={`message-${message.id}`} className="transition-colors duration-500">
              <div
                className={`flex items-start space-x-3 ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* 头像 */}
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                    message.type === 'user'
                      ? 'bg-emerald-600'
                      : message.type === 'system'
                      ? 'bg-gray-800'
                      : 'bg-gray-800'
                  }`}
                >
                  {message.type === 'user' ? (
                    <span className="text-white text-xs font-medium">宇</span>
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* 消息内容 */}
                <div
                  className={`flex-1 group ${
                    message.type === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'
                  }`}
                >
                  <div
                    className={`relative inline-block max-w-[85%] rounded-lg px-3 py-2 ${
                      message.type === 'user'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    {message.metadata?.isFormSubmission ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs opacity-80">📋 已提交表单信息</span>
                        </div>
                        <div className="bg-white/10 rounded p-2 space-y-1">
                          <p className="text-sm whitespace-pre-wrap font-mono">{message.content}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                    
                    {/* 显示附件 */}
                    {message.metadata?.attachments && message.metadata.attachments.length > 0 && (
                      <div className={`mt-2 space-y-1.5 ${message.type === 'user' ? '' : 'pt-2 border-t border-gray-100'}`}>
                        {message.metadata.attachments.map((att: Attachment) => (
                          <div
                            key={att.id}
                            className="flex items-center space-x-2 p-1.5 rounded bg-white border border-gray-100"
                          >
                            {att.type.startsWith('image/') ? (
                              <ImageIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-700 truncate">{att.name}</p>
                              <p className="text-[10px] text-gray-400">{formatFileSize(att.size)}</p>
                            </div>
                            {att.url && (
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-gray-500 hover:text-gray-700"
                              >
                                查看
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>


                  {/* Agent选择 */}
                  {message.metadata?.showAgentSelection && message.metadata?.recommendedAgentId && (
                    <div className="mt-3">
                      <button
                        onClick={() => handleAgentSelect(message.metadata.recommendedAgentId as string)}
                        className="px-3 py-1.5 bg-gray-900 text-white rounded text-xs font-medium hover:bg-gray-800 transition-colors"
                      >
                        使用此Agent
                      </button>
                    </div>
                  )}

                  {/* Agent思考过程（可折叠） */}
                  {message.metadata?.showThinking && message.metadata?.thinking && (
                    <div className="mt-3">
                      <ThinkingDisplay
                        thinking={message.metadata.thinking}
                        isCompleted={message.metadata.isCompleted}
                      />
                    </div>
                  )}

                  {/* 文档生成选择 */}
                  {message.metadata?.showDocumentGeneration && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-600 mb-2">请选择要生成的文档类型：</div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleGenerateDocument('ppt')}
                          className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors text-sm"
                        >
                          <Presentation className="w-4 h-4 text-orange-500" />
                          <span>生成PPT</span>
                        </button>
                        <button
                          onClick={() => handleGenerateDocument('excel')}
                          className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors text-sm"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                          <span>生成Excel</span>
                        </button>
                        <button
                          onClick={() => handleGenerateDocument('doc')}
                          className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors text-sm"
                        >
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span>生成Word</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 生成的文件展示 - 与文件预览样式一致，限制宽度 */}
                  {message.metadata?.generatedFile && (
                    <div className="mt-3 max-w-[240px]">
                      <div className="p-3 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-8 h-8 bg-emerald-50 rounded flex items-center justify-center">
                              {message.metadata.generatedFile.type === 'ppt' && <Presentation className="w-4 h-4 text-emerald-500" />}
                              {message.metadata.generatedFile.type === 'excel' && <FileSpreadsheet className="w-4 h-4 text-emerald-500" />}
                              {message.metadata.generatedFile.type === 'doc' && <FileText className="w-4 h-4 text-emerald-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{message.metadata.generatedFile.name}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {message.metadata.generatedFile.type === 'ppt' ? 'PPT' : 
                                 message.metadata.generatedFile.type === 'excel' ? 'Excel' : 'Word'}
                              </p>
                            </div>
                          </div>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenFileMenuId(openFileMenuId === message.metadata.generatedFile.id ? null : message.metadata.generatedFile.id);
                              }}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                            {openFileMenuId === message.metadata.generatedFile.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenFileMenuId(null)}
                                />
                                <div className="absolute right-0 top-8 z-20 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                                  <button
                                    onClick={() => {
                                      setOpenFileMenuId(null);
                                      window.open(message.metadata.generatedFile.previewUrl, '_blank');
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>预览</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setOpenFileMenuId(null);
                                      const link = document.createElement('a');
                                      link.href = message.metadata.generatedFile.url || '';
                                      link.download = message.metadata.generatedFile.name;
                                      link.click();
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>下载</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 工作流执行展示（可折叠） */}
                  {message.metadata?.showWorkflow && message.metadata?.workflowId && (
                    <div className="mt-3">
                      <CollapsibleWorkflowDisplay
                        workflowId={message.metadata.workflowId}
                        isCompleted={message.metadata.isCompleted}
                      />
                    </div>
                  )}
                </div>

                  {/* 快捷操作按钮 - 气泡下方 */}
                  <div className={`flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(message.content);
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="复制"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    {message.type === 'agent' && (
                      <button
                        onClick={async () => {
                          const messageIndex = messages.findIndex(m => m.id === message.id);
                          const previousMessages = messages.slice(0, messageIndex);
                          const lastUserMessage = [...previousMessages].reverse().find(m => m.type === 'user');
                          
                          if (lastUserMessage) {
                            const updatedMessages = messages.slice(0, messageIndex);
                            updateSession({ messages: updatedMessages });
                            await handleSend(lastUserMessage.content);
                          }
                        }}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="重新生成"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    )}
                  </div>
              </div>
            </div>
          ))}

          {/* 输入中提示 */}
          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-primary-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                  <span className="text-sm text-gray-600">正在分析您的需求...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入框 - 固定 */}
        <div className="flex-shrink-0 px-4 pb-4 pt-3 border-t border-gray-100 bg-white">
          {/* 附件预览 */}
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg group"
                >
                  {att.type.startsWith('image/') ? (
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                  ) : (
                    <FileText className="w-4 h-4 text-gray-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 truncate max-w-[120px]">{att.name}</p>
                    <p className="text-[10px] text-gray-400">{formatFileSize(att.size)}</p>
                  </div>
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 输入框主体 */}
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 focus-within:border-gray-400 focus-within:bg-white transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={placeholder}
                rows={3}
                className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm resize-none"
              />
              
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="上传附件"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && attachments.length === 0) || isTyping}
                  className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="发送"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 信息收集模态框 */}
      {showInfoCollection && agentConfig && (
        <InfoCollectionModal
          isOpen={showInfoCollection}
          onClose={() => setShowInfoCollection(false)}
          onConfirm={handleInfoCollectionConfirm}
          agentName={agentConfig.name}
          requiredParams={getRequiredParams(agentConfig.id)}
        />
      )}
    </>
  );
}
