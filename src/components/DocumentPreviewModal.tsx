import { X, Download, Edit } from 'lucide-react';
import { Document } from '@/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Props {
  document: Document;
  onClose: () => void;
}

export default function DocumentPreviewModal({ document, onClose }: Props) {
  const renderContent = () => {
    switch (document.type) {
      case 'operation_plan':
        return (
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">方案概述</h3>
              <p className="text-gray-700">{document.content.summary}</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">目标</h3>
              <ul className="list-disc list-inside space-y-2">
                {document.content.objectives?.map((obj: string, index: number) => (
                  <li key={index} className="text-gray-700">{obj}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">策略方案</h3>
              <div className="space-y-4">
                {document.content.strategies?.map((strategy: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{strategy.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
                    <div className="text-sm text-primary-600">
                      预期ROI: {strategy.expectedROI}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {document.content.budget && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">预算分配</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">活动预算</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ¥{(document.content.budget.activity / 10000).toFixed(1)}万
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">广告预算</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ¥{(document.content.budget.ad / 10000).toFixed(1)}万
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">总预算</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ¥{(document.content.budget.total / 10000).toFixed(1)}万
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        );

      case 'execution_plan':
        return (
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">执行时间线</h3>
              <div className="space-y-3">
                {document.content.timeline?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 w-24">
                      {format(new Date(item.date), 'MM-dd', { locale: zhCN })}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700">{item.task}</p>
                    </div>
                    <span className={`badge ${
                      item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'completed' ? '已完成' :
                       item.status === 'in_progress' ? '进行中' : '待开始'}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {document.content.activities && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">活动计划</h3>
                <div className="space-y-3">
                  {document.content.activities.map((activity: any, index: number) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">{activity.name}</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">平台：</span>
                          <span className="text-gray-900">{activity.platform}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">预算：</span>
                          <span className="text-gray-900">¥{activity.budget.toLocaleString()}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">时间：</span>
                          <span className="text-gray-900">{activity.startDate} 至 {activity.endDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <p>文档内容预览</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{document.title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              v{document.version} · 更新于 {format(document.updatedAt, 'yyyy-MM-dd HH:mm', { locale: zhCN })}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Edit className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>

        {/* 底部 */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>创建者: {document.createdBy === 'ai' ? 'AI助手' : '运营人员'}</span>
              <span>•</span>
              <span>创建于 {format(document.createdAt, 'yyyy-MM-dd HH:mm', { locale: zhCN })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
