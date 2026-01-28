import { Presentation, FileSpreadsheet, FileText } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { documentService } from '@/services/documentService';
import { useState } from 'react';
import clsx from 'clsx';

interface QuickAction {
  id: 'ppt' | 'excel' | 'doc';
  name: string;
  icon: typeof Presentation;
  description: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'ppt',
    name: '生成PPT',
    icon: Presentation,
    description: '将当前内容生成为演示文稿',
  },
  {
    id: 'excel',
    name: '生成Excel',
    icon: FileSpreadsheet,
    description: '将当前内容生成为数据表格',
  },
  {
    id: 'doc',
    name: '生成Doc',
    icon: FileText,
    description: '将当前内容生成为文档',
  },
];

export default function QuickActionsBar() {
  const currentSession = useStore((state) => state.currentSession);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  // 检查当前任务是否有足够内容生成对应格式
  const canGenerate = (_type: 'ppt' | 'excel' | 'doc'): boolean => {
    if (!currentSession || !currentSession.currentTask) {
      return false;
    }
    
    // 任务必须已完成
    if (currentSession.currentTask.status !== 'completed') {
      return false;
    }
    
    // 检查是否有工作流输出或任务输出数据
    const taskOutput = currentSession.currentTask.collectedParams || {};
    const hasWorkflowOutput = taskOutput.workflowOutput || taskOutput.finalOutput;
    const hasBasicData = taskOutput.projectName || taskOutput.brand || taskOutput.platform;
    
    // 如果有工作流输出或基本数据，则可以生成
    return !!(hasWorkflowOutput || hasBasicData);
  };

  const handleActionClick = async (actionId: 'ppt' | 'excel' | 'doc') => {
    if (!canGenerate(actionId)) {
      return;
    }

    if (!currentSession?.currentTask) {
      return;
    }

    try {
      // 获取任务输出数据
      const taskOutput = currentSession.currentTask.collectedParams || {};
      
      // 格式化数据
      const documentData = documentService.formatTaskOutputToDocumentData(taskOutput, actionId);

      // 创建文档生成任务
      const taskId = `doc-gen-${Date.now()}`;
      const { addDocumentGenerationTask } = useStore.getState();
      
      addDocumentGenerationTask({
        id: taskId,
        type: actionId,
        sourceTaskId: currentSession.currentTask.id,
        status: 'generating',
        progress: 0,
        createdAt: new Date(),
      });

      // 异步生成文档
      (async () => {
        try {
          const result = await documentService.generateDocument({
            type: actionId,
            data: documentData,
            filename: `${documentData.title || '文档'}.${actionId === 'ppt' ? 'pptx' : actionId === 'excel' ? 'xlsx' : 'docx'}`,
          });

          // 更新任务状态
          const { updateDocumentGenerationTask } = useStore.getState();
          updateDocumentGenerationTask(taskId, {
            status: 'completed',
            progress: 100,
            result: {
              url: result.url,
              previewUrl: result.url,
            },
            completedAt: new Date(),
          });

          // 下载文档
          await documentService.downloadDocument(result.blob, result.filename);
        } catch (error: any) {
          console.error('Document generation failed:', error);
          const { updateDocumentGenerationTask } = useStore.getState();
          updateDocumentGenerationTask(taskId, {
            status: 'failed',
            error: error.message,
          });
        }
      })();
    } catch (error: any) {
      console.error('Failed to generate document:', error);
    }
  };

  const getDisabledReason = (type: 'ppt' | 'excel' | 'doc'): string => {
    if (!currentSession) {
      return '请先开始一个任务';
    }
    if (!currentSession.currentTask) {
      return '当前任务无可用内容生成' + (type === 'ppt' ? 'PPT' : type === 'excel' ? 'Excel' : 'Doc');
    }
    return '当前任务无可用内容生成' + (type === 'ppt' ? 'PPT' : type === 'excel' ? 'Excel' : 'Doc');
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900 mb-3">快捷功能</h2>
      <div className="space-y-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const enabled = canGenerate(action.id);
          
          return (
            <div key={action.id} className="relative">
              <button
                onClick={() => handleActionClick(action.id)}
                onMouseEnter={() => setHoveredAction(action.id)}
                onMouseLeave={() => setHoveredAction(null)}
                disabled={!enabled}
                className={clsx(
                  'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg border transition-all',
                  enabled
                    ? 'border-primary-200 bg-primary-50 hover:border-primary-300 hover:bg-primary-100 cursor-pointer'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                )}
              >
                <div
                  className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    enabled ? 'bg-primary-100' : 'bg-gray-100'
                  )}
                >
                  <Icon
                    className={clsx(
                      'w-4 h-4',
                      enabled ? 'text-primary-600' : 'text-gray-400'
                    )}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p
                    className={clsx(
                      'font-medium text-sm',
                      enabled ? 'text-gray-900' : 'text-gray-500'
                    )}
                  >
                    {action.name}
                  </p>
                  <p
                    className={clsx(
                      'text-xs mt-0.5',
                      enabled ? 'text-gray-600' : 'text-gray-400'
                    )}
                  >
                    {action.description}
                  </p>
                </div>
              </button>

              {/* Hover提示 */}
              {hoveredAction === action.id && !enabled && (
                <div className="absolute z-10 bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
                  {getDisabledReason(action.id)}
                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
