import { FileText, DollarSign, Settings, Activity, Target, Megaphone, BarChart3 } from 'lucide-react';
import { IntentType } from '@/types';
import clsx from 'clsx';

interface Capability {
  id: IntentType;
  name: string;
  icon: typeof FileText;
  description: string;
  color: string;
}

const capabilities: Capability[] = [
  {
    id: 'operation_plan',
    name: '运营方案生成',
    icon: FileText,
    description: '生成完整的运营方案，包括活动策略、执行计划、预期效果等',
    color: 'bg-blue-500',
  },
  {
    id: 'budget_split',
    name: '预算拆分',
    icon: DollarSign,
    description: '根据项目需求智能分配预算，优化资源配置',
    color: 'bg-green-500',
  },
  {
    id: 'activity_config',
    name: '活动配置',
    icon: Settings,
    description: '配置活动参数，包括活动类型、时间、规则等',
    color: 'bg-purple-500',
  },
  {
    id: 'activity_ops',
    name: '活动运营',
    icon: Activity,
    description: '监控活动执行情况，实时跟踪数据并优化',
    color: 'bg-orange-500',
  },
  {
    id: 'rtb_plan',
    name: 'RTB方案',
    icon: Target,
    description: '制定实时竞价广告策略，优化投放效果',
    color: 'bg-pink-500',
  },
  {
    id: 'rtb_config',
    name: 'RTB配置',
    icon: Megaphone,
    description: '配置广告计划，包括出价、定向、创意等',
    color: 'bg-cyan-500',
  },
  {
    id: 'rtb_ops',
    name: 'RTB运营',
    icon: BarChart3,
    description: '分析广告执行数据，提供优化建议',
    color: 'bg-indigo-500',
  },
];

interface Props {
  onSelect: (capabilityId: IntentType) => void;
}

export default function CapabilityCards({ onSelect }: Props) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-1.5">
        {capabilities.map((capability) => {
          const Icon = capability.icon;
          return (
            <button
              key={capability.id}
              onClick={() => onSelect(capability.id)}
              className="group p-2 bg-white border border-gray-200 rounded-lg hover:border-primary-400 hover:shadow-md hover:bg-gradient-to-br hover:from-primary-50 hover:to-purple-50 transition-all duration-200 text-left"
            >
              <div className="flex flex-col items-center text-center space-y-1">
                <div className={clsx('w-7 h-7 rounded-md flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow', capability.color)}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <h4 className="font-medium text-gray-900 text-[11px] leading-tight group-hover:text-primary-700 transition-colors">{capability.name}</h4>
                  <p className="text-[9px] text-gray-500 mt-0.5 leading-tight line-clamp-2">{capability.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
