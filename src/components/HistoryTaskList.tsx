import { useStore } from '@/store/useStore';
import { Clock, MessageSquare, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function HistoryTaskList() {
  const { archivedSessions, currentSession, restoreSession, createNewSession } = useStore();

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

  const getTaskStatusText = (session: typeof archivedSessions[0]) => {
    if (!session.currentTask) return '无任务';
    
    switch (session.currentTask.status) {
      case 'completed':
        return '已完成';
      case 'running':
        return '进行中';
      case 'archived':
        return '已归档';
      default:
        return '等待中';
    }
  };

  const handleSessionClick = (session: typeof archivedSessions[0]) => {
    if (session.id === currentSession?.id) return;
    restoreSession(session.id);
  };

  const handleNewSession = () => {
    createNewSession();
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* 标题栏 - 统一高度 h-14 */}
      <div className="flex-shrink-0 h-14 px-4 border-b border-gray-200 bg-white flex items-center">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-sm font-semibold text-gray-900">历史任务</h2>
          <button
            onClick={handleNewSession}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            新建
          </button>
        </div>
      </div>

      {/* 当前会话 */}
      {currentSession && !currentSession.archivedAt && (
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-primary-50/50">
          <div className="flex items-start space-x-2">
            <MessageSquare className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentSession.title || '当前会话'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatTimeAgo(currentSession.updatedAt)}
              </p>
            </div>
            {getTaskStatusIcon(currentSession)}
          </div>
        </div>
      )}

      {/* 历史任务列表 */}
      <div className="flex-1 overflow-y-auto">
        {archivedSessions.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-gray-500">暂无历史任务</p>
            <p className="text-xs text-gray-400 mt-1">完成任务后将显示在这里</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {archivedSessions.map((session) => {
              const isActive = session.id === currentSession?.id;
              return (
                <button
                  key={session.id}
                  onClick={() => handleSessionClick(session)}
                  className={clsx(
                    'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors',
                    isActive && 'bg-primary-50 border-l-2 border-primary-500'
                  )}
                >
                  <div className="flex items-start space-x-2">
                    <MessageSquare className={clsx(
                      'w-4 h-4 mt-0.5 flex-shrink-0',
                      isActive ? 'text-primary-600' : 'text-gray-400'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className={clsx(
                        'text-sm font-medium truncate',
                        isActive ? 'text-primary-900' : 'text-gray-900'
                      )}>
                        {session.title || '未命名任务'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
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
                      <div className="flex items-center space-x-2 mt-1.5">
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(session.updatedAt)}
                        </span>
                        {session.currentTask && (
                          <>
                            <span className="text-xs text-gray-300">•</span>
                            <span className={clsx(
                              'text-xs',
                              session.currentTask.status === 'completed' ? 'text-green-600' :
                              session.currentTask.status === 'running' ? 'text-blue-600' :
                              'text-gray-500'
                            )}>
                              {getTaskStatusText(session)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {getTaskStatusIcon(session)}
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
