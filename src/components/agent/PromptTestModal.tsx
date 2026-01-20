import { useState } from 'react';
import { X, Play, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { PromptTemplate, PromptTestResult } from '@/types';
import { useStore } from '@/store/useStore';

interface Props {
  prompt: PromptTemplate;
  onClose: () => void;
}

export default function PromptTestModal({ prompt, onClose }: Props) {
  const { models, addTestResult } = useStore();
  const [selectedModel, setSelectedModel] = useState(models.find(m => m.enabled)?.id || '');
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<PromptTestResult | null>(null);

  const selectedModelData = models.find(m => m.id === selectedModel);

  // 填充示例数据
  const fillExample = () => {
    if (prompt.examples && prompt.examples.length > 0) {
      setInputValues(prompt.examples[0].input);
    }
  };

  // 运行测试
  const handleRunTest = async () => {
    // 验证必填字段
    const missingRequired = prompt.variables
      .filter(v => v.required && !inputValues[v.name])
      .map(v => v.name);

    if (missingRequired.length > 0) {
      alert(`请填写必填字段: ${missingRequired.join(', ')}`);
      return;
    }

    setIsRunning(true);
    setTestResult(null);

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 生成模拟结果
    const mockOutput = `【AI生成结果】

这是一个模拟的AI输出结果。在实际使用中，这里会显示AI模型根据提示词和输入参数生成的完整响应。

输入参数:
${JSON.stringify(inputValues, null, 2)}

生成的内容会根据提示词模板的要求，结构化地输出专业的运营建议、方案或分析报告。`;

    const result: PromptTestResult = {
      id: `test-${Date.now()}`,
      promptId: prompt.id,
      input: inputValues,
      output: mockOutput,
      model: selectedModelData?.name || '',
      duration: 3.2 + Math.random() * 3,
      tokens: {
        input: 150 + Math.floor(Math.random() * 100),
        output: 800 + Math.floor(Math.random() * 200),
        total: 0,
      },
      cost: 0,
      success: true,
      timestamp: new Date(),
    };

    result.tokens.total = result.tokens.input + result.tokens.output;
    result.cost = (result.tokens.total / 1000) * (selectedModelData?.costPer1kTokens || 0.01);

    setTestResult(result);
    addTestResult(result);
    setIsRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">测试提示词</h2>
            <p className="text-sm text-gray-500 mt-1">{prompt.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 模型选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择模型</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="input-field"
            >
              {models.filter(m => m.enabled).map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} (${model.costPer1kTokens}/1K tokens)
                </option>
              ))}
            </select>
          </div>

          {/* 输入参数 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">输入参数</label>
              <button
                onClick={fillExample}
                className="text-sm text-primary-600 hover:text-primary-700"
                disabled={!prompt.examples || prompt.examples.length === 0}
              >
                填充示例数据
              </button>
            </div>
            <div className="space-y-3">
              {prompt.variables.map((variable) => (
                <div key={variable.name}>
                  <label className="block text-sm text-gray-700 mb-1">
                    {variable.name}
                    {variable.required && <span className="text-red-500 ml-1">*</span>}
                    <span className="text-gray-500 ml-2 text-xs">({variable.type})</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">{variable.description}</p>
                  {variable.type === 'string' && (
                    <input
                      type="text"
                      value={inputValues[variable.name] || ''}
                      onChange={(e) => setInputValues({ ...inputValues, [variable.name]: e.target.value })}
                      className="input-field"
                      placeholder={variable.defaultValue}
                    />
                  )}
                  {variable.type === 'number' && (
                    <input
                      type="number"
                      value={inputValues[variable.name] || ''}
                      onChange={(e) => setInputValues({ ...inputValues, [variable.name]: Number(e.target.value) })}
                      className="input-field"
                      placeholder={variable.defaultValue}
                    />
                  )}
                  {variable.type === 'array' && (
                    <textarea
                      value={JSON.stringify(inputValues[variable.name] || [])}
                      onChange={(e) => {
                        try {
                          setInputValues({ ...inputValues, [variable.name]: JSON.parse(e.target.value) });
                        } catch (e) {
                          // 忽略JSON解析错误
                        }
                      }}
                      className="input-field font-mono text-sm"
                      rows={3}
                      placeholder='["item1", "item2"]'
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 运行按钮 */}
          <div className="flex justify-center">
            <button
              onClick={handleRunTest}
              disabled={isRunning}
              className="btn-primary flex items-center space-x-2 px-8 py-3"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>运行中...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>运行测试</span>
                </>
              )}
            </button>
          </div>

          {/* 测试结果 */}
          {testResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {testResult.success ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <p className="font-semibold text-green-900">
                      {testResult.success ? '测试成功' : '测试失败'}
                    </p>
                    <p className="text-sm text-green-700">
                      耗时: {testResult.duration.toFixed(2)}s | 
                      Tokens: {testResult.tokens.total.toLocaleString()} | 
                      成本: ${testResult.cost.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">输出结果</label>
                <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                    {testResult.output}
                  </pre>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 mb-1">输入Tokens</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {testResult.tokens.input.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-700 mb-1">输出Tokens</p>
                  <p className="text-lg font-semibold text-purple-900">
                    {testResult.tokens.output.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-700 mb-1">总成本</p>
                  <p className="text-lg font-semibold text-green-900">
                    ${testResult.cost.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <div className="flex justify-end space-x-3">
            <button onClick={onClose} className="btn-secondary">
              关闭
            </button>
            {testResult && (
              <button className="btn-primary">
                保存结果
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
