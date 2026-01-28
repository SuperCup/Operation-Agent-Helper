import { X } from 'lucide-react';
import { useState } from 'react';

interface Props {
  isOpen: boolean;
  suggestedTitle: string;
  onClose: () => void;
  onConfirm: (title: string) => void;
}

export default function ArchiveSessionModal({
  isOpen,
  suggestedTitle,
  onClose,
  onConfirm,
}: Props) {
  const [title, setTitle] = useState(suggestedTitle);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(title || suggestedTitle);
    setTitle(suggestedTitle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">归档当前会话</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                系统建议标题
              </label>
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                {suggestedTitle}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                会话标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入会话标题"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 归档后可在任务管理中查看历史会话
              </p>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              确认归档并开启新会话
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
