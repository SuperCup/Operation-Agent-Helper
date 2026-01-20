import { useState } from 'react';
import { Bot, Settings, FileCode, Workflow as WorkflowIcon } from 'lucide-react';
import ModelsTab from '@/components/agent/ModelsTab';
import AgentConfigTab from '@/components/agent/AgentConfigTab';
import PromptsTab from '@/components/agent/PromptsTab';
import WorkflowTemplatesTab from '@/components/agent/WorkflowTemplatesTab';
import clsx from 'clsx';

type TabType = 'models' | 'agents' | 'prompts' | 'workflows';

const tabs = [
  { id: 'models' as TabType, name: 'AI模型', icon: Bot, description: '管理可用的AI模型' },
  { id: 'agents' as TabType, name: 'Agent配置', icon: Settings, description: '配置Agent行为和参数' },
  { id: 'prompts' as TabType, name: '提示词库', icon: FileCode, description: '管理和调试提示词模板' },
  { id: 'workflows' as TabType, name: '工作流模板', icon: WorkflowIcon, description: '管理工作流模板' },
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
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agent管理</h1>
        <p className="text-gray-600 mt-1">配置和管理AI Agent的模型、提示词和工作流</p>
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
