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
  Clock,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useState, useEffect } from 'react';

const phaseLabels: Record<string, string> = {
  preparation: '项目准备',
  planning: '项目启动',
  execution: '项目执行',
  monitoring: '效果监控',
  completion: '项目结案',
};

const phaseDescriptions: Record<string, string> = {
  preparation: '分析市场，制定运营方案',
  planning: '制定详细执行计划',
  execution: '生成提报表，提交平台',
  monitoring: '数据收集，效果评估',
  completion: '生成结案报告',
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, workflows, documents } = useStore();
  
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

  const handleStartWorkflow = () => {
    const workflow = projectWorkflows.find(w => w.phase === project.phase);
    if (workflow) {
      navigate(`/workflow/${workflow.id}`);
    } else {
      // 创建新工作流
      const newWorkflow = {
        id: `wf-${Date.now()}`,
        projectId: project.id,
        phase: project.phase,
        name: `${phaseLabels[project.phase]}工作流`,
        status: 'idle' as const,
        steps: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      // 这里简化处理，实际应该通过 store 添加
      navigate(`/workflow/${newWorkflow.id}`);
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
          <div className="flex space-x-3">
            <button className="btn-secondary flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>编辑</span>
            </button>
            <button 
              onClick={handleStartWorkflow}
              className="btn-primary flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>启动AI工作流</span>
            </button>
          </div>
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

      {/* 项目阶段进度 */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">项目进度</h2>
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
          <div className="relative flex justify-between">
            {Object.entries(phaseLabels).map(([phase, label], index) => {
              const isCompleted = Object.keys(phaseLabels).indexOf(project.phase) > index;
              const isCurrent = project.phase === phase;
              
              return (
                <div key={phase} className="flex flex-col items-center" style={{ width: '20%' }}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                    isCurrent ? 'bg-primary-600 text-white' :
                    isCompleted ? 'bg-green-500 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <p className={`text-sm font-medium text-center ${
                    isCurrent ? 'text-primary-600' : 'text-gray-600'
                  }`}>
                    {label}
                  </p>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {phaseDescriptions[phase]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 工作流历史 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">工作流历史</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          
          {projectWorkflows.length > 0 ? (
            <div className="space-y-3">
              {projectWorkflows.map((workflow) => (
                <Link
                  key={workflow.id}
                  to={`/workflow/${workflow.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{workflow.name}</p>
                    <span className={`badge ${
                      workflow.status === 'running' ? 'bg-blue-100 text-blue-800' :
                      workflow.status === 'completed' ? 'bg-green-100 text-green-800' :
                      workflow.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {workflow.status === 'running' ? '运行中' :
                       workflow.status === 'completed' ? '已完成' :
                       workflow.status === 'failed' ? '失败' : '待启动'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {format(workflow.createdAt, 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>暂无工作流记录</p>
              <button
                onClick={handleStartWorkflow}
                className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                启动第一个工作流
              </button>
            </div>
          )}
        </div>

        {/* 相关文档 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">相关文档</h2>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          
          {projectDocuments.length > 0 ? (
            <div className="space-y-3">
              {projectDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{doc.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        v{doc.version} · {format(doc.updatedAt, 'yyyy-MM-dd', { locale: zhCN })}
                      </p>
                    </div>
                    <span className={`badge ${
                      doc.createdBy === 'ai' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {doc.createdBy === 'ai' ? 'AI生成' : '人工创建'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>暂无相关文档</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
