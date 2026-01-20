import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, Play, History, Code, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import PromptTestModal from './PromptTestModal';

const phaseLabels: Record<string, string> = {
  preparation: '准备阶段',
  planning: '启动阶段',
  execution: '执行阶段',
  monitoring: '监控阶段',
  completion: '结案阶段',
};

const categoryLabels: Record<string, string> = {
  analysis: '数据分析',
  planning: '方案规划',
  execution: '执行生成',
  evaluation: '效果评估',
  reporting: '报告生成',
};

export default function PromptsTab() {
  const { promptTemplates } = useStore();
  const [selectedPrompt, setSelectedPrompt] = useState(promptTemplates[0]?.id);
  const [showTestModal, setShowTestModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredPrompts = promptTemplates.filter(p => 
    filterCategory === 'all' || p.category === filterCategory
  );

  const selectedPromptData = promptTemplates.find(p => p.id === selectedPrompt);

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">所有类别</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <span className="text-sm text-gray-600">
            共 {filteredPrompts.length} 个提示词模板
          </span>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>新建提示词</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 提示词列表 */}
        <div className="lg:col-span-1 space-y-3">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              onClick={() => setSelectedPrompt(prompt.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedPrompt === prompt.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{prompt.name}</h3>
                <span className="badge bg-blue-100 text-blue-800 text-xs">
                  v{prompt.version}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{prompt.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="badge bg-purple-100 text-purple-800">
                  {categoryLabels[prompt.category]}
                </span>
                <span className="text-gray-500">
                  {format(prompt.updatedAt, 'MM/dd', { locale: zhCN })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 提示词详情和编辑器 */}
        {selectedPromptData && (
          <div className="lg:col-span-2 space-y-6">
            {/* 头部信息 */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedPromptData.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedPromptData.description}</p>
                <div className="flex items-center space-x-3 mt-3">
                  <span className="badge bg-primary-100 text-primary-800">
                    {phaseLabels[selectedPromptData.phase]}
                  </span>
                  <span className="badge bg-purple-100 text-purple-800">
                    {categoryLabels[selectedPromptData.category]}
                  </span>
                  <span className="text-xs text-gray-500">
                    v{selectedPromptData.version} · {format(selectedPromptData.updatedAt, 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowTestModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>测试运行</span>
              </button>
            </div>

            {/* 系统提示词 */}
            {selectedPromptData.systemPrompt && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  <Code className="w-4 h-4 mr-2 text-primary-600" />
                  系统提示词
                </label>
                <div className="p-4 bg-gray-900 text-gray-100 rounded-lg font-mono text-sm">
                  {selectedPromptData.systemPrompt}
                </div>
              </div>
            )}

            {/* 提示词模板 */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-primary-600" />
                提示词模板
              </label>
              <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
                <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono">
                  {selectedPromptData.template}
                </pre>
              </div>
            </div>

            {/* 变量定义 */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">变量定义</label>
              <div className="space-y-2">
                {selectedPromptData.variables.map((variable, index) => (
                  <div key={index} className="p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <code className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-sm font-mono">
                          {`{{${variable.name}}}`}
                        </code>
                        <span className="badge bg-gray-100 text-gray-700 text-xs">
                          {variable.type}
                        </span>
                        {variable.required && (
                          <span className="badge bg-red-100 text-red-700 text-xs">必填</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{variable.description}</p>
                    {variable.defaultValue && (
                      <p className="text-xs text-gray-500 mt-1">
                        默认值: {JSON.stringify(variable.defaultValue)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 示例 */}
            {selectedPromptData.examples && selectedPromptData.examples.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <History className="w-4 h-4 mr-2 text-primary-600" />
                  使用示例
                </label>
                <div className="space-y-4">
                  {selectedPromptData.examples.map((example, index) => (
                    <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">输入参数</p>
                        <pre className="text-sm text-gray-900 font-mono bg-white p-3 rounded border border-gray-200">
                          {JSON.stringify(example.input, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">预期输出</p>
                        <div className="text-sm text-gray-900 bg-white p-3 rounded border border-gray-200">
                          {example.output}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 使用统计 */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-semibold text-green-900 mb-2">📊 使用统计</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-green-700">使用次数</p>
                  <p className="text-lg font-semibold text-green-900">245</p>
                </div>
                <div>
                  <p className="text-xs text-green-700">成功率</p>
                  <p className="text-lg font-semibold text-green-900">96.3%</p>
                </div>
                <div>
                  <p className="text-xs text-green-700">平均耗时</p>
                  <p className="text-lg font-semibold text-green-900">5.2s</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 测试模态框 */}
      {showTestModal && selectedPromptData && (
        <PromptTestModal
          prompt={selectedPromptData}
          onClose={() => setShowTestModal(false)}
        />
      )}
    </div>
  );
}
