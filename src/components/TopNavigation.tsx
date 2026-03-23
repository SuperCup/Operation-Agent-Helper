import { Plus, Share2, ChevronDown, FileText, DollarSign, Settings, Activity, Target, Megaphone, BarChart3, TrendingUp, FileCheck, X, History } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { IntentType } from '@/types';

/* ─── Agent 配置列表 ─────────────────────────── */
export const AGENTS = [
  { id: 'category_insight' as IntentType, name: '品类洞察',  icon: TrendingUp, iconColor: 'text-blue-500' },
  { id: 'operation_plan'   as IntentType, name: '运营方案',  icon: FileText,   iconColor: 'text-emerald-500' },
  { id: 'merchant_guide'   as IntentType, name: '招商指引',  icon: FileCheck,  iconColor: 'text-violet-500' },
  { id: 'budget_split'     as IntentType, name: '预算拆分',  icon: DollarSign, iconColor: 'text-amber-500' },
  { id: 'activity_config'  as IntentType, name: '活动配置',  icon: Settings,   iconColor: 'text-rose-500' },
  { id: 'activity_ops'     as IntentType, name: '活动运营',  icon: Activity,   iconColor: 'text-cyan-500' },
  { id: 'rtb_plan'         as IntentType, name: 'RTB方案',   icon: Target,     iconColor: 'text-indigo-500' },
  { id: 'rtb_config'       as IntentType, name: 'RTB配置',   icon: Megaphone,  iconColor: 'text-pink-500' },
  { id: 'rtb_ops'          as IntentType, name: 'RTB运营',   icon: BarChart3,  iconColor: 'text-orange-500' },
  { id: 'review_report'    as IntentType, name: '复盘报告',  icon: FileCheck,  iconColor: 'text-teal-500' },
] as const;

const MAX_INLINE = 6;

/* ─── 确认新建会话对话框 ───────────────────────── */
interface ConfirmNewSessionProps {
  agentName: string;
  onConfirm: () => void;
  onCancel: () => void;
}
function ConfirmNewSessionDialog({ agentName, onConfirm, onCancel }: ConfirmNewSessionProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/25" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl w-80 p-5 z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-800">新建「{agentName}」会话</span>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          将创建一个新的「{agentName}」专属对话，并引导您填写必要信息。
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-xs text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── 新建/恢复会话 Modal ───────────────────────── */
interface NewSessionModalProps {
  onClose: () => void;
  onSelectAgent: (intent: IntentType) => void;
  onContinueLast: () => void;
  lastSessionTitle?: string;
}
function NewSessionModal({ onClose, onSelectAgent, onContinueLast, lastSessionTitle }: NewSessionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-[540px] max-w-[95vw] p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm font-semibold text-gray-800">选择 Agent，开始新对话</span>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            return (
              <button
                key={agent.id}
                onClick={() => { onSelectAgent(agent.id); }}
                className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg border border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm transition-all duration-150 text-center"
              >
                <Icon className={`w-5 h-5 ${agent.iconColor}`} />
                <span className="text-[11px] font-medium text-gray-700 leading-tight">{agent.name}</span>
              </button>
            );
          })}
        </div>
        {lastSessionTitle && (
          <button
            onClick={() => { onContinueLast(); onClose(); }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-400 transition-all text-left"
          >
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-700">继续上次会话</p>
                <p className="text-[11px] text-gray-500 truncate max-w-[360px]">{lastSessionTitle}</p>
              </div>
            </div>
            <span className="text-[11px] text-gray-400 flex-shrink-0">恢复 →</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── 主导航栏 ────────────────────────────────── */
export default function TopNavigation() {
  const {
    currentSession,
    archivedSessions,
    createNewSession,
    archiveSession,
    restoreSession,
    updateSession,
    setActiveIntent,
    setPendingAgentIntent,
  } = useStore();

  const [showBrandMenu, setShowBrandMenu]   = useState(false);
  const [showMoreMenu, setShowMoreMenu]     = useState(false);
  const [showNewModal, setShowNewModal]     = useState(false);
  const [currentBrand, setCurrentBrand]     = useState('达能');
  // 等待确认的 Agent（inline 确认框）
  const [confirmAgent, setConfirmAgent]     = useState<{ id: IntentType; name: string } | null>(null);

  const brands = ['达能', '嘉士伯', '康师傅', '汉高', '海天', '百威'];
  const inlineAgents = AGENTS.slice(0, MAX_INLINE);
  const moreAgents   = AGENTS.slice(MAX_INLINE);

  /** 真正创建新 Agent 会话并触发前置表单 */
  const applyAgent = (intent: IntentType) => {
    const label = AGENTS.find(a => a.id === intent)?.name ?? '新会话';
    if (currentSession && currentSession.messages && currentSession.messages.length > 0) {
      archiveSession(currentSession.title || label);
    }
    setActiveIntent(intent);
    createNewSession();
    updateSession({
      title: label,
      identifiedIntent: intent,
      intentStatus: 'identified',
      description: label,
    });
    // 通知 ChatBox 自动弹出前置表单
    setPendingAgentIntent(intent);
  };

  /** 导航栏 Agent 按钮点击 → 先弹确认框 */
  const handleAgentClick = (intent: IntentType, name: string) => {
    setShowMoreMenu(false);
    setConfirmAgent({ id: intent, name });
  };

  /** 确认新建 */
  const handleConfirmCreate = () => {
    if (!confirmAgent) return;
    applyAgent(confirmAgent.id);
    setConfirmAgent(null);
  };

  /** 继续最近归档会话 */
  const handleContinueLast = () => {
    if (archivedSessions.length === 0) return;
    const last = archivedSessions[0];
    if (currentSession && currentSession.messages && currentSession.messages.length > 0) {
      archiveSession(currentSession.title || '未命名会话');
    }
    restoreSession(last.id);
    const intent = last.identifiedIntent ?? (last.currentTask?.type as IntentType | undefined) ?? null;
    if (intent) setActiveIntent(intent);
  };

  const handleBrandChange = (brand: string) => {
    setCurrentBrand(brand);
    setShowBrandMenu(false);
  };

  return (
    <>
      <div className="h-12 flex-shrink-0 border-b border-gray-200 bg-white flex items-center px-4 gap-3">

        {/* 左侧：Logo + 标题 */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="w-7 h-7 bg-gray-900 rounded flex items-center justify-center">
            <span className="text-white font-medium text-xs">AI</span>
          </div>
          <h1 className="text-sm font-medium text-gray-800 whitespace-nowrap">即时零售运营AI Agent</h1>
        </div>

        {/* 分隔线 */}
        <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

        {/* 中间：Agent 快捷入口（前 MAX_INLINE 个直接显示，无选中态） */}
        <div className="flex items-center gap-1 flex-1 overflow-hidden">
          {inlineAgents.map((agent) => {
            const Icon = agent.icon;
            return (
              <button
                key={agent.id}
                onClick={() => handleAgentClick(agent.id, agent.name)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs whitespace-nowrap text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-150 flex-shrink-0"
              >
                <Icon className={`w-3.5 h-3.5 ${agent.iconColor}`} />
                {agent.name}
              </button>
            );
          })}

          {/* 更多下拉 */}
          {moreAgents.length > 0 && (
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowMoreMenu(v => !v)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-gray-500 hover:bg-gray-100 transition-colors"
              >
                更多
                <ChevronDown className="w-3 h-3" />
              </button>
              {showMoreMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMoreMenu(false)} />
                  <div className="absolute left-0 top-full mt-1 min-w-[120px] bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                    {moreAgents.map((agent) => {
                      const Icon = agent.icon;
                      return (
                        <button
                          key={agent.id}
                          onClick={() => handleAgentClick(agent.id, agent.name)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <Icon className={`w-3.5 h-3.5 ${agent.iconColor}`} />
                          {agent.name}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 右侧 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* 创建新对话 → Modal */}
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-gray-900 text-white rounded text-xs font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>创建新对话</span>
          </button>

          {/* 分享 */}
          <button className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors">
            <Share2 className="w-3.5 h-3.5" />
            <span>分享</span>
          </button>

          {/* 品牌切换 */}
          <div className="relative">
            <button
              onClick={() => setShowBrandMenu(!showBrandMenu)}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span>{currentBrand}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showBrandMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowBrandMenu(false)} />
                <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => handleBrandChange(brand)}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${
                        currentBrand === brand ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-600'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 用户头像 */}
          <div className="pl-2 border-l border-gray-200">
            <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
              宇
            </div>
          </div>
        </div>
      </div>

      {/* 内联确认框：是否新建 XX 会话 */}
      {confirmAgent && (
        <ConfirmNewSessionDialog
          agentName={confirmAgent.name}
          onConfirm={handleConfirmCreate}
          onCancel={() => setConfirmAgent(null)}
        />
      )}

      {/* 新建/恢复 Modal */}
      {showNewModal && (
        <NewSessionModal
          onClose={() => setShowNewModal(false)}
          onSelectAgent={(intent) => {
            setShowNewModal(false);
            applyAgent(intent);
          }}
          onContinueLast={() => {
            setShowNewModal(false);
            handleContinueLast();
          }}
          lastSessionTitle={archivedSessions.length > 0 ? archivedSessions[0].title || '未命名会话' : undefined}
        />
      )}
    </>
  );
}
