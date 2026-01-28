import { Clock } from 'lucide-react';
import { ConversationSession } from '@/types';

interface Props {
  session: ConversationSession;
  onContinue: () => void;
  onNewSession: () => void;
}

export default function SessionRestoreModal({ session, onContinue, onNewSession }: Props) {
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

  const getTaskStatusText = () => {
    if (!session.currentTask) return '无进行中任务';
    switch (session.currentTask.status) {
      case 'collecting':
        return '信息收集中';
      case 'running':
        return '任务执行中';
      case 'completed':
        return '任务已完成';
      default:
        return '任务已暂停';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">💬 检测到您有未完成的会话</h2>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">会话标题</span>
                <span className="text-sm text-gray-900">
                  {session.title || '未命名会话'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">最后活动</span>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimeAgo(session.updatedAt)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">当前状态</span>
                <span className="text-sm text-gray-600">{getTaskStatusText()}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onNewSession}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              开启新会话
            </button>
            <button
              onClick={onContinue}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              继续此会话
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
