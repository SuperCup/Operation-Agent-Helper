import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { 
  ArrowLeft, 
  Play, 
  Pause,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  FileText,
  User,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useState, useEffect, useRef } from 'react';
import { StepStatus } from '@/types';

export default function WorkflowExecution() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workflows, setCurrentWorkflow, updateWorkflow, updateWorkflowStep, addAgentMessage, agentMessages, projects } = useStore();
  const [isRunning, setIsRunning] = useState(false);
  const [humanInput, setHumanInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const workflow = workflows.find(w => w.id === id);
  const project = workflow ? projects.find(p => p.id === workflow.projectId) : null;

  useEffect(() => {
    if (workflow) {
      setCurrentWorkflow(workflow);
      setIsRunning(workflow.status === 'running');
    }
    return () => {
      setCurrentWorkflow(null);
    };
  }, [workflow]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentMessages]);

  if (!workflow) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">工作流不存在</p>
      </div>
    );
  }

  const handleStart = () => {
    setIsRunning(true);
    updateWorkflow(workflow.id, { status: 'running' });
    addAgentMessage({
      id: `msg-${Date.now()}`,
      type: 'system',
      content: `开始执行工作流：${workflow.name}`,
      timestamp: new Date(),
    });

    // 模拟执行步骤
    executeSteps();
  };

  const executeSteps = async () => {
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      
      // 开始执行步骤
      updateWorkflowStep(workflow.id, step.id, {
        status: 'running' as StepStatus,
        startTime: new Date(),
      });

      addAgentMessage({
        id: `msg-${Date.now()}-${i}`,
        type: 'agent',
        content: `正在执行: ${step.name}`,
        timestamp: new Date(),
      });

      // 模拟步骤执行
      await simulateStepExecution(step.id, i);

      // 如果需要人工介入，暂停
      if (step.requiresHumanInput) {
        updateWorkflowStep(workflow.id, step.id, {
          status: 'waiting_human' as StepStatus,
        });
        addAgentMessage({
          id: `msg-wait-${Date.now()}`,
          type: 'system',
          content: `⚠️ 需要人工确认: ${step.humanInputPrompt}`,
          timestamp: new Date(),
        });
        return; // 等待人工输入
      }
    }

    // 全部完成
    updateWorkflow(workflow.id, { status: 'completed' });
    setIsRunning(false);
    addAgentMessage({
      id: `msg-complete-${Date.now()}`,
      type: 'success',
      content: '✅ 工作流执行完成！',
      timestamp: new Date(),
    });
  };

  const simulateStepExecution = (stepId: string, index: number): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          updateWorkflowStep(workflow.id, stepId, {
            status: 'success' as StepStatus,
            progress: 100,
            endTime: new Date(),
          });

          const step = workflow.steps[index];
          step.logs.forEach((log, logIndex) => {
            setTimeout(() => {
              addAgentMessage({
                id: `msg-log-${Date.now()}-${logIndex}`,
                type: 'agent',
                content: log,
                timestamp: new Date(),
              });
            }, logIndex * 500);
          });

          setTimeout(resolve, step.logs.length * 500 + 1000);
        } else {
          updateWorkflowStep(workflow.id, stepId, { progress });
        }
      }, 800);
    });
  };

  const handleHumanConfirm = (confirmed: boolean) => {
    const waitingStep = workflow.steps.find(s => s.status === 'waiting_human');
    if (!waitingStep) return;

    if (confirmed) {
      addAgentMessage({
        id: `msg-confirm-${Date.now()}`,
        type: 'user',
        content: humanInput || '确认继续执行',
        timestamp: new Date(),
      });

      updateWorkflowStep(workflow.id, waitingStep.id, {
        status: 'success' as StepStatus,
        progress: 100,
        endTime: new Date(),
      });

      setHumanInput('');
      
      // 继续执行后续步骤
      setTimeout(() => {
        const nextStepIndex = workflow.steps.findIndex(s => s.id === waitingStep.id) + 1;
        if (nextStepIndex < workflow.steps.length) {
          executeStepsFrom(nextStepIndex);
        } else {
          updateWorkflow(workflow.id, { status: 'completed' });
          setIsRunning(false);
        }
      }, 1000);
    } else {
      updateWorkflow(workflow.id, { status: 'paused' });
      setIsRunning(false);
      addAgentMessage({
        id: `msg-pause-${Date.now()}`,
        type: 'system',
        content: '工作流已暂停',
        timestamp: new Date(),
      });
    }
  };

  const executeStepsFrom = async (startIndex: number) => {
    for (let i = startIndex; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      
      updateWorkflowStep(workflow.id, step.id, {
        status: 'running' as StepStatus,
        startTime: new Date(),
      });

      await simulateStepExecution(step.id, i);

      if (step.requiresHumanInput) {
        updateWorkflowStep(workflow.id, step.id, {
          status: 'waiting_human' as StepStatus,
        });
        return;
      }
    }

    updateWorkflow(workflow.id, { status: 'completed' });
    setIsRunning(false);
  };

  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'waiting_human':
        return <User className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const completedSteps = workflow.steps.filter(s => s.status === 'success').length;
  const totalProgress = (completedSteps / workflow.steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div>
        <button
          onClick={() => navigate(`/projects/${workflow.projectId}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回项目详情
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{workflow.name}</h1>
            <p className="text-gray-600 mt-1">{project?.name}</p>
          </div>
          <div className="flex space-x-3">
            {!isRunning && workflow.status !== 'completed' && (
              <button 
                onClick={handleStart}
                className="btn-primary flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>开始执行</span>
              </button>
            )}
            {isRunning && (
              <button 
                onClick={() => {
                  setIsRunning(false);
                  updateWorkflow(workflow.id, { status: 'paused' });
                }}
                className="btn-secondary flex items-center space-x-2"
              >
                <Pause className="w-4 h-4" />
                <span>暂停</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 总体进度 */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">总体进度</h2>
          <span className="text-sm text-gray-600">
            {completedSteps} / {workflow.steps.length} 步骤完成
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-primary-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 执行步骤 */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">执行步骤</h2>
          <div className="space-y-4">
            {workflow.steps.map((step, index) => (
              <div key={step.id} className="relative">
                {index < workflow.steps.length - 1 && (
                  <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200" />
                )}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900">{step.name}</p>
                      {step.status === 'running' && (
                        <span className="text-sm text-blue-600">{Math.round(step.progress)}%</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    
                    {step.status === 'running' && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    )}

                    {step.status === 'waiting_human' && step.humanInputPrompt && (
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-800 mb-3">{step.humanInputPrompt}</p>
                        <div className="space-y-2">
                          <textarea
                            value={humanInput}
                            onChange={(e) => setHumanInput(e.target.value)}
                            placeholder="输入您的确认或补充信息..."
                            className="w-full px-3 py-2 border border-orange-300 rounded-lg text-sm"
                            rows={2}
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleHumanConfirm(true)}
                              className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
                            >
                              确认继续
                            </button>
                            <button
                              onClick={() => handleHumanConfirm(false)}
                              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                            >
                              暂停工作流
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {(step.status === 'success' || step.status === 'running') && step.startTime && (
                      <p className="text-xs text-gray-500">
                        {format(step.startTime, 'HH:mm:ss', { locale: zhCN })}
                        {step.endTime && ` - ${format(step.endTime, 'HH:mm:ss', { locale: zhCN })}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent 消息流 */}
        <div className="card flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">AI 执行日志</h2>
            <MessageSquare className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {agentMessages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>点击"开始执行"启动工作流</p>
              </div>
            )}
            
            {agentMessages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-2 ${
                  message.type === 'user' ? 'justify-end' : ''
                }`}
              >
                {message.type !== 'user' && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'system' ? 'bg-gray-200' :
                    message.type === 'error' ? 'bg-red-100' :
                    message.type === 'success' ? 'bg-green-100' :
                    'bg-primary-100'
                  }`}>
                    {message.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    ) : message.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                )}
                
                <div className={`flex-1 ${message.type === 'user' ? 'max-w-[80%]' : ''}`}>
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user' ? 'bg-primary-600 text-white ml-auto' :
                    message.type === 'system' ? 'bg-gray-100 text-gray-900' :
                    message.type === 'error' ? 'bg-red-50 text-red-900' :
                    message.type === 'success' ? 'bg-green-50 text-green-900' :
                    'bg-blue-50 text-blue-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(message.timestamp, 'HH:mm:ss', { locale: zhCN })}
                  </p>
                </div>

                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
