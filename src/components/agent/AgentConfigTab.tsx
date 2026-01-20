import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, Edit, Trash2, Copy, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const phaseLabels: Record<string, string> = {
  preparation: '准备阶段',
  planning: '启动阶段',
  execution: '执行阶段',
  monitoring: '监控阶段',
  completion: '结案阶段',
};

export default function AgentConfigTab() {
  const { agentConfigs, models, deleteAgentConfig } = useStore();
  const [selectedAgent, setSelectedAgent] = useState(agentConfigs[0]?.id);

  const selectedAgentData = agentConfigs.find(a => a.id === selectedAgent);
  const agentModel = selectedAgentData ? models.find(m => m.id === selectedAgentData.model) : null;

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个Agent配置吗？')) {
      deleteAgentConfig(id);
      if (selectedAgent === id) {
        setSelectedAgent(agentConfigs[0]?.id);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          共 {agentConfigs.length} 个Agent配置
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>新建Agent</span>
        </button>
      </div>

      {/* Agent列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentConfigs.map((agent) => {
          const model = models.find(m => m.id === agent.model);
          
          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`card cursor-pointer transition-all hover:shadow-md ${
                selectedAgent === agent.id ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{agent.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{agent.description}</p>
                </div>
                {agent.enabled && (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">阶段</span>
                  <span className="badge bg-primary-100 text-primary-800">
                    {phaseLabels[agent.phase]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">模型</span>
                  <span className="font-medium text-gray-900">{model?.name || '未知'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">工具数</span>
                  <span className="font-medium text-gray-900">{agent.tools.length}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {format(agent.updatedAt, 'yyyy-MM-dd', { locale: zhCN })}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // 复制功能
                    }}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // 编辑功能
                    }}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(agent.id);
                    }}
                    className="p-1.5 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Agent详情 */}
      {selectedAgentData && agentModel && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Agent详情</h3>
          
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">名称</label>
                <input
                  type="text"
                  value={selectedAgentData.name}
                  className="input-field"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">阶段</label>
                <input
                  type="text"
                  value={phaseLabels[selectedAgentData.phase]}
                  className="input-field"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
              <textarea
                value={selectedAgentData.description}
                className="input-field"
                rows={2}
                readOnly
              />
            </div>

            {/* 模型配置 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">模型配置</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">选择模型</p>
                  <p className="font-medium text-gray-900">{agentModel.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Temperature</p>
                  <p className="font-medium text-gray-900">{selectedAgentData.temperature}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Max Tokens</p>
                  <p className="font-medium text-gray-900">{selectedAgentData.maxTokens}</p>
                </div>
              </div>
            </div>

            {/* 系统提示词 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">系统提示词</label>
              <textarea
                value={selectedAgentData.prompts.systemPrompt}
                className="input-field font-mono text-sm"
                rows={4}
                readOnly
              />
            </div>

            {/* 任务提示词 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">任务提示词</label>
              <div className="space-y-3">
                {Object.entries(selectedAgentData.prompts.taskPrompts).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 mb-2">{key}</p>
                    <p className="text-sm text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 可用工具 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">可用工具</label>
              <div className="grid grid-cols-2 gap-3">
                {selectedAgentData.tools.map((tool) => (
                  <div
                    key={tool.id}
                    className={`p-3 rounded-lg border-2 ${
                      tool.enabled
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900">{tool.name}</p>
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          tool.enabled ? 'text-green-600' : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-gray-600">{tool.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
