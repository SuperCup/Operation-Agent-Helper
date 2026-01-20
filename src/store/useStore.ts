import { create } from 'zustand';
import { Project, Workflow, Document, KnowledgeItem, AgentMessage } from '@/types';
import { mockProjects, mockWorkflows, mockDocuments, mockKnowledge } from '@/data/mockData';

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
  
  // UI状态
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
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
  sidebarOpen: true,
  
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
}));
