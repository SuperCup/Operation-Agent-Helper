import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Check, X, Settings, Zap } from 'lucide-react';
import clsx from 'clsx';

export default function ModelsTab() {
  const { models, updateModel } = useStore();
  const [selectedModel, setSelectedModel] = useState(models[0]?.id);

  const selectedModelData = models.find(m => m.id === selectedModel);

  const providerColors: Record<string, string> = {
    openai: 'bg-green-100 text-green-800',
    anthropic: 'bg-purple-100 text-purple-800',
    google: 'bg-blue-100 text-blue-800',
    azure: 'bg-cyan-100 text-cyan-800',
    local: 'bg-gray-100 text-gray-800',
  };

  const handleToggle = (id: string, enabled: boolean) => {
    updateModel(id, { enabled });
  };

  const handleUpdateSettings = (id: string, field: string, value: any) => {
    updateModel(id, { [field]: value });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 模型列表 */}
      <div className="lg:col-span-1 space-y-3">
        {models.map((model) => (
          <div
            key={model.id}
            onClick={() => setSelectedModel(model.id)}
            className={clsx(
              'p-4 rounded-lg border-2 cursor-pointer transition-all',
              selectedModel === model.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{model.name}</h3>
                <span className={`badge ${providerColors[model.provider]} mt-2`}>
                  {model.provider.toUpperCase()}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(model.id, !model.enabled);
                }}
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                  model.enabled
                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                )}
              >
                {model.enabled ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">{model.description}</p>
          </div>
        ))}
      </div>

      {/* 模型详情和配置 */}
      {selectedModelData && (
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息 */}
          <div className="p-6 bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg border border-primary-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedModelData.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedModelData.description}</p>
              </div>
              <span className={`badge ${providerColors[selectedModelData.provider]}`}>
                {selectedModelData.provider.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600">最大Tokens</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {selectedModelData.maxTokens.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600">成本/1K</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  ${selectedModelData.costPer1kTokens}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600">Temperature</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {selectedModelData.temperature}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600">状态</p>
                <p className={`text-lg font-semibold mt-1 ${
                  selectedModelData.enabled ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {selectedModelData.enabled ? '已启用' : '已禁用'}
                </p>
              </div>
            </div>
          </div>

          {/* 能力标签 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-primary-600" />
              模型能力
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedModelData.capabilities.map((capability, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  {capability}
                </span>
              ))}
            </div>
          </div>

          {/* 参数配置 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-4 h-4 mr-2 text-primary-600" />
              参数配置
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature (创造性)
                  <span className="ml-2 text-gray-500 font-normal">当前: {selectedModelData.temperature}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedModelData.temperature}
                  onChange={(e) => handleUpdateSettings(selectedModelData.id, 'temperature', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>保守 (0.0)</span>
                  <span>平衡 (0.5)</span>
                  <span>创造 (1.0)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens (最大输出长度)
                </label>
                <input
                  type="number"
                  value={selectedModelData.maxTokens}
                  onChange={(e) => handleUpdateSettings(selectedModelData.id, 'maxTokens', parseInt(e.target.value))}
                  className="input-field"
                  min="100"
                  max="200000"
                  step="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  建议根据任务复杂度设置，过大会增加成本
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">启用此模型</p>
                    <p className="text-xs text-gray-500 mt-1">
                      启用后可在Agent配置中选择使用
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(selectedModelData.id, !selectedModelData.enabled)}
                    className={clsx(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      selectedModelData.enabled ? 'bg-primary-600' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={clsx(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        selectedModelData.enabled ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 使用建议 */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="text-sm font-semibold text-amber-900 mb-2">💡 使用建议</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              {selectedModelData.provider === 'openai' && selectedModelData.type === 'gpt-4-turbo' && (
                <>
                  <li>• 适合复杂的运营方案生成和数据分析任务</li>
                  <li>• 建议Temperature设置为0.7以获得创造性和准确性的平衡</li>
                  <li>• 成本较高，建议用于关键任务</li>
                </>
              )}
              {selectedModelData.provider === 'openai' && selectedModelData.type === 'gpt-3.5-turbo' && (
                <>
                  <li>• 性价比高，适合日常运营任务</li>
                  <li>• 可用于快速生成执行计划和提报表</li>
                  <li>• 建议用于批量处理任务</li>
                </>
              )}
              {selectedModelData.provider === 'anthropic' && (
                <>
                  <li>• Claude擅长长文本处理和复杂推理</li>
                  <li>• 适合深度数据分析和策略建议</li>
                  <li>• 上下文窗口大，可处理更多历史信息</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
