import { useEffect, useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import EnhancedAIChatBox from '@/components/EnhancedAIChatBox';
import TaskList from '@/components/TaskList';
import HistoryTaskList from '@/components/HistoryTaskList';
import SessionRestoreModal from '@/components/SessionRestoreModal';
import ArchiveSessionModal from '@/components/ArchiveSessionModal';
import { ConversationSession } from '@/types';

export default function Dashboard() {
  const {
    currentSession,
    createNewSession,
    archiveSession,
  } = useStore();

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [pendingArchiveTitle, setPendingArchiveTitle] = useState('');
  const hasInitializedRef = useRef(false);
  const archivedTaskIdsRef = useRef<Set<string>>(new Set());

  // 初始化会话（只执行一次）
  useEffect(() => {
    if (!hasInitializedRef.current && !currentSession) {
      createNewSession();
      hasInitializedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 检查任务完成，自动归档（防止重复归档）
  useEffect(() => {
    const taskId = currentSession?.currentTask?.id;
    const taskStatus = currentSession?.currentTask?.status;
    
    if (
      currentSession &&
      taskId &&
      taskStatus === 'completed' &&
      !archivedTaskIdsRef.current.has(taskId)
    ) {
      // 标记为已归档，防止重复
      archivedTaskIdsRef.current.add(taskId);
      
      // 任务完成，自动归档
      const suggestedTitle = generateArchiveTitle(currentSession);
      handleAutoArchive(suggestedTitle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession?.currentTask?.status, currentSession?.currentTask?.id]);

  const generateArchiveTitle = (session: ConversationSession): string => {
    if (session.title) return session.title;
    
    if (session.currentTask) {
      const taskTypeMap: Record<string, string> = {
        operation_plan: '运营方案生成',
        budget_split: '预算拆分',
        activity_config: '活动配置',
        activity_ops: '活动运营',
        rtb_plan: 'RTB方案',
        rtb_config: 'RTB配置',
        rtb_ops: 'RTB运营',
      };
      return taskTypeMap[session.currentTask.type] || '任务会话';
    }
    
    return '未命名会话';
  };

  const handleContinueSession = () => {
    setShowRestoreModal(false);
  };

  const handleNewSession = () => {
    setShowRestoreModal(false);
    if (currentSession) {
      const suggestedTitle = generateArchiveTitle(currentSession);
      setPendingArchiveTitle(suggestedTitle);
      setShowArchiveModal(true);
    } else {
      createNewSession();
    }
  };

  const handleAutoArchive = (suggestedTitle: string) => {
    archiveSession(suggestedTitle);
    // 延迟创建新会话，避免立即触发
    setTimeout(() => {
      hasInitializedRef.current = false; // 重置初始化标记
      createNewSession();
      hasInitializedRef.current = true;
    }, 500);
  };

  const handleArchiveConfirm = (title: string) => {
    archiveSession(title);
    setShowArchiveModal(false);
    setPendingArchiveTitle('');
    createNewSession();
  };

  const handleArchiveCancel = () => {
    setShowArchiveModal(false);
    setPendingArchiveTitle('');
  };

  return (
    <div className="h-full w-full flex overflow-hidden bg-gray-50">
      {/* 左侧：历史任务列表 - NotebookLM风格 */}
      <div className="w-60 flex-shrink-0 bg-slate-50/80">
        <HistoryTaskList />
      </div>

      {/* 中间：对话区域 - 主工作区 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-x border-gray-200">
        {/* 标题栏 */}
        <div className="flex-shrink-0 h-12 px-4 border-b border-gray-200 bg-white flex items-center">
          <span className="text-sm font-medium text-gray-700">对话</span>
        </div>

        {/* 对话内容区域 */}
        <div className="flex-1 min-h-0 overflow-hidden bg-white">
          <EnhancedAIChatBox />
        </div>
      </div>

      {/* 右侧：文件预览 */}
      <div className="w-72 flex-shrink-0 bg-gray-50 flex flex-col overflow-hidden">
        <TaskList />
      </div>

      {/* 会话恢复模态框 */}
      {showRestoreModal && currentSession && (
        <SessionRestoreModal
          session={currentSession}
          onContinue={handleContinueSession}
          onNewSession={handleNewSession}
        />
      )}

      {/* 归档会话模态框 */}
      <ArchiveSessionModal
        isOpen={showArchiveModal}
        suggestedTitle={pendingArchiveTitle}
        onClose={handleArchiveCancel}
        onConfirm={handleArchiveConfirm}
      />
    </div>
  );
}
