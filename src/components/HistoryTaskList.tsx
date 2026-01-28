import { useStore } from '@/store/useStore';
import { Clock, MessageSquare, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function HistoryTaskList() {
  const { archivedSessions, currentSession, restoreSession } = useStore();

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} 分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours} 小时前`;
    } else {
      return `${diffDays} 天前`;
    }
  };

  const getTaskStatusIcon = (session: typeof archivedSessions[0] | typeof currentSession) => {
    if (!session?.currentTask) return null;
    
    // 当前会话不显示loading动画，只显示状态图标
    const isCurrentSession = session.id === currentSession?.id && !session.archivedAt;
    
    switch (session.currentTask.status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'running':
        // 当前会话不显示旋转动画
        return isCurrentSession ? (
          <Clock className="w-4 h-4 text-blue-600" />
        ) : (
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
        );
      case 'archived':
        return <XCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };


  const handleSessionClick = (session: typeof archivedSessions[0]) => {
    if (session.id === currentSession?.id) return;
    restoreSession(session.id);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 标题栏 */}
      <div className="flex-shrink-0 h-12 px-4 border-b border-gray-200/60 bg-white/50 flex items-center">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-sm font-medium text-gray-700">历史对话</h2>
        </div>
      </div>

      {/* 当前会话 */}
      {currentSession && !currentSession.archivedAt && (
        <div className="mx-3 mt-3 mb-2 px-3 py-2.5 bg-white rounded-lg border border-gray-200/60 shadow-sm">
          <div className="flex items-start space-x-2">
            <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {currentSession.title || '当前会话'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatTimeAgo(currentSession.updatedAt)}
              </p>
            </div>
            {getTaskStatusIcon(currentSession)}
          </div>
        </div>
      )}

      {/* 历史任务列表 */}
      <div className="flex-1 overflow-y-auto px-3">
        {archivedSessions.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-xs text-gray-400">暂无历史任务</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {archivedSessions.map((session) => {
              const isActive = session.id === currentSession?.id;
              return (
                <button
                  key={session.id}
                  onClick={() => handleSessionClick(session)}
                  className={clsx(
                    'w-full px-3 py-2.5 text-left rounded-lg transition-all',
                    isActive 
                      ? 'bg-white shadow-sm border border-gray-200/60' 
                      : 'hover:bg-white/60'
                  )}
                >
                  <div className="flex items-start space-x-2">
                    <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {session.title || '未命名任务'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                        {session.description || 
                         (session.currentTask ? (
                           session.currentTask.type === 'operation_plan' ? '运营方案生成' :
                           session.currentTask.type === 'budget_split' ? '预算拆分' :
                           session.currentTask.type === 'activity_config' ? '活动配置' :
                           session.currentTask.type === 'activity_ops' ? '活动运营' :
                           session.currentTask.type === 'rtb_plan' ? 'RTB方案' :
                           session.currentTask.type === 'rtb_config' ? 'RTB配置' :
                           session.currentTask.type === 'rtb_ops' ? 'RTB运营' : '任务'
                         ) : '无描述')}
                      </p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
