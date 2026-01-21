import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Play, Trash2, CheckCircle2, AlertCircle, FlaskConical } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function DebugCenterTab() {
  const { agentConfigs, models, agentDebugRuns, addAgentDebugRun, clearAgentDebugRuns } = useStore();
  const [agentId, setAgentId] = useState(agentConfigs[0]?.id || '');
  const [taskKey, setTaskKey] = useState('');
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);

  const agent = useMemo(() => agentConfigs.find(a => a.id === agentId), [agentConfigs, agentId]);
  const model = useMemo(() => models.find(m => m.id === agent?.model), [models, agent?.model]);

  const taskKeys = useMemo(() => {
    if (!agent) return [];
    return Object.keys(agent.prompts.taskPrompts || {});
  }, [agent]);

  const runDebug = async () => {
    if (!agent) return;
    const tk = taskKey || taskKeys[0] || 'default';
    if (!input.trim()) {
      alert('请先输入调试内容（例如：项目目标/预算/平台/限制条件等）');
      return;
    }

    setRunning(true);
    const start = performance.now();

    // 纯前端模拟：把系统提示词 + 任务提示词 + 用户输入拼成一次“运行结果”
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 1200));

    const output =
      `【调试输出（模拟）】\n\n` +
      `- 智能体：${agent.name}\n` +
      `- 模型：${model?.name || '未选择'}\n` +
      `- 任务：${tk}\n\n` +
      `【System Prompt】\n${agent.prompts.systemPrompt}\n\n` +
      `【Task Prompt】\n${agent.prompts.taskPrompts[tk] || '(无)'}\n\n` +
      `【User Input】\n${input}\n\n` +
      `【Next Actions（建议）】\n` +
      `1. 若缺少资料（预算/时间/平台规则/活动资源），请补齐后再发布\n` +
      `2. 可将关键约束写入System Prompt，减少跑偏\n` +
      `3. 进入“已发布”前建议至少跑3条不同场景用例`;

    const duration = (performance.now() - start) / 1000;

    addAgentDebugRun({
      id: `adr-${Date.now()}`,
      agentConfigId: agent.id,
      taskKey: tk,
      input,
      output,
      model: model?.name || '',
      duration,
      success: true,
      timestamp: new Date(),
    });

    setRunning(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 调试输入 */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <FlaskConical className="w-4 h-4 mr-2 text-primary-600" />
              智能体调试
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">选择智能体</label>
                <select
                  value={agentId}
                  onChange={(e) => {
                    setAgentId(e.target.value);
                    setTaskKey('');
                  }}
                  className="input-field text-sm"
                >
                  {agentConfigs.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}（{a.publishStatus === 'published' ? '已发布' : a.publishStatus === 'testing' ? '调试中' : '草稿'}）
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">选择任务</label>
                <select
                  value={taskKey}
                  onChange={(e) => setTaskKey(e.target.value)}
                  className="input-field text-sm"
                >
                  {taskKeys.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">输入调试样例</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="input-field font-mono text-sm"
                  rows={8}
                  placeholder={
                    '示例：\n' +
                    '- 品牌：某饮料品牌\n' +
                    '- 平台：美团\n' +
                    '- 预算：50万\n' +
                    '- 目标：春节期间GMV提升80%\n' +
                    '- 约束：库存有限/需人工确认'
                  }
                />
              </div>

              <button
                onClick={runDebug}
                disabled={running}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>{running ? '运行中…' : '运行调试'}</span>
              </button>

              <div className="text-xs text-gray-500">
                当前模型：<span className="text-gray-900 font-medium">{model?.name || '未配置'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 调试历史 */}
        <div className="lg:col-span-2">
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">调试记录</h3>
              <button
                onClick={() => clearAgentDebugRuns()}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>清空</span>
              </button>
            </div>

            {agentDebugRuns.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                暂无调试记录，左侧运行一次即可生成。
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {agentDebugRuns.map((r) => {
                  const a = agentConfigs.find(x => x.id === r.agentConfigId);
                  return (
                    <div key={r.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            {r.success ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            )}
                            <p className="font-medium text-gray-900">{a?.name || '未知智能体'}</p>
                            <span className="badge bg-white text-gray-700 border border-gray-200">
                              {r.taskKey}
                            </span>
                            {r.model && (
                              <span className="badge bg-purple-100 text-purple-800">
                                {r.model}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(r.timestamp, 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })} · {r.duration.toFixed(2)}s
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-1">输入</p>
                          <pre className="text-xs bg-white border border-gray-200 rounded p-2 whitespace-pre-wrap max-h-40 overflow-y-auto">
                            {r.input}
                          </pre>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-1">输出</p>
                          <pre className="text-xs bg-white border border-gray-200 rounded p-2 whitespace-pre-wrap max-h-40 overflow-y-auto">
                            {r.output}
                          </pre>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

