import { create } from 'zustand';
import { 
  ConversationSession,
  DocumentGenerationTask
} from '@/types';

interface AppState {
  // 会话管理
  currentSession: ConversationSession | null;
  archivedSessions: ConversationSession[];
  documentGenerationTasks: DocumentGenerationTask[];
  createNewSession: () => ConversationSession;
  updateSession: (updates: Partial<ConversationSession>) => void;
  archiveSession: (title?: string) => void;
  restoreSession: (sessionId: string) => void;
  addDocumentGenerationTask: (task: DocumentGenerationTask) => void;
  updateDocumentGenerationTask: (id: string, updates: Partial<DocumentGenerationTask>) => void;
}

export const useStore = create<AppState>((set) => ({
  // 会话管理
  currentSession: null,
  archivedSessions: [],
  documentGenerationTasks: [],
  
  createNewSession: () => {
    const newSession: ConversationSession = {
      id: `session-${Date.now()}`,
      title: '',
      description: '',
      isNewSession: true,
      hasActiveTask: false,
      intentStatus: 'idle',
      messages: [],
      attachments: [],
      generatedFiles: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set({ currentSession: newSession });
    return newSession;
  },
  
  updateSession: (updates) =>
    set((state) => {
      if (!state.currentSession) return {};
      return {
        currentSession: {
          ...state.currentSession,
          ...updates,
          updatedAt: new Date(),
        },
      };
    }),
  
  archiveSession: (title) =>
    set((state) => {
      if (!state.currentSession) return {};
      
      // 生成描述信息
      let description = '';
      if (state.currentSession.currentTask) {
        const taskTypeMap: Record<string, string> = {
          operation_plan: '运营方案生成',
          budget_split: '预算拆分',
          activity_config: '活动配置',
          activity_ops: '活动运营',
          rtb_plan: 'RTB方案',
          rtb_config: 'RTB配置',
          rtb_ops: 'RTB运营',
        };
        description = taskTypeMap[state.currentSession.currentTask.type] || '任务';
      }
      
      const archivedSession: ConversationSession = {
        ...state.currentSession,
        title: title || state.currentSession.title || '未命名会话',
        description: description || state.currentSession.description,
        archivedAt: new Date(),
      };
      
      return {
        archivedSessions: [archivedSession, ...state.archivedSessions],
        currentSession: null,
      };
    }),
  
  restoreSession: (sessionId) =>
    set((state) => {
      const session = state.archivedSessions.find(s => s.id === sessionId);
      if (!session) return {};
      
      return {
        currentSession: {
          ...session,
          isNewSession: false,
          archivedAt: undefined,
        },
        archivedSessions: state.archivedSessions.filter(s => s.id !== sessionId),
      };
    }),
  
  addDocumentGenerationTask: (task) =>
    set((state) => ({
      documentGenerationTasks: [task, ...state.documentGenerationTasks],
    })),
  
  updateDocumentGenerationTask: (id, updates) =>
    set((state) => ({
      documentGenerationTasks: state.documentGenerationTasks.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
}));
