import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { 
  ArrowLeft, 
  Play, 
  Edit,
  Calendar,
  DollarSign,
  Target,
  FileText,
  Activity,
  TrendingUp,
  Settings,
  Megaphone,
  BarChart3,
  CheckCircle2,
  Plus,
  Eye,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

type ModuleType = 'plan' | 'budget' | 'activity_config' | 'activity_ops' | 'rtb_plan' | 'rtb_config' | 'rtb_ops';

const modules = [
  { 
    id: 'plan' as ModuleType, 
    name: '方案生成', 
    icon: FileText,
    color: 'bg-blue-500',
    description: 'AI生成运营方案'
  },
  { 
    id: 'budget' as ModuleType, 
    name: '预算拆解', 
    icon: DollarSign,
    color: 'bg-green-500',
    description: '智能预算分配'
  },
  { 
    id: 'activity_config' as ModuleType, 
    name: '活动配置', 
    icon: Settings,
    color: 'bg-purple-500',
    description: '活动参数设置'
  },
  { 
    id: 'activity_ops' as ModuleType, 
    name: '活动运营', 
    icon: Activity,
    color: 'bg-orange-500',
    description: '活动执行监控'
  },
  { 
    id: 'rtb_plan' as ModuleType, 
    name: 'RTB方案', 
    icon: Target,
    color: 'bg-pink-500',
    description: '竞价广告策略'
  },
  { 
    id: 'rtb_config' as ModuleType, 
    name: 'RTB配置', 
    icon: Megaphone,
    color: 'bg-cyan-500',
    description: '广告计划配置'
  },
  { 
    id: 'rtb_ops' as ModuleType, 
    name: 'RTB运营', 
    icon: BarChart3,
    color: 'bg-indigo-500',
    description: '广告执行分析'
  },
];

const phaseLabels: Record<string, string> = {
  preparation: '项目准备',
  planning: '项目启动',
  execution: '项目执行',
  monitoring: '效果监控',
  completion: '项目结案',
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, workflows, documents } = useStore();
  const [activeModule, setActiveModule] = useState<ModuleType>('plan');
  
  const project = projects.find(p => p.id === id);
  const projectWorkflows = workflows.filter(w => w.projectId === id);
  const projectDocuments = documents.filter(d => d.projectId === id);

  useEffect(() => {
    if (project) {
      useStore.getState().setCurrentProject(project);
    }
    return () => {
      useStore.getState().setCurrentProject(null);
    };
  }, [project]);

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">项目不存在</p>
        <Link to="/projects" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          返回项目列表
        </Link>
      </div>
    );
  }

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'plan':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">运营方案</h3>
              <button className="btn-primary flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>生成新方案</span>
              </button>
            </div>

            {/* 已生成的方案 */}
            <div className="space-y-3">
              {projectDocuments.filter(d => d.type === 'operation_plan').map((doc) => (
                <div key={doc.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{doc.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        v{doc.version} · {format(doc.updatedAt, 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                      </p>
                      <div className="flex items-center space-x-3 mt-2 text-sm">
                        <span className="text-green-600">预期ROI: 3.5</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-blue-600">目标GMV: ¥80万</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-white rounded-lg">
                        <Eye className="w-5 h-5 text-gray-600" />
                      </button>
                      <span className={`badge ${
                        doc.createdBy === 'ai' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {doc.createdBy === 'ai' ? 'AI生成' : '人工创建'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI服务功能 */}
            <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">AI可以为您：</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                  分析品类和竞品，生成市场洞察
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                  从知识库中检索相似成功案例
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                  提出3-5个具体运营策略方案
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                  预估ROI和效果，给出预算建议
                </li>
              </ul>
            </div>
          </div>
        );

      case 'budget':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">预算分配</h3>
              <button className="btn-primary flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>优化预算</span>
              </button>
            </div>

            {/* 当前预算分配 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">总预算</p>
                <p className="text-2xl font-bold text-gray-900">¥{(project.budget! / 10000).toFixed(0)}万</p>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">活动预算</span>
                    <span className="font-medium">¥20万 (40%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">广告预算</span>
                    <span className="font-medium">¥30万 (60%)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">已使用</p>
                <p className="text-2xl font-bold text-gray-900">¥8.8万</p>
                <p className="text-sm text-blue-600 mt-1">17.6% 使用率</p>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '17.6%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* 预算优化建议 */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-semibold text-amber-900 mb-3">💡 AI优化建议</h4>
              <ul className="space-y-2 text-sm text-amber-800">
                <li>• 周末转化率提升30%，建议周末增加预算配置</li>
                <li>• 晚上8-10点时段表现最佳，可加大该时段投放</li>
                <li>• 搜索广告ROI最高，建议增加10%预算</li>
              </ul>
            </div>
          </div>
        );

      case 'rtb_config':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">RTB广告配置</h3>
              <button className="btn-primary flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>生成新计划</span>
              </button>
            </div>

            {/* 历史提报表 */}
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">品牌曝光计划</h4>
                    <p className="text-sm text-gray-500 mt-1">开屏广告 · 日预算¥10,000</p>
                  </div>
                  <span className="badge bg-green-100 text-green-800">已提交</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">投放时段</p>
                    <p className="font-medium">全天</p>
                  </div>
                  <div>
                    <p className="text-gray-600">出价</p>
                    <p className="font-medium">¥12/CPM</p>
                  </div>
                  <div>
                    <p className="text-gray-600">目标人群</p>
                    <p className="font-medium">25-35岁</p>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button className="text-sm text-primary-600 hover:text-primary-700">查看详情</button>
                  <span className="text-gray-300">|</span>
                  <button className="text-sm text-gray-600 hover:text-gray-700">复制计划</button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">搜索推广计划</h4>
                    <p className="text-sm text-gray-500 mt-1">关键词竞价 · 日预算¥8,000</p>
                  </div>
                  <span className="badge bg-yellow-100 text-yellow-800">待审核</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">关键词数</p>
                    <p className="font-medium">25个</p>
                  </div>
                  <div>
                    <p className="text-gray-600">平均出价</p>
                    <p className="font-medium">¥2.5/点击</p>
                  </div>
                  <div>
                    <p className="text-gray-600">匹配方式</p>
                    <p className="font-medium">精确+广泛</p>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                    <Send className="w-3 h-3 mr-1" />
                    提交审核
                  </button>
                  <span className="text-gray-300">|</span>
                  <button className="text-sm text-gray-600 hover:text-gray-700">编辑计划</button>
                </div>
              </div>
            </div>

            {/* AI服务功能 */}
            <div className="mt-6 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">AI可以为您：</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                  根据目标自动生成广告计划
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                  智能推荐关键词和出价策略
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                  一键生成平台提报表格
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                  自动提交到投放平台
                </li>
              </ul>
            </div>
          </div>
        );

      case 'rtb_ops':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">RTB运营分析</h3>
              <button className="btn-primary flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>生成报表</span>
              </button>
            </div>

            {/* 历史报表 */}
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">本周运营周报</h4>
                  <span className="text-xs text-gray-500">2026-01-20</span>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-600">曝光量</p>
                    <p className="text-lg font-bold text-gray-900">185K</p>
                    <p className="text-xs text-green-600">↑ 12%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">点击率</p>
                    <p className="text-lg font-bold text-gray-900">8.4%</p>
                    <p className="text-xs text-green-600">↑ 1.2%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">转化率</p>
                    <p className="text-lg font-bold text-gray-900">6.3%</p>
                    <p className="text-xs text-green-600">↑ 0.5%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">ROI</p>
                    <p className="text-lg font-bold text-gray-900">4.82</p>
                    <p className="text-xs text-green-600">↑ 0.3</p>
                  </div>
                </div>
                <button className="text-sm text-primary-600 hover:text-primary-700">查看完整报告</button>
              </div>

              <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">🎯 AI优化建议</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• 搜索广告表现优异，建议增加20%预算</li>
                  <li>• 推荐位CTR偏低，建议优化创意素材</li>
                  <li>• 晚间时段ROI最高，可调整时段系数</li>
                  <li>• 关键词"饮料促销"表现突出，可加大出价</li>
                </ul>
                <button className="mt-3 text-sm text-primary-600 hover:text-primary-700 flex items-center">
                  <Play className="w-3 h-3 mr-1" />
                  应用优化建议
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12 text-gray-500">
            <p>该模块功能开发中...</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div>
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回项目列表
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-2">{project.description}</p>
          </div>
          <button className="btn-secondary flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>编辑</span>
          </button>
        </div>
      </div>

      {/* 项目信息卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">当前阶段</p>
              <p className="font-semibold text-gray-900">{phaseLabels[project.phase]}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">预算</p>
              <p className="font-semibold text-gray-900">
                {project.budget ? `¥${(project.budget / 10000).toFixed(1)}万` : '未设置'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">开始日期</p>
              <p className="font-semibold text-gray-900">
                {project.startDate ? format(project.startDate, 'MM/dd', { locale: zhCN }) : '未设置'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">项目状态</p>
              <p className="font-semibold text-gray-900">
                {project.status === 'active' ? '进行中' :
                 project.status === 'draft' ? '草稿' :
                 project.status === 'completed' ? '已完成' : '暂停'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 项目助手 - 模块化功能 */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">项目助手</h2>
        
        {/* 模块选择 */}
        <div className="grid grid-cols-7 gap-3 mb-6">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={clsx(
                'p-4 rounded-lg border-2 transition-all',
                activeModule === module.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className={`w-10 h-10 ${module.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                <module.icon className="w-5 h-5 text-white" />
              </div>
              <p className={`text-sm font-medium text-center ${
                activeModule === module.id ? 'text-primary-700' : 'text-gray-700'
              }`}>
                {module.name}
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">{module.description}</p>
            </button>
          ))}
        </div>

        {/* 模块内容 */}
        <div className="border-t border-gray-200 pt-6">
          {renderModuleContent()}
        </div>
      </div>
    </div>
  );
}
