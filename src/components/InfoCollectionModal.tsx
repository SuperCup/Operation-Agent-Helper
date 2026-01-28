import { X, Upload, FileText } from 'lucide-react';
import { useState } from 'react';
import { ParamDefinition } from '@/types';
import { fileService } from '@/services/fileService';
import { useStore } from '@/store/useStore';
import clsx from 'clsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (params: Record<string, any>) => void;
  agentName: string;
  requiredParams: ParamDefinition[];
}

export default function InfoCollectionModal({
  isOpen,
  onClose,
  onConfirm,
  agentName,
  requiredParams,
}: Props) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<Record<string, Array<File | { id: string; name: string; size: number; type: string }>>>({});

  if (!isOpen) return null;

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const { currentSession } = useStore();

  const handleFileChange = async (key: string, fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles = Array.from(fileList);
    
    // 上传文件到IndexedDB
    try {
      const uploadedFiles = await fileService.uploadFiles(newFiles, {
        sessionId: currentSession?.id,
        fileType: key.includes('reference') ? 'reference' : 
                  key.includes('material') ? 'material' : 
                  key.includes('data') ? 'data' : 'other',
      });
      
      // 保存文件ID，而不是File对象
      setFiles((prev) => {
        const existing = prev[key] || [];
        return {
          ...prev,
          [key]: [...existing, ...uploadedFiles.map(f => ({
            id: f.id,
            name: f.name,
            size: f.size,
            type: f.type,
          }))],
        };
      });
    } catch (error) {
      console.error('Failed to upload files:', error);
      // 如果上传失败，仍然保存文件引用（降级处理）
      setFiles((prev) => ({ 
        ...prev, 
        [key]: [...(prev[key] || []), ...newFiles] 
      }));
    }
  };

  const handleRemoveFile = (key: string, index: number) => {
    setFiles((prev) => {
      const newFiles = { ...prev };
      if (newFiles[key]) {
        newFiles[key] = newFiles[key].filter((_, i) => i !== index);
      }
      return newFiles;
    });
  };

  const handleSubmit = () => {
    // 合并表单数据和文件
    // 文件已经上传到IndexedDB，这里只需要传递文件ID
    const allData = {
      ...formData,
      ...Object.keys(files).reduce((acc, key) => {
        acc[key] = files[key].map(f => {
          // 如果是已上传的文件对象，返回ID；否则返回File对象
          if ('id' in f) {
            return f.id;
          }
          return f;
        });
        return acc;
      }, {} as Record<string, any>),
    };
    onConfirm(allData);
    // 重置表单
    setFormData({});
    setFiles({});
  };

  const isFormValid = () => {
    return requiredParams.every((param) => {
      if (!param.required) return true;
      if (param.type === 'file') {
        return files[param.key] && files[param.key].length > 0;
      }
      const value = formData[param.key];
      return value !== undefined && value !== null && value !== '';
    });
  };

  const renderField = (param: ParamDefinition) => {
    const value = formData[param.key] || '';

    switch (param.type) {
      case 'text':
      case 'textarea':
        return (
          <div key={param.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {param.label}
              {param.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {param.description && (
              <p className="text-xs text-gray-500">{param.description}</p>
            )}
            {param.type === 'textarea' ? (
              <textarea
                value={value}
                onChange={(e) => handleInputChange(param.key, e.target.value)}
                placeholder={param.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={4}
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => handleInputChange(param.key, e.target.value)}
                placeholder={param.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            )}
          </div>
        );

      case 'number':
        return (
          <div key={param.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {param.label}
              {param.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {param.description && (
              <p className="text-xs text-gray-500">{param.description}</p>
            )}
            <input
              type="number"
              value={value}
              onChange={(e) => handleInputChange(param.key, Number(e.target.value))}
              placeholder={param.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        );

      case 'date':
        return (
          <div key={param.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {param.label}
              {param.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {param.description && (
              <p className="text-xs text-gray-500">{param.description}</p>
            )}
            <input
              type="date"
              value={value}
              onChange={(e) => handleInputChange(param.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        );

      case 'select':
        return (
          <div key={param.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {param.label}
              {param.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {param.description && (
              <p className="text-xs text-gray-500">{param.description}</p>
            )}
            <select
              value={value}
              onChange={(e) => handleInputChange(param.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">请选择</option>
              {param.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'file':
        return (
          <div key={param.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {param.label}
              {param.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {param.description && (
              <p className="text-xs text-gray-500">{param.description}</p>
            )}
            <div className="space-y-2">
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                <Upload className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">点击上传文件</span>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileChange(param.key, e.target.files)}
                  className="hidden"
                />
              </label>
              {files[param.key] && files[param.key].length > 0 && (
                <div className="space-y-1">
                  {files[param.key].map((file: File | { id: string; name: string; size: number; type: string }, index: number) => {
                    const fileName = file instanceof File ? file.name : file.name;
                    const fileSize = file instanceof File ? file.size : file.size;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{fileName}</span>
                          <span className="text-xs text-gray-500">
                            ({(fileSize / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(param.key, index)}
                          className="ml-2 p-1 hover:bg-gray-200 rounded"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // 按类型分组参数
  const basicParams = requiredParams.filter((p) => !p.key.includes('file') && p.type !== 'file');
  const fileParams = requiredParams.filter((p) => p.type === 'file');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">信息收集 - {agentName}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* 基本信息 */}
          {basicParams.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                <span className="mr-2">📋</span>
                基本信息
              </h3>
              <div className="space-y-4 pl-6">
                {basicParams.map((param) => renderField(param))}
              </div>
            </div>
          )}

          {/* 参考资料 */}
          {fileParams.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                <span className="mr-2">📎</span>
                参考资料
              </h3>
              <div className="space-y-4 pl-6">
                {fileParams.map((param) => renderField(param))}
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className={clsx(
              'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
              isFormValid()
                ? 'bg-primary-600 hover:bg-primary-700'
                : 'bg-gray-300 cursor-not-allowed'
            )}
          >
            确认并开始生成
          </button>
        </div>
      </div>
    </div>
  );
}
