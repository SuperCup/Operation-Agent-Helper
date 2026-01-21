import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface Props {
  placeholder?: string;
  onSendMessage?: (message: string) => void;
}

const quickActions = [
  { icon: '📊', text: '查看运营概况', query: '帮我查看当前所有项目的运营概况' },
  { icon: '📝', text: '生成运营方案', query: '帮我生成一个新的运营方案' },
  { icon: '🎯', text: '监测项目执行', query: '帮我监测春节大促活动的执行情况' },
  { icon: '💰', text: '预算分配建议', query: '帮我分析当前预算分配情况并给出优化建议' },
];

export default function AIChatBox({ placeholder = '请描述您的需求，数字员工为您服务...', onSendMessage }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: '您好！我是即时零售运营数字员工，可以帮您完成运营方案设计、计划执行、数据分析等工作。',
      timestamp: new Date(),
      suggestions: [
        '查看运营概况',
        '生成运营方案',
        '监测项目执行',
        '预算分配建议',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (message: string = input) => {
    if (!message.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // 调用回调
    onSendMessage?.(message);

    // 模拟AI响应
    setTimeout(() => {
      const response = generateResponse(message);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateResponse = (query: string): { content: string; suggestions?: string[] } => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('概况') || lowerQuery.includes('总览')) {
      return {
        content: `根据当前数据分析：

📊 **运营概况**
• 进行中项目：2个
• 今日GMV：¥86.7K（↑12.5% vs 昨日）
• 今日订单：980单
• 平均ROI：4.82
• 活动转化率：6.3%

🎯 **重点项目**
1. 春节大促活动 - 执行阶段，进度75%
2. 新品上市推广 - 计划阶段，待启动

💡 需要我帮您深入分析某个项目吗？`,
        suggestions: ['查看春节大促详情', '生成新品推广方案', '分析预算执行情况'],
      };
    }

    if (lowerQuery.includes('方案') || lowerQuery.includes('策略')) {
      return {
        content: `我可以为您生成多种运营方案：

📝 **可生成的方案类型**
1. 活动运营方案 - 节日促销、新品首发等
2. 广告投放方案 - RTB竞价、品牌广告等
3. 预算分配方案 - 多渠道预算优化
4. 数据分析方案 - 效果评估与优化

请告诉我：
• 项目类型和目标
• 预算范围
• 时间周期
• 目标平台

我将为您生成专业的运营方案。`,
        suggestions: ['生成活动方案', '生成广告方案', '查看历史方案'],
      };
    }

    if (lowerQuery.includes('监测') || lowerQuery.includes('执行') || lowerQuery.includes('春节')) {
      return {
        content: `**春节大促活动 - 执行监控**

📈 **当前状态**
• 执行进度：75%（3/4步骤已完成）
• 活动状态：正在提交平台
• 需要确认：库存不足提醒

📊 **实时数据**（过去7天）
• 累计GMV：¥370.9K
• 累计订单：4,270单
• 平均ROI：4.18
• 点击率：7.8%

⚠️ **待处理事项**
1. 部分商品库存不足，需要人工确认是否继续
2. 广告投放计划2待审核

需要我帮您处理这些事项吗？`,
        suggestions: ['确认库存问题', '查看详细数据', '调整投放计划'],
      };
    }

    if (lowerQuery.includes('预算') || lowerQuery.includes('分配')) {
      return {
        content: `💰 **预算分析与建议**

**当前预算使用情况**
• 总预算：¥50万
• 已使用：¥8.8万（17.6%）
• 剩余：¥41.2万

**分配建议**
活动预算：¥20万（40%）
• 满减活动：¥15万
• 品牌专区：¥5万

广告预算：¥30万（60%）
• 搜索广告：¥12万
• 推荐位：¥10万
• 品牌广告：¥8万

**优化建议**
1. 周末增加30%预算（转化率提升明显）
2. 晚上8-10点加大投放
3. 重点投放一二线城市

需要我帮您生成详细的预算方案吗？`,
        suggestions: ['生成预算方案', '查看ROI分析', '调整预算分配'],
      };
    }

    // 默认响应
    return {
      content: `我理解您的需求了。我可以帮您：

🎯 **核心功能**
• 运营方案设计
• 计划执行监控  
• 数据分析评估
• 预算优化建议
• 文档自动生成

请告诉我具体需要什么帮助？`,
      suggestions: ['查看运营概况', '生成方案', '监测项目', '预算建议'],
    };
  };

  const handleQuickAction = (query: string) => {
    handleSend(query);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={`flex items-start space-x-3 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* 头像 */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user'
                    ? 'bg-primary-100'
                    : message.type === 'system'
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                    : 'bg-gradient-to-br from-blue-500 to-primary-500'
                }`}
              >
                {message.type === 'user' ? (
                  <User className="w-5 h-5 text-primary-600" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>

              {/* 消息内容 */}
              <div
                className={`flex-1 ${
                  message.type === 'user' ? 'flex justify-end' : ''
                }`}
              >
                <div
                  className={`inline-block max-w-[85%] rounded-lg px-4 py-2 ${
                    message.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* 建议操作 */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSend(suggestion)}
                        className="text-xs px-3 py-1.5 bg-white border border-primary-200 text-primary-700 rounded-full hover:bg-primary-50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* 输入中提示 */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-primary-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                <span className="text-sm text-gray-600">正在思考...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 快捷操作 */}
      {messages.length === 1 && (
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">快捷操作</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.query)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
              >
                <span className="text-lg">{action.icon}</span>
                <span className="text-sm text-gray-700 flex-1">{action.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 输入框 */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={placeholder}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-10"
            />
            <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="p-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
