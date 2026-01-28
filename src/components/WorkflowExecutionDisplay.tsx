import { CheckCircle2, Loader2, Clock, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import { useState, useEffect } from 'react';
import { workflowEngine } from '@/services/workflowEngine';
import clsx from 'clsx';

interface WorkflowStepExecution {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  output?: any;
  thinking?: string;
  logs: string[];
  startTime?: Date;
  endTime?: Date;
  requiresHumanInput?: boolean;
  humanInputPrompt?: string;
}

interface Props {
  workflowId: string;
  steps: WorkflowStepExecution[];
  onStepClick?: (stepId: string) => void;
}

export default function WorkflowExecutionDisplay({ workflowId, steps: initialSteps }: Props) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [expandedThinking, setExpandedThinking] = useState<Set<string>>(new Set());
  const [steps, setSteps] = useState<WorkflowStepExecution[]>(initialSteps);

  // 订阅工作流更新
  useEffect(() => {
    const unsubscribe = workflowEngine.onExecutionUpdate(workflowId, (execution) => {
      setSteps(execution.steps);
    });

    // 初始加载
    const execution = workflowEngine.getExecution(workflowId);
    if (execution) {
      setSteps(execution.steps);
    }

    return unsubscribe;
  }, [workflowId]);

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const toggleThinking = (stepId: string) => {
    setExpandedThinking((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'failed':
        return <span className="w-5 h-5 text-red-600">✕</span>;
      case 'waiting_human':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return '已完成';
      case 'running':
        return '进行中';
      case 'failed':
        return '失败';
      case 'waiting_human':
        return '等待确认';
      default:
        return '等待中';
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">工作流执行过程</h3>
      </div>
      {steps.map((step, index) => {
        const isExpanded = expandedSteps.has(step.id);
        const isThinkingExpanded = expandedThinking.has(step.id);
        const isActive = step.status === 'running';
        const isCompleted = step.status === 'success';
        const isWaiting = step.status === 'waiting_human';

        return (
          <div
            key={step.id}
            className={clsx(
              'border rounded-lg overflow-hidden transition-all shadow-sm',
              isActive
                ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-blue-100/50 shadow-blue-100'
                : isCompleted
                ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50/50 shadow-green-100'
                : isWaiting
                ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50/50 shadow-yellow-100'
                : 'border-gray-200 bg-white shadow-gray-50'
            )}
          >
            {/* 步骤头部 */}
            <div
              className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-opacity-70 transition-all"
              onClick={() => toggleStep(step.id)}
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className="flex-shrink-0">{getStatusIcon(step.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-1">
                    <span className="text-[11px] font-semibold text-gray-900">
                      {index + 1}. {step.name}
                    </span>
                    <span
                      className={clsx(
                        'text-[9px] px-1.5 py-0.5 rounded-full font-medium',
                        isActive
                          ? 'bg-blue-200 text-blue-800'
                          : isCompleted
                          ? 'bg-green-200 text-green-800'
                          : isWaiting
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-gray-200 text-gray-700'
                      )}
                    >
                      {getStatusText(step.status)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{step.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                {step.status === 'running' && (
                  <div className="text-[10px] text-blue-600 font-medium">
                    {Math.round(step.progress)}%
                  </div>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* 步骤详情（可展开） */}
            {isExpanded && (
              <div className="px-3 pb-3 space-y-2.5 border-t border-gray-200 bg-white">
                {/* 进度条 */}
                {step.status === 'running' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-gray-600">
                      <span>执行进度</span>
                      <span>{Math.round(step.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 执行日志 */}
                {step.logs && step.logs.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-medium text-gray-700">执行日志</div>
                    <div className="bg-gray-50 rounded-lg p-2 space-y-0.5 max-h-32 overflow-y-auto">
                      {step.logs.map((log, logIndex) => (
                        <div key={logIndex} className="text-[10px] text-gray-600 font-mono leading-relaxed">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agent思考过程 */}
                {step.output?.thinking && (
                  <div className="space-y-1.5">
                    <button
                      onClick={() => toggleThinking(step.id)}
                      className="flex items-center space-x-1.5 text-[11px] font-medium text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      <span>Agent思考过程</span>
                      {isThinkingExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {isThinkingExpanded && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5">
                        <div className="text-[11px] text-purple-900 whitespace-pre-wrap leading-relaxed">
                          {step.output.thinking}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 输出结果 */}
                {step.output && step.output.content && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-medium text-gray-700">输出结果</div>
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <div className="text-[11px] text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {step.output.content}
                      </div>
                    </div>
                  </div>
                )}

                {/* 需要人工确认 */}
                {step.requiresHumanInput && step.humanInputPrompt && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5">
                    <div className="text-[11px] font-medium text-yellow-900 mb-1">
                      ⚠️ 需要人工确认
                    </div>
                    <div className="text-[11px] text-yellow-800 leading-relaxed">{step.humanInputPrompt}</div>
                  </div>
                )}

                {/* 时间信息 */}
                {(step.startTime || step.endTime) && (
                  <div className="text-xs text-gray-500 space-y-1">
                    {step.startTime && (
                      <div>开始时间: {new Date(step.startTime).toLocaleString('zh-CN')}</div>
                    )}
                    {step.endTime && (
                      <div>结束时间: {new Date(step.endTime).toLocaleString('zh-CN')}</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
