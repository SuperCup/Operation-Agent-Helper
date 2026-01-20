import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { FileText, Search, Download, Eye, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import DocumentPreviewModal from '@/components/DocumentPreviewModal';
import { Document } from '@/types';

const documentTypeLabels: Record<string, string> = {
  operation_plan: '运营方案',
  execution_plan: '执行计划',
  submission_form: '提报表',
  evaluation_report: '评估报告',
  final_report: '结案报告',
};

export default function Documents() {
  const { documents, projects } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">文档中心</h1>
        <p className="text-gray-600 mt-1">管理AI生成的运营文档</p>
      </div>

      {/* 筛选栏 */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索文档标题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">所有类型</option>
            {Object.entries(documentTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 文档列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => {
          const project = projects.find(p => p.id === doc.projectId);
          
          return (
            <div key={doc.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
                <span className={`badge ${
                  doc.createdBy === 'ai' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {doc.createdBy === 'ai' ? 'AI生成' : '人工创建'}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.title}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {documentTypeLabels[doc.type]} · v{doc.version}
              </p>

              {project && (
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <span className="truncate">{project.name}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  <span>{format(doc.updatedAt, 'yyyy-MM-dd', { locale: zhCN })}</span>
                </div>
                <div className="flex items-center">
                  <User className="w-3.5 h-3.5 mr-1" />
                  <span>{doc.createdBy === 'ai' ? 'AI助手' : '运营人员'}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex space-x-2">
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">预览</span>
                </button>
                <button className="flex items-center justify-center px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="card text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">暂无文档</p>
        </div>
      )}

      {/* 文档预览模态框 */}
      {selectedDoc && (
        <DocumentPreviewModal
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}
