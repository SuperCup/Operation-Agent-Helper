import { useStore } from '@/store/useStore';
import clsx from 'clsx';
import { ConversationSession } from '@/types';

/* ─── Agent 标签配置 ─────────────────────────── */
const INTENT_LABEL: Record<string, { label: string; color: string }> = {
  category_insight: { label: '品类洞察', color: 'bg-blue-50 text-blue-600' },
  operation_plan:   { label: '运营方案', color: 'bg-emerald-50 text-emerald-600' },
  merchant_guide:   { label: '招商指引', color: 'bg-violet-50 text-violet-600' },
  budget_split:     { label: '预算拆分', color: 'bg-amber-50 text-amber-600' },
  activity_config:  { label: '活动配置', color: 'bg-rose-50 text-rose-600' },
  activity_ops:     { label: '活动运营', color: 'bg-cyan-50 text-cyan-600' },
  rtb_plan:         { label: 'RTB方案',  color: 'bg-indigo-50 text-indigo-600' },
  rtb_config:       { label: 'RTB配置',  color: 'bg-pink-50 text-pink-600' },
  rtb_ops:          { label: 'RTB运营',  color: 'bg-orange-50 text-orange-600' },
  review_report:    { label: '复盘报告', color: 'bg-teal-50 text-teal-600' },
};

/* ─── 工具函数 ───────────────────────────────── */
function getAgentTag(session: ConversationSession | null) {
  if (!session) return null;
  const key = session.identifiedIntent ?? session.currentTask?.type;
  return key ? (INTENT_LABEL[key] ?? null) : null;
}

/** 从 session 消息中提取标题（优先取 session.title，否则取第一条用户消息） */
function getSessionTitle(session: ConversationSession): string {
  if (session.title && session.title.trim()) return session.title;
  const firstUser = session.messages?.find(m => m.type === 'user');
  if (firstUser?.content) {
    return firstUser.content.length > 24
      ? firstUser.content.slice(0, 24) + '…'
      : firstUser.content;
  }
  return '未命名会话';
}

/** 格式化相对时间 */
function formatTime(date: Date | undefined): string {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  const now = Date.now();
  const diff = now - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1)  return '刚刚';
  if (min < 60) return `${min} 分钟前`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} 小时前`;
  const day = Math.floor(hour / 24);
  if (day === 1) {
    return `昨天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const dd = d.getDate().toString().padStart(2, '0');
  return `${mm}-${dd}`;
}

/* ─── 历史会话 Cell ──────────────────────────── */
interface SessionCellProps {
  session: ConversationSession;
  isActive?: boolean;
  isCurrent?: boolean;
  onClick?: () => void;
}

function SessionCell({ session, isActive, isCurrent, onClick }: SessionCellProps) {
  const title = getSessionTitle(session);
  const tag   = getAgentTag(session);
  const time  = formatTime(session.updatedAt ?? session.archivedAt ?? session.createdAt);

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full px-3 py-2.5 text-left rounded-lg transition-all',
        isActive || isCurrent
          ? 'bg-white shadow-sm border border-gray-200/80'
          : 'hover:bg-white/70',
      )}
    >
      {/* 标题行 */}
      <p className="text-[13px] font-medium text-gray-800 truncate leading-snug">
        {title}
      </p>

      {/* 时间 + 标签 */}
      <div className="flex items-center justify-between mt-1 gap-2">
        <span className="text-[11px] text-gray-400 flex-shrink-0">{time}</span>
        {tag && (
          <span className={clsx('text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0', tag.color)}>
            {tag.label}
          </span>
        )}
      </div>
    </button>
  );
}

/* ─── 主组件 ─────────────────────────────────── */
export default function HistoryTaskList() {
  const { archivedSessions, currentSession, restoreSession } = useStore();

  return (
    <div className="h-full flex flex-col">
      {/* 标题栏 */}
      <div className="flex-shrink-0 h-12 px-4 border-b border-gray-200/60 bg-white/50 flex items-center">
        <h2 className="text-sm font-medium text-gray-700">历史对话</h2>
      </div>

      {/* 当前会话（置顶，不可点击跳转） */}
      {currentSession && !currentSession.archivedAt && (
        <div className="px-3 pt-3 pb-1">
          <SessionCell session={currentSession} isCurrent />
        </div>
      )}

      {/* 历史归档列表 */}
      <div className="flex-1 overflow-y-auto px-3 pt-2 pb-3">
        {archivedSessions.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-400">暂无历史对话</p>
        ) : (
          <div className="space-y-1">
            {archivedSessions.map((session) => {
              const isActive = session.id === currentSession?.id;
              return (
                <SessionCell
                  key={session.id}
                  session={session}
                  isActive={isActive}
                  onClick={() => {
                    if (!isActive) restoreSession(session.id);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
