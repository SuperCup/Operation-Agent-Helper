import { FileText, DollarSign, Settings, Activity, Target, Megaphone, BarChart3, TrendingUp, FileCheck } from 'lucide-react';
import { IntentType } from '@/types';

interface Capability {
  id: IntentType | string;
  name: string;
  icon: typeof FileText;
  bgColor: string;
  iconColor: string;
}

const capabilities: Capability[] = [
  {
    id: 'category_insight',
    name: '品类洞察',
    icon: TrendingUp,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-400',
  },
  {
    id: 'operation_plan',
    name: '运营方案',
    icon: FileText,
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-400',
  },
  {
    id: 'merchant_guide',
    name: '招商指引',
    icon: FileCheck,
    bgColor: 'bg-violet-50',
    iconColor: 'text-violet-400',
  },
  {
    id: 'budget_split',
    name: '预算拆分',
    icon: DollarSign,
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-400',
  },
  {
    id: 'activity_config',
    name: '活动配置',
    icon: Settings,
    bgColor: 'bg-rose-50',
    iconColor: 'text-rose-400',
  },
  {
    id: 'activity_ops',
    name: '活动运营',
    icon: Activity,
    bgColor: 'bg-cyan-50',
    iconColor: 'text-cyan-400',
  },
  {
    id: 'rtb_plan',
    name: 'RTB方案',
    icon: Target,
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-400',
  },
  {
    id: 'rtb_config',
    name: 'RTB配置',
    icon: Megaphone,
    bgColor: 'bg-pink-50',
    iconColor: 'text-pink-400',
  },
  {
    id: 'rtb_ops',
    name: 'RTB运营',
    icon: BarChart3,
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-400',
  },
  {
    id: 'review_report',
    name: '复盘报告',
    icon: FileCheck,
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-400',
  },
];

interface Props {
  onSelect: (capabilityId: IntentType | string) => void;
}

export default function CapabilityCards({ onSelect }: Props) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {capabilities.map((capability) => {
        const Icon = capability.icon;
        return (
          <button
            key={capability.id}
            onClick={() => onSelect(capability.id)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all duration-200 flex-shrink-0"
          >
            {/* 图标 */}
            <Icon className={`w-4 h-4 ${capability.iconColor}`} />
            
            {/* 标题 */}
            <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
              {capability.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
