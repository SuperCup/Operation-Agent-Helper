import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { BookOpen, Search, TrendingUp, Tag, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Knowledge() {
  const { knowledgeBase } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = Array.from(new Set(knowledgeBase.map(k => k.category)));

  const filteredKnowledge = knowledgeBase.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // 按ROI排序
  const sortedKnowledge = [...filteredKnowledge].sort((a, b) => b.performance.roi - a.performance.roi);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">知识库</h1>
        <p className="text-gray-600 mt-1">优秀运营案例和策略集合</p>
      </div>

      {/* 筛选栏 */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索案例标题或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">所有分类</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">总案例数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{knowledgeBase.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-primary-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均ROI</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(knowledgeBase.reduce((sum, k) => sum + k.performance.roi, 0) / knowledgeBase.length).toFixed(1)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">累计GMV</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ¥{(knowledgeBase.reduce((sum, k) => sum + k.performance.gmv, 0) / 10000).toFixed(0)}万
              </p>
            </div>
            <Tag className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">累计订单</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {knowledgeBase.reduce((sum, k) => sum + k.performance.orders, 0).toLocaleString()}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* 知识库列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedKnowledge.map((item) => (
          <div key={item.id} className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.tags.map((tag, index) => (
                    <span key={index} className="badge bg-gray-100 text-gray-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="ml-4 text-right">
                <div className="inline-flex items-center px-3 py-1 bg-green-100 rounded-full">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-semibold text-green-700">
                    ROI {item.performance.roi}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">GMV</p>
                <p className="text-lg font-semibold text-gray-900">
                  ¥{(item.performance.gmv / 10000).toFixed(1)}万
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">订单</p>
                <p className="text-lg font-semibold text-gray-900">
                  {item.performance.orders.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">平台</p>
                <p className="text-sm font-semibold text-gray-900">
                  {item.platform}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{item.category}</span>
                <span className="text-gray-500">
                  {format(item.createdAt, 'yyyy-MM-dd', { locale: zhCN })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedKnowledge.length === 0 && (
        <div className="card text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">未找到匹配的知识库内容</p>
        </div>
      )}
    </div>
  );
}
