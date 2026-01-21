import { useState } from 'react';
import { Bot, Settings, FileCode, Workflow as WorkflowIcon, FlaskConical } from 'lucide-react';
import ModelsTab from '@/components/agent/ModelsTab';
import AgentConfigTab from '@/components/agent/AgentConfigTab';
import PromptsTab from '@/components/agent/PromptsTab';
import WorkflowTemplatesTab from '@/components/agent/WorkflowTemplatesTab';
import DebugCenterTab from '@/components/agent/DebugCenterTab';
import clsx from 'clsx';

type TabType = 'models' | 'agents' | 'prompts' | 'workflows' | 'debug';

const tabs = [
  { id: 'models' as TabType, name: 'AI模型', icon: Bot, description: '管理可用的AI模型' },
  { id: 'agents' as TabType, name: '智能体配置', icon: Settings, description: '配置智能体行为、发布状态与参数' },
  { id: 'prompts' as TabType, name: '提示词库', icon: FileCode, description: '管理和调试提示词模板' },
  { id: 'workflows' as TabType, name: '工作流模板', icon: WorkflowIcon, description: '管理工作流模板' },
  { id: 'debug' as TabType, name: '调试中心', icon: FlaskConical, description: '对智能体进行调试并查看调试记录' },
];

export default function AgentManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('models');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'models':
        return <ModelsTab />;
      case 'agents':
        return <AgentConfigTab />;
      case 'prompts':
        return <PromptsTab />;
      case 'workflows':
        return <WorkflowTemplatesTab />;
      case 'debug':
        return <DebugCenterTab />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI配置中心</h1>
        <p className="text-gray-600 mt-1">集中管理模型、智能体、提示词、工作流与调试发布</p>
      </div>

      {/* 标签页导航 */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          <div className="mb-4">
            {tabs.map((tab) => (
              activeTab === tab.id && (
                <p key={tab.id} className="text-sm text-gray-600">{tab.description}</p>
              )
            ))}
          </div>
          
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
