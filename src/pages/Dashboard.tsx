import { useStore } from '@/store/useStore';
import { 
  Zap,
  ListTodo,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AIChatBox from '@/components/AIChatBox';
import TaskList from '@/components/TaskList';
import { useEffect } from 'react';

export default function Dashboard() {
  const { projects, addTask } = useStore();
  
  const activeProjects = projects.filter(p => p.status === 'active');

  // 模拟添加初始任务（演示用）
  useEffect(() => {
    const hasInitialTask = useStore.getState().backgroundTasks.length > 0;
    if (!hasInitialTask) {
      // 添加一个示例任务
      setTimeout(() => {
        addTask({
          id: 'task-demo-1',
          title: '春节大促运营方案生成',
          description: '正在分析市场环境，生成完整的运营方案...',
          type: 'generation',
          status: 'running',
          progress: 65,
          createdAt: new Date(),
          projectId: 'proj-1',
        });
      }, 1000);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">工作台</h1>
        <p className="text-gray-600 mt-1">通过AI对话完成运营工作，实时查看任务执行状态</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI对话区域 - 占2列 */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="card p-0 flex-1">
            <div className="h-full flex flex-col" style={{ minHeight: '700px' }}>
              {/* 标题栏 */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-purple-50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  小琳
                  <span className="ml-2 text-sm text-gray-500 font-normal">您的运营助手</span>
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">在线</span>
                </h2>
                <p className="text-sm text-gray-600 mt-1 ml-11">
                  描述需求或上传文件，我将为您完成运营工作
                </p>
              </div>

              {/* 对话区域 */}
              <div className="flex-1 min-h-0">
                <AIChatBox />
              </div>
            </div>
          </div>
        </div>

        {/* 右侧区域 */}
        <div className="flex flex-col">
          {/* 进行中的任务 */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ListTodo className="w-5 h-5 mr-2 text-primary-600" />
                进行中的任务
              </h2>
              <span className="text-xs text-gray-500">实时更新</span>
            </div>
            <TaskList />
          </div>

          {/* 活跃项目 - 撑满剩余空间 */}
          <div className="card flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                活跃项目
              </h2>
              <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700">
                查看全部
              </Link>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {activeProjects.slice(0, 3).map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className="font-medium text-gray-900 text-sm truncate">{project.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">{project.brand}</p>
                    <span className={`badge text-xs ${
                      project.phase === 'execution' ? 'bg-green-100 text-green-800' :
                      project.phase === 'planning' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.phase === 'execution' ? '执行中' :
                       project.phase === 'planning' ? '计划中' : '准备中'}
                    </span>
                  </div>
                </Link>
              ))}
              {activeProjects.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm">
                  <p>暂无活跃项目</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 使用提示 - 横跨两侧 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">💡 使用提示</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-gray-700">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>在对话框中描述需求，AI会自动创建任务并在后台执行</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>支持上传文件、图片作为参考资料，提升方案质量</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>多个任务可以并行执行，互不影响，提高工作效率</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>任务完成后结果会自动在对话中展示，可查看详情</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
