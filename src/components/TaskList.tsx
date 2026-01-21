import { useStore } from '@/store/useStore';
import { Loader2, CheckCircle2, XCircle, Pause, Play, Trash2, FileText, BarChart3, Sparkles, Workflow } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { BackgroundTask } from '@/types';
import clsx from 'clsx';

const taskTypeIcons: Record<BackgroundTask['type'], typeof Workflow> = {
  workflow: Workflow,
  report: FileText,
  analysis: BarChart3,
  generation: Sparkles,
};

const taskTypeLabels: Record<BackgroundTask['type'], string> = {
  workflow: '工作流执行',
  report: '报告生成',
  analysis: '数据分析',
  generation: '方案生成',
};

export default function TaskList() {
  const { backgroundTasks, updateTask, removeTask } = useStore();

  const handlePauseResume = (task: BackgroundTask) => {
    if (task.status === 'running') {
      updateTask(task.id, { status: 'paused' });
    } else if (task.status === 'paused') {
      updateTask(task.id, { status: 'running' });
    }
  };

  const handleRemove = (id: string) => {
    removeTask(id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'paused':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'paused':
        return <Pause className="w-4 h-4" />;
      default:
        return <Loader2 className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running':
        return '执行中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      case 'paused':
        return '已暂停';
      default:
        return '等待中';
    }
  };

  if (backgroundTasks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm">暂无进行中的任务</p>
        <p className="text-gray-400 text-xs mt-1">在对话中发起需求后，任务将在这里显示</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {backgroundTasks.map((task) => {
        const TaskIcon = taskTypeIcons[task.type];
        
        return (
          <div
            key={task.id}
            className={clsx(
              'p-4 rounded-lg border-2 transition-all',
              task.status === 'running' ? 'border-blue-200 bg-blue-50' :
              task.status === 'completed' ? 'border-green-200 bg-green-50' :
              task.status === 'failed' ? 'border-red-200 bg-red-50' :
              'border-gray-200 bg-gray-50'
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start space-x-3 flex-1">
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  task.status === 'running' ? 'bg-blue-100' :
                  task.status === 'completed' ? 'bg-green-100' :
                  task.status === 'failed' ? 'bg-red-100' :
                  'bg-gray-100'
                )}>
                  <TaskIcon className={clsx(
                    'w-4 h-4',
                    task.status === 'running' ? 'text-blue-600' :
                    task.status === 'completed' ? 'text-green-600' :
                    task.status === 'failed' ? 'text-red-600' :
                    'text-gray-600'
                  )} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                    <span className="badge bg-gray-100 text-gray-700 text-xs">
                      {taskTypeLabels[task.type]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  
                  {/* 进度条 */}
                  {task.status === 'running' && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>进度</span>
                        <span>{Math.round(task.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 时间信息 */}
                  <p className="text-xs text-gray-500 mt-2">
                    创建于 {format(task.createdAt, 'HH:mm:ss', { locale: zhCN })}
                    {task.completedAt && ` · 完成于 ${format(task.completedAt, 'HH:mm:ss', { locale: zhCN })}`}
                  </p>
                </div>
              </div>

              {/* 状态和操作 */}
              <div className="flex items-center space-x-2 ml-3">
                <div className={clsx('flex items-center space-x-1', getStatusColor(task.status))}>
                  {getStatusIcon(task.status)}
                  <span className="text-sm font-medium">{getStatusText(task.status)}</span>
                </div>

                {(task.status === 'running' || task.status === 'paused') && (
                  <button
                    onClick={() => handlePauseResume(task)}
                    className="p-1 hover:bg-white rounded transition-colors"
                    title={task.status === 'running' ? '暂停' : '继续'}
                  >
                    {task.status === 'running' ? (
                      <Pause className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Play className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                )}

                {(task.status === 'completed' || task.status === 'failed') && (
                  <button
                    onClick={() => handleRemove(task.id)}
                    className="p-1 hover:bg-white rounded transition-colors"
                    title="移除"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                  </button>
                )}
              </div>
            </div>

            {/* 错误信息 */}
            {task.status === 'failed' && task.error && (
              <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-800">
                错误：{task.error}
              </div>
            )}

            {/* 结果预览 */}
            {task.status === 'completed' && task.result && (
              <div className="mt-2 p-2 bg-white border border-gray-200 rounded text-xs">
                <p className="text-gray-600">✓ 任务已完成，结果已在对话中展示</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
