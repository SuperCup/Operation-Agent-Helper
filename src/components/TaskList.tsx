import { useStore } from '@/store/useStore';
import { Loader2, CheckCircle2, XCircle, Pause, Play, Trash2, FileText, BarChart3, Sparkles, Workflow, Presentation, FileSpreadsheet, Eye, Download, Image as ImageIcon, File } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { BackgroundTask, ConversationFile } from '@/types';
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
  const { backgroundTasks, documentGenerationTasks, currentSession, updateTask, removeTask, updateDocumentGenerationTask } = useStore();

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

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'ppt':
        return Presentation;
      case 'excel':
        return FileSpreadsheet;
      case 'doc':
        return FileText;
      default:
        return FileText;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'ppt':
        return 'PPT生成';
      case 'excel':
        return 'Excel生成';
      case 'doc':
        return 'Doc生成';
      default:
        return '文档生成';
    }
  };

  // 从会话消息中提取Agent生成的文件和附件
  const getGeneratedFiles = (): Array<{
    id: string;
    name: string;
    type: string;
    url?: string;
    previewUrl?: string;
    generatedAt: Date;
    source: 'generated' | 'attachment';
  }> => {
    const files: Array<{
      id: string;
      name: string;
      type: string;
      url?: string;
      previewUrl?: string;
      generatedAt: Date;
      source: 'generated' | 'attachment';
    }> = [];

    // 从会话的generatedFiles中获取
    if (currentSession?.generatedFiles && currentSession.generatedFiles.length > 0) {
      currentSession.generatedFiles.forEach((file: ConversationFile) => {
        files.push({
          id: file.id,
          name: file.name,
          type: file.type, // 这里type是 'ppt' | 'excel' | 'doc' | 'other'
          url: file.url,
          previewUrl: file.previewUrl,
          generatedAt: file.generatedAt,
          source: 'generated',
        });
      });
    }

    // 从消息中提取Agent发送的附件（只提取agent类型的消息）
    if (currentSession?.messages) {
      currentSession.messages.forEach((message) => {
        if (message.type === 'agent' && message.metadata?.attachments) {
          message.metadata.attachments.forEach((att: any) => {
            // 避免重复添加
            if (!files.find(f => f.id === att.id)) {
              files.push({
                id: att.id,
                name: att.name,
                type: att.type,
                url: att.url,
                previewUrl: att.url, // 使用url作为预览
                generatedAt: message.timestamp,
                source: 'attachment',
              });
            }
          });
        }
      });
    }

    return files.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  };

  const generatedFiles = getGeneratedFiles();

  // 获取文件图标
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return ImageIcon;
    }
    // 处理ConversationFile的type字段（'ppt' | 'excel' | 'doc' | 'other'）
    if (type === 'ppt' || type.includes('presentation') || type.includes('powerpoint')) {
      return Presentation;
    }
    if (type === 'excel' || type.includes('spreadsheet') || type.includes('xls')) {
      return FileSpreadsheet;
    }
    if (type === 'doc' || type.includes('word') || type.includes('document') || type.includes('docx')) {
      return FileText;
    }
    if (type.includes('pdf')) {
      return FileText;
    }
    return File;
  };

  // 格式化文件类型显示
  const getFileTypeLabel = (type: string) => {
    if (type.startsWith('image/')) {
      return '图片';
    }
    // 处理ConversationFile的type字段（'ppt' | 'excel' | 'doc' | 'other'）
    if (type === 'ppt' || type.includes('presentation') || type.includes('powerpoint')) {
      return 'PPT';
    }
    if (type === 'excel' || type.includes('spreadsheet') || type.includes('xls')) {
      return 'Excel';
    }
    if (type === 'doc' || type.includes('word') || type.includes('document') || type.includes('docx')) {
      return 'Word';
    }
    if (type.includes('pdf')) {
      return 'PDF';
    }
    return '文件';
  };


  if (backgroundTasks.length === 0 && documentGenerationTasks.length === 0 && generatedFiles.length === 0) {
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
      {/* Agent生成的文件 */}
      {generatedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Agent生成的文件
          </div>
          {generatedFiles.map((file) => {
            const FileIcon = getFileIcon(file.type);
            return (
              <div
                key={file.id}
                className="p-3 rounded-lg border border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/50 transition-all cursor-pointer group"
                onClick={() => {
                  if (file.previewUrl || file.url) {
                    window.open(file.previewUrl || file.url, '_blank');
                  }
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                    <FileIcon className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{file.name}</h4>
                      <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {getFileTypeLabel(file.type)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{format(file.generatedAt, 'MM-dd HH:mm', { locale: zhCN })}</span>
                      {file.source === 'generated' && (
                        <>
                          <span>•</span>
                          <span className="text-primary-600">Agent生成</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 文档生成任务 */}
      {documentGenerationTasks.map((task: {
        id: string;
        type: 'ppt' | 'excel' | 'doc';
        sourceTaskId: string;
        status: 'pending' | 'generating' | 'completed' | 'failed';
        progress: number;
        result?: { url: string; previewUrl?: string };
        createdAt: Date;
        completedAt?: Date;
        error?: string;
      }) => {
        const DocIcon = getDocumentIcon(task.type);
        
        return (
          <div
            key={task.id}
            className={clsx(
              'p-4 rounded-lg border-2 transition-all',
              task.status === 'generating' ? 'border-blue-200 bg-blue-50' :
              task.status === 'completed' ? 'border-green-200 bg-green-50' :
              task.status === 'failed' ? 'border-red-200 bg-red-50' :
              'border-gray-200 bg-gray-50'
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start space-x-3 flex-1">
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  task.status === 'generating' ? 'bg-blue-100' :
                  task.status === 'completed' ? 'bg-green-100' :
                  task.status === 'failed' ? 'bg-red-100' :
                  'bg-gray-100'
                )}>
                  <DocIcon className={clsx(
                    'w-4 h-4',
                    task.status === 'generating' ? 'text-blue-600' :
                    task.status === 'completed' ? 'text-green-600' :
                    task.status === 'failed' ? 'text-red-600' :
                    'text-gray-600'
                  )} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">{getDocumentTypeLabel(task.type)}</h4>
                  </div>
                  
                  {/* 进度条 */}
                  {task.status === 'generating' && (
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
                {task.status === 'generating' && (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                )}
                {task.status === 'completed' && (
                  <div className="flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    {task.result?.previewUrl && (
                      <>
                        <button
                          onClick={() => window.open(task.result?.previewUrl, '_blank')}
                          className="p-1 hover:bg-white rounded transition-colors"
                          title="预览"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = task.result?.url || '';
                            link.download = '';
                            link.click();
                          }}
                          className="p-1 hover:bg-white rounded transition-colors"
                          title="下载"
                        >
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => updateDocumentGenerationTask(task.id, { status: 'failed' })}
                      className="p-1 hover:bg-white rounded transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                    </button>
                  </div>
                )}
                {task.status === 'failed' && (
                  <button
                    onClick={() => updateDocumentGenerationTask(task.id, { status: 'pending' })}
                    className="p-1 hover:bg-white rounded transition-colors"
                    title="删除"
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
          </div>
        );
      })}

      {/* 后台任务 */}
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
