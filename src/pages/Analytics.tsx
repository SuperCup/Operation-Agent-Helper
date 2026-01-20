import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Eye,
  MousePointer,
  Calendar
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { mockMetrics } from '@/data/mockData';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Analytics() {
  const { projects } = useStore();
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7days');

  const activeProjects = projects.filter(p => p.status === 'active');

  // 计算总体数据
  const totalMetrics = mockMetrics.reduce((acc, m) => ({
    gmv: acc.gmv + m.gmv,
    orders: acc.orders + m.orders,
    cost: acc.cost + m.cost,
    exposure: acc.exposure + m.exposure,
    clicks: acc.clicks + m.clicks,
  }), { gmv: 0, orders: 0, cost: 0, exposure: 0, clicks: 0 });

  const avgROI = totalMetrics.cost > 0 ? totalMetrics.gmv / totalMetrics.cost : 0;
  const avgCTR = totalMetrics.exposure > 0 ? (totalMetrics.clicks / totalMetrics.exposure) * 100 : 0;

  const stats = [
    {
      name: '总GMV',
      value: `¥${(totalMetrics.gmv / 1000).toFixed(1)}K`,
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: '总订单',
      value: totalMetrics.orders.toLocaleString(),
      change: '+12.8%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      name: '平均ROI',
      value: avgROI.toFixed(2),
      change: '+8.5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      name: '平均点击率',
      value: `${avgCTR.toFixed(2)}%`,
      change: '+3.2%',
      trend: 'up',
      icon: MousePointer,
      color: 'bg-orange-500',
    },
  ];

  // 格式化图表数据
  const chartData = mockMetrics.map(m => ({
    ...m,
    date: format(new Date(m.date), 'MM/dd'),
  }));

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据分析</h1>
          <p className="text-gray-600 mt-1">运营效果评估与数据洞察</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">所有项目</option>
            {activeProjects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="7days">近7天</option>
            <option value="30days">近30天</option>
            <option value="90days">近90天</option>
          </select>
        </div>
      </div>

      {/* 数据概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className={`flex items-center mt-2 text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  <span>{stat.change}</span>
                  <span className="ml-1 text-gray-500">vs 上周</span>
                </div>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* GMV与ROI趋势 */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">GMV与ROI趋势</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>近7天数据</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorGMV" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorROI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis yAxisId="left" stroke="#6b7280" />
            <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Legend />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="gmv" 
              stroke="#0ea5e9" 
              fill="url(#colorGMV)"
              name="GMV (元)"
              strokeWidth={2}
            />
            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey="roi" 
              stroke="#8b5cf6" 
              fill="url(#colorROI)"
              name="ROI"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 订单量趋势 */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">订单量趋势</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="orders" fill="#0ea5e9" name="订单量" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 点击率与转化率 */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">点击率与转化率</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ctr" 
                stroke="#10b981" 
                name="点击率(%)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="cvr" 
                stroke="#f59e0b" 
                name="转化率(%)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 投放成本分析 */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">投放成本分析</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="cost" 
              stroke="#ef4444" 
              fill="url(#colorCost)"
              name="投放成本 (元)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 数据洞察 */}
      <div className="card bg-gradient-to-br from-primary-50 to-purple-50 border-primary-200">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI 数据洞察</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• 过去7天ROI持续上升，建议继续加大投放力度</p>
              <p>• 周末（1/18-1/19）转化率提升明显，建议周末增加30%预算</p>
              <p>• 晚上8-10点时段表现最佳，建议优化投放时段分配</p>
              <p>• 当前点击率(8.4%)高于行业平均水平(6.2%)，创意素材效果良好</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
