import { create } from 'zustand';
import { 
  Project, 
  Workflow, 
  Document, 
  KnowledgeItem, 
  AgentMessage,
  AIModel,
  AgentConfig,
  PromptTemplate,
  WorkflowTemplate,
  PromptTestResult,
  BackgroundTask,
  AgentDebugRun,
  Customer
} from '@/types';
import { mockProjects, mockWorkflows, mockDocuments, mockKnowledge } from '@/data/mockData';
import { 
  mockModels, 
  mockAgentConfigs, 
  mockPromptTemplates, 
  mockWorkflowTemplates,
  mockTestResults
} from '@/data/agentData';

interface AppState {
  // 项目管理
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  
  // 工作流管理
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  updateWorkflowStep: (workflowId: string, stepId: string, updates: any) => void;
  
  // 文档管理
  documents: Document[];
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  
  // 知识库
  knowledgeBase: KnowledgeItem[];
  
  // Agent消息
  agentMessages: AgentMessage[];
  addAgentMessage: (message: AgentMessage) => void;
  clearAgentMessages: () => void;
  
  // 后台任务
  backgroundTasks: BackgroundTask[];
  addTask: (task: BackgroundTask) => void;
  updateTask: (id: string, updates: Partial<BackgroundTask>) => void;
  removeTask: (id: string) => void;
  
  // UI状态
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // 客户切换
  customers: Customer[];
  currentCustomer: Customer;
  setCurrentCustomer: (customerId: string) => void;
  
  // AI配置中心（智能体/模型/提示词/工作流）
  models: AIModel[];
  agentConfigs: AgentConfig[];
  promptTemplates: PromptTemplate[];
  workflowTemplates: WorkflowTemplate[];
  testResults: PromptTestResult[];
  agentDebugRuns: AgentDebugRun[];
  
  updateModel: (id: string, updates: Partial<AIModel>) => void;
  addAgentConfig: (config: AgentConfig) => void;
  updateAgentConfig: (id: string, updates: Partial<AgentConfig>) => void;
  deleteAgentConfig: (id: string) => void;
  
  addPromptTemplate: (template: PromptTemplate) => void;
  updatePromptTemplate: (id: string, updates: Partial<PromptTemplate>) => void;
  deletePromptTemplate: (id: string) => void;
  
  addWorkflowTemplate: (template: WorkflowTemplate) => void;
  updateWorkflowTemplate: (id: string, updates: Partial<WorkflowTemplate>) => void;
  deleteWorkflowTemplate: (id: string) => void;
  
  addTestResult: (result: PromptTestResult) => void;

  // Agent调试记录
  addAgentDebugRun: (run: AgentDebugRun) => void;
  clearAgentDebugRuns: () => void;
}

export const useStore = create<AppState>((set) => ({
  // 初始数据
  projects: mockProjects,
  currentProject: null,
  workflows: mockWorkflows,
  currentWorkflow: null,
  documents: mockDocuments,
  knowledgeBase: mockKnowledge,
  agentMessages: [],
  backgroundTasks: [],
  sidebarOpen: true,

  // 客户
  customers: [
    { id: 'customer-1', name: '达能' },
    { id: 'customer-2', name: '嘉士伯' },
    { id: 'customer-3', name: '康师傅' },
    { id: 'customer-4', name: '汉高' },
    { id: 'customer-5', name: '海天' },
    { id: 'customer-6', name: '百威' },
  ],
  currentCustomer: { id: 'customer-1', name: '达能' },
  
  // Agent数据
  models: mockModels,
  agentConfigs: mockAgentConfigs,
  promptTemplates: mockPromptTemplates,
  workflowTemplates: mockWorkflowTemplates,
  testResults: mockTestResults,
  agentDebugRuns: [],
  
  // 项目方法
  setCurrentProject: (project) => set({ currentProject: project }),
  
  addProject: (project) => 
    set((state) => ({ projects: [...state.projects, project] })),
  
  updateProject: (id, updates) => 
    set((state) => ({
      projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p),
      currentProject: state.currentProject?.id === id 
        ? { ...state.currentProject, ...updates } 
        : state.currentProject,
    })),
  
  // 工作流方法
  setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),
  
  updateWorkflow: (id, updates) => 
    set((state) => ({
      workflows: state.workflows.map(w => w.id === id ? { ...w, ...updates } : w),
      currentWorkflow: state.currentWorkflow?.id === id 
        ? { ...state.currentWorkflow, ...updates } 
        : state.currentWorkflow,
    })),
  
  updateWorkflowStep: (workflowId, stepId, updates) =>
    set((state) => ({
      workflows: state.workflows.map(w => {
        if (w.id === workflowId) {
          return {
            ...w,
            steps: w.steps.map(s => s.id === stepId ? { ...s, ...updates } : s),
          };
        }
        return w;
      }),
      currentWorkflow: state.currentWorkflow?.id === workflowId
        ? {
            ...state.currentWorkflow,
            steps: state.currentWorkflow.steps.map(s => 
              s.id === stepId ? { ...s, ...updates } : s
            ),
          }
        : state.currentWorkflow,
    })),
  
  // 文档方法
  addDocument: (document) => 
    set((state) => ({ documents: [...state.documents, document] })),
  
  updateDocument: (id, updates) => 
    set((state) => ({
      documents: state.documents.map(d => d.id === id ? { ...d, ...updates } : d),
    })),
  
  // Agent消息方法
  addAgentMessage: (message) => 
    set((state) => ({ agentMessages: [...state.agentMessages, message] })),
  
  clearAgentMessages: () => set({ agentMessages: [] }),
  
  // UI方法
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // 客户方法
  setCurrentCustomer: (customerId) =>
    set((state) => {
      const found = state.customers.find((c) => c.id === customerId);
      return found ? { currentCustomer: found } : {};
    }),
  
  // Agent方法
  updateModel: (id, updates) =>
    set((state) => ({
      models: state.models.map(m => m.id === id ? { ...m, ...updates } : m),
    })),
  
  addAgentConfig: (config) =>
    set((state) => ({ agentConfigs: [...state.agentConfigs, config] })),
  
  updateAgentConfig: (id, updates) =>
    set((state) => ({
      agentConfigs: state.agentConfigs.map(a => a.id === id ? { ...a, ...updates } : a),
    })),
  
  deleteAgentConfig: (id) =>
    set((state) => ({
      agentConfigs: state.agentConfigs.filter(a => a.id !== id),
    })),
  
  addPromptTemplate: (template) =>
    set((state) => ({ promptTemplates: [...state.promptTemplates, template] })),
  
  updatePromptTemplate: (id, updates) =>
    set((state) => ({
      promptTemplates: state.promptTemplates.map(p => p.id === id ? { ...p, ...updates } : p),
    })),
  
  deletePromptTemplate: (id) =>
    set((state) => ({
      promptTemplates: state.promptTemplates.filter(p => p.id !== id),
    })),
  
  addWorkflowTemplate: (template) =>
    set((state) => ({ workflowTemplates: [...state.workflowTemplates, template] })),
  
  updateWorkflowTemplate: (id, updates) =>
    set((state) => ({
      workflowTemplates: state.workflowTemplates.map(w => w.id === id ? { ...w, ...updates } : w),
    })),
  
  deleteWorkflowTemplate: (id) =>
    set((state) => ({
      workflowTemplates: state.workflowTemplates.filter(w => w.id !== id),
    })),
  
  addTestResult: (result) =>
    set((state) => ({ testResults: [result, ...state.testResults] })),

  // Agent调试记录
  addAgentDebugRun: (run) =>
    set((state) => ({ agentDebugRuns: [run, ...state.agentDebugRuns] })),

  clearAgentDebugRuns: () => set({ agentDebugRuns: [] }),
  
  // 后台任务方法
  addTask: (task) =>
    set((state) => ({ backgroundTasks: [task, ...state.backgroundTasks] })),
  
  updateTask: (id, updates) =>
    set((state) => ({
      backgroundTasks: state.backgroundTasks.map(t => t.id === id ? { ...t, ...updates } : t),
    })),
  
  removeTask: (id) =>
    set((state) => ({
      backgroundTasks: state.backgroundTasks.filter(t => t.id !== id),
    })),
}));
