import { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Project, PlatformType, OperationType } from '@/types';
import { useNavigate } from 'react-router-dom';

interface Props {
  onClose: () => void;
}

export default function CreateProjectModal({ onClose }: Props) {
  const navigate = useNavigate();
  const { addProject } = useStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    category: '',
    platform: 'meituan' as PlatformType,
    operationType: 'both' as OperationType,
    budget: '',
    startDate: '',
    endDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      brand: formData.brand,
      category: formData.category,
      platform: formData.platform,
      operationType: formData.operationType,
      phase: 'preparation',
      status: 'draft',
      budget: formData.budget ? Number(formData.budget) : undefined,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addProject(newProject);
    navigate(`/projects/${newProject.id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">创建新项目</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目名称 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="例如：春节大促活动"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="简要描述项目目标和内容"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                品牌 *
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="input-field"
                placeholder="品牌名称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                品类 *
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
                placeholder="产品品类"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                平台 *
              </label>
              <select
                required
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value as PlatformType })}
                className="input-field"
              >
                <option value="meituan">美团</option>
                <option value="eleme">饿了么</option>
                <option value="jd">京东到家</option>
                <option value="douyin">抖音</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                运营类型 *
              </label>
              <select
                required
                value={formData.operationType}
                onChange={(e) => setFormData({ ...formData, operationType: e.target.value as OperationType })}
                className="input-field"
              >
                <option value="both">活动+广告</option>
                <option value="activity">仅活动</option>
                <option value="ad">仅广告</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              预算（元）
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="input-field"
              placeholder="项目总预算"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                开始日期
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                结束日期
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              创建项目
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
