import { useStore } from '@/store/useStore';
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Calendar,
  ArrowRight,
  Activity,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockMetrics } from '@/data/mockData';

export default function Dashboard() {
  const { projects, workflows } = useStore();
  
  const activeProjects = projects.filter(p => p.status === 'active');
  const runningWorkflows = workflows.filter(w => w.status === 'running');
  
  // 计算今日数据
  const todayMetrics = mockMetrics[mockMetrics.length - 1];
  
  const stats = [
    {
      name: '今日GMV',
      value: `¥${(todayMetrics.gmv / 1000).toFixed(1)}K`,
      change: '+12.5%',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: '今日订单',
      value: todayMetrics.orders.toLocaleString(),
      change: '+8.3%',
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      name: '投资回报率',
      value: todayMetrics.roi.toFixed(2),
      change: '+5.2%',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      name: '活动转化率',
      value: `${todayMetrics.cvr.toFixed(1)}%`,
      change: '+2.1%',
      icon: Target,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">工作台</h1>
        <p className="text-gray-600 mt-1">欢迎回来，这是您的运营概览</p>
      </div>

      {/* 数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 快速操作 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">快速操作</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/projects?action=new"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200">
                <Zap className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">创建新项目</p>
                <p className="text-sm text-gray-500">快速启动运营项目</p>
              </div>
            </div>
          </Link>

          <Link
            to="/knowledge"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">浏览知识库</p>
                <p className="text-sm text-gray-500">查看成功案例</p>
              </div>
            </div>
          </Link>

          <Link
            to="/analytics"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">查看数据</p>
                <p className="text-sm text-gray-500">效果评估分析</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 进行中的项目 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">进行中的项目</h2>
            <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
              查看全部
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {activeProjects.slice(0, 3).map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{project.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{project.brand} · {project.platform}</p>
                  </div>
                  <div className="ml-4">
                    <span className={`badge ${
                      project.phase === 'execution' ? 'bg-green-100 text-green-800' :
                      project.phase === 'planning' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.phase === 'execution' ? '执行中' :
                       project.phase === 'planning' ? '计划中' :
                       project.phase === 'monitoring' ? '监控中' :
                       project.phase === 'completion' ? '已完成' : '准备中'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            {activeProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>暂无进行中的项目</p>
              </div>
            )}
          </div>
        </div>

        {/* 运行中的工作流 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">AI 工作流</h2>
            <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
              查看全部
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {runningWorkflows.map((workflow) => {
              const project = projects.find(p => p.id === workflow.projectId);
              const completedSteps = workflow.steps.filter(s => s.status === 'success').length;
              const progress = (completedSteps / workflow.steps.length) * 100;
              
              return (
                <Link
                  key={workflow.id}
                  to={`/workflow/${workflow.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{workflow.name}</p>
                    <span className="text-sm text-gray-500">
                      {completedSteps}/{workflow.steps.length}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{project?.name}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </Link>
              );
            })}
            {runningWorkflows.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>暂无运行中的工作流</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
