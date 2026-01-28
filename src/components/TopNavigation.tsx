import { Plus, Share2, ChevronDown } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useState } from 'react';

export default function TopNavigation() {
  const { currentSession, createNewSession, archiveSession } = useStore();
  const [showBrandMenu, setShowBrandMenu] = useState(false);
  const [currentBrand, setCurrentBrand] = useState('达能');

  const brands = ['达能', '嘉士伯', '康师傅', '汉高', '海天', '百威'];

  const handleNewSession = () => {
    if (currentSession) {
      const suggestedTitle = currentSession.title || '未命名会话';
      archiveSession(suggestedTitle);
    }
    createNewSession();
  };

  const handleShare = () => {
    console.log('分享功能待实现');
  };

  const handleBrandChange = (brand: string) => {
    setCurrentBrand(brand);
    setShowBrandMenu(false);
  };

  return (
    <div className="h-12 flex-shrink-0 border-b border-gray-200 bg-white flex items-center justify-between px-4">
      {/* 左侧：系统Logo和标题 */}
      <div className="flex items-center space-x-2.5">
        <div className="w-7 h-7 bg-gray-900 rounded flex items-center justify-center">
          <span className="text-white font-medium text-xs">AI</span>
        </div>
        <h1 className="text-sm font-medium text-gray-800">即时零售运营AI Agent</h1>
      </div>

      {/* 右侧：操作按钮和用户信息 */}
      <div className="flex items-center space-x-2">
        {/* 新建会话 */}
        <button
          onClick={handleNewSession}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-gray-900 text-white rounded text-xs font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>创建新对话</span>
        </button>

        {/* 分享 */}
        <button
          onClick={handleShare}
          className="flex items-center space-x-1 px-2 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>分享</span>
        </button>

        {/* 品牌切换 */}
        <div className="relative">
          <button
            onClick={() => setShowBrandMenu(!showBrandMenu)}
            className="flex items-center space-x-1 px-2 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span>{currentBrand}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {showBrandMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowBrandMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => handleBrandChange(brand)}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${
                      currentBrand === brand ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-600'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 用户信息 */}
        <div className="flex items-center pl-2 border-l border-gray-200">
          <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
            宇
          </div>
        </div>
      </div>
    </div>
  );
}
