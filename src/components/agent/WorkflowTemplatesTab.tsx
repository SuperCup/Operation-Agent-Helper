import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, Star, Users, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const phaseLabels: Record<string, string> = {
  preparation: '准备阶段',
  planning: '启动阶段',
  execution: '执行阶段',
  monitoring: '监控阶段',
  completion: '结案阶段',
};

const stepTypeLabels: Record<string, string> = {
  analysis: '分析',
  generation: '生成',
  validation: '验证',
  submission: '提交',
  notification: '通知',
  evaluation: '评估',
};

export default function WorkflowTemplatesTab() {
  const { workflowTemplates, agentConfigs } = useStore();
  const [selectedTemplate, setSelectedTemplate] = useState(workflowTemplates[0]?.id);

  const selectedTemplateData = workflowTemplates.find(t => t.id === selectedTemplate);
  const templateAgent = selectedTemplateData 
    ? agentConfigs.find(a => a.id === selectedTemplateData.agentConfig)
    : null;

  // 计算总预估时间
  const getTotalDuration = (template: typeof workflowTemplates[0]) => {
    const totalSeconds = template.steps.reduce((sum, step) => sum + step.estimatedDuration, 0);
    const minutes = Math.floor(totalSeconds / 60);
    return minutes;
  };

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          共 {workflowTemplates.length} 个工作流模板
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>新建模板</span>
        </button>
      </div>

      {/* 模板列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflowTemplates.map((template) => {
          const duration = getTotalDuration(template);
          
          return (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`card cursor-pointer transition-all hover:shadow-md ${
                selectedTemplate === template.id ? 'ring-2 ring-primary-500' : ''
              } ${!template.enabled ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
                    {template.isDefault && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">阶段</span>
                  <span className="badge bg-primary-100 text-primary-800">
                    {phaseLabels[template.phase]}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">步骤数</span>
                  <span className="font-medium text-gray-900">{template.steps.length} 步</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">预估时长</span>
                  <span className="font-medium text-gray-900">{duration} 分钟</span>
                </div>

                <div className="pt-3 border-t border-gray-200 grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <div className="text-xs">
                      <p className="text-gray-500">使用次数</p>
                      <p className="font-semibold text-gray-900">{template.usageCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <div className="text-xs">
                      <p className="text-gray-500">成功率</p>
                      <p className="font-semibold text-gray-900">{template.successRate}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 模板详情 */}
      {selectedTemplateData && (
        <div className="card">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-bold text-gray-900">{selectedTemplateData.name}</h2>
                {selectedTemplateData.isDefault && (
                  <span className="badge bg-yellow-100 text-yellow-800">默认模板</span>
                )}
                {!selectedTemplateData.enabled && (
                  <span className="badge bg-gray-100 text-gray-600">已禁用</span>
                )}
              </div>
              <p className="text-gray-600">{selectedTemplateData.description}</p>
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <span>创建于 {format(selectedTemplateData.createdAt, 'yyyy-MM-dd', { locale: zhCN })}</span>
                <span>•</span>
                <span>更新于 {format(selectedTemplateData.updatedAt, 'yyyy-MM-dd', { locale: zhCN })}</span>
              </div>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 mb-1">所属阶段</p>
              <p className="text-lg font-semibold text-blue-900">
                {phaseLabels[selectedTemplateData.phase]}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700 mb-1">步骤数量</p>
              <p className="text-lg font-semibold text-purple-900">
                {selectedTemplateData.steps.length} 步
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 mb-1">使用次数</p>
              <p className="text-lg font-semibold text-green-900">
                {selectedTemplateData.usageCount}
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-700 mb-1">成功率</p>
              <p className="text-lg font-semibold text-orange-900">
                {selectedTemplateData.successRate}%
              </p>
            </div>
          </div>

          {/* 关联Agent */}
          {templateAgent && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-900 mb-2">关联Agent配置</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{templateAgent.name}</p>
                  <p className="text-sm text-gray-600">{templateAgent.description}</p>
                </div>
                <button className="text-sm text-primary-600 hover:text-primary-700">
                  查看详情
                </button>
              </div>
            </div>
          )}

          {/* 工作流步骤 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">工作流步骤</h3>
            <div className="space-y-3">
              {selectedTemplateData.steps.map((step, index) => (
                <div key={step.id} className="relative">
                  {index < selectedTemplateData.steps.length - 1 && (
                    <div className="absolute left-5 top-14 bottom-0 w-0.5 bg-gray-200" />
                  )}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{step.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`badge ${
                            step.type === 'analysis' ? 'bg-blue-100 text-blue-800' :
                            step.type === 'generation' ? 'bg-purple-100 text-purple-800' :
                            step.type === 'validation' ? 'bg-green-100 text-green-800' :
                            step.type === 'submission' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {stepTypeLabels[step.type]}
                          </span>
                          {step.requiresHumanInput && (
                            <span className="badge bg-yellow-100 text-yellow-800">人工</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>预估 {Math.floor(step.estimatedDuration / 60)} 分钟</span>
                        </div>
                        {step.promptTemplate && (
                          <span className="text-primary-600">• 使用提示词模板</span>
                        )}
                      </div>

                      {step.requiresHumanInput && step.humanInputPrompt && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                          <span className="font-medium">人工确认：</span> {step.humanInputPrompt}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-3">
            <button className="btn-secondary">
              复制模板
            </button>
            <button className="btn-secondary">
              编辑模板
            </button>
            <button className="btn-primary">
              使用此模板
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
