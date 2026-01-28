import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Loader2, Presentation, FileSpreadsheet, Eye, Download, Image as ImageIcon, File, FileText, Search, LocateFixed, MoreVertical } from 'lucide-react';
import { ConversationFile } from '@/types';
import clsx from 'clsx';

export default function TaskList() {
  const { documentGenerationTasks, currentSession } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'ppt':
        return Presentation;
      case 'excel':
        return FileSpreadsheet;
      case 'doc':
        return FileText;
      default:
        return FileText;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'ppt':
        return 'PPT';
      case 'excel':
        return 'Excel';
      case 'doc':
        return 'Word';
      default:
        return '文档';
    }
  };

  // 从会话消息中提取Agent生成的文件（带消息ID用于定位）
  const getAgentGeneratedFiles = (): Array<{
    id: string;
    name: string;
    type: string;
    url?: string;
    previewUrl?: string;
    generatedAt: Date;
    messageId?: string;
  }> => {
    const files: Array<{
      id: string;
      name: string;
      type: string;
      url?: string;
      previewUrl?: string;
      generatedAt: Date;
      messageId?: string;
    }> = [];

    // 从会话的generatedFiles中获取
    if (currentSession?.generatedFiles && currentSession.generatedFiles.length > 0) {
      currentSession.generatedFiles.forEach((file: ConversationFile) => {
        files.push({
          id: file.id,
          name: file.name,
          type: file.type,
          url: file.url,
          previewUrl: file.previewUrl,
          generatedAt: file.generatedAt,
        });
      });
    }

    // 从消息中提取Agent生成的文件
    if (currentSession?.messages) {
      currentSession.messages.forEach((message) => {
        // 提取generatedFile
        if (message.type === 'agent' && message.metadata?.generatedFile) {
          const gf = message.metadata.generatedFile;
          if (!files.find(f => f.id === gf.id)) {
            files.push({
              id: gf.id,
              name: gf.name,
              type: gf.type,
              url: gf.url,
              previewUrl: gf.previewUrl,
              generatedAt: message.timestamp,
              messageId: message.id,
            });
          }
        }
        // 提取attachments
        if (message.type === 'agent' && message.metadata?.attachments) {
          message.metadata.attachments.forEach((att: any) => {
            if (!files.find(f => f.id === att.id)) {
              files.push({
                id: att.id,
                name: att.name,
                type: att.type,
                url: att.url,
                previewUrl: att.url,
                generatedAt: message.timestamp,
                messageId: message.id,
              });
            }
          });
        }
      });
    }

    return files.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  };

  // 从会话消息中提取用户上传的文件（带消息ID用于定位）
  const getUserUploadedFiles = (): Array<{
    id: string;
    name: string;
    type: string;
    url?: string;
    uploadedAt: Date;
    messageId?: string;
  }> => {
    const files: Array<{
      id: string;
      name: string;
      type: string;
      url?: string;
      uploadedAt: Date;
      messageId?: string;
    }> = [];

    if (currentSession?.messages) {
      currentSession.messages.forEach((message) => {
        if (message.type === 'user' && message.metadata?.attachments) {
          message.metadata.attachments.forEach((att: any) => {
            if (!files.find(f => f.id === att.id)) {
              files.push({
                id: att.id,
                name: att.name,
                type: att.type,
                url: att.url,
                uploadedAt: message.timestamp,
                messageId: message.id,
              });
            }
          });
        }
      });
    }

    return files.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  };

  const agentFiles = getAgentGeneratedFiles();
  const userFiles = getUserUploadedFiles();

  // 搜索过滤
  const filteredAgentFiles = agentFiles.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredUserFiles = userFiles.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 获取文件图标
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return ImageIcon;
    }
    if (type === 'ppt' || type.includes('presentation') || type.includes('powerpoint')) {
      return Presentation;
    }
    if (type === 'excel' || type.includes('spreadsheet') || type.includes('xls')) {
      return FileSpreadsheet;
    }
    if (type === 'doc' || type.includes('word') || type.includes('document') || type.includes('docx')) {
      return FileText;
    }
    if (type.includes('pdf')) {
      return FileText;
    }
    return File;
  };

  // 格式化文件类型显示
  const getFileTypeLabel = (type: string) => {
    if (type.startsWith('image/')) {
      return '图片';
    }
    if (type === 'ppt' || type.includes('presentation') || type.includes('powerpoint')) {
      return 'PPT';
    }
    if (type === 'excel' || type.includes('spreadsheet') || type.includes('xls')) {
      return 'Excel';
    }
    if (type === 'doc' || type.includes('word') || type.includes('document') || type.includes('docx')) {
      return 'Word';
    }
    if (type.includes('pdf')) {
      return 'PDF';
    }
    return '文件';
  };

  // 定位到会话中的消息
  const scrollToMessage = (messageId?: string) => {
    if (!messageId) return;
    setOpenMenuId(null);
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-yellow-50');
      setTimeout(() => {
        element.classList.remove('bg-yellow-50');
      }, 2000);
    }
  };

  // 下载文件
  const handleDownload = (url?: string, filename?: string) => {
    if (!url) return;
    setOpenMenuId(null);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 预览文件
  const handlePreview = (url?: string) => {
    if (!url) return;
    setOpenMenuId(null);
    window.open(url, '_blank');
  };

  // 文件操作菜单组件
  const FileActionMenu = ({ 
    fileId, 
    previewUrl, 
    downloadUrl, 
    filename, 
    messageId 
  }: { 
    fileId: string;
    previewUrl?: string;
    downloadUrl?: string;
    filename?: string;
    messageId?: string;
  }) => {
    const isOpen = openMenuId === fileId;

    return (
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenuId(isOpen ? null : fileId);
          }}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpenMenuId(null)}
            />
            <div className="absolute right-0 top-8 z-20 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
              <button
                onClick={() => handlePreview(previewUrl || downloadUrl)}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>预览</span>
              </button>
              <button
                onClick={() => handleDownload(downloadUrl, filename)}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载</span>
              </button>
              {messageId && (
                <button
                  onClick={() => scrollToMessage(messageId)}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <LocateFixed className="w-3.5 h-3.5" />
                  <span>定位</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const totalFiles = agentFiles.length + userFiles.length + documentGenerationTasks.length;

  return (
    <div className="h-full flex flex-col">
      {/* 标题栏 */}
      <div className="flex-shrink-0 h-12 px-4 border-b border-gray-200 bg-white flex items-center">
        <h2 className="text-sm font-medium text-gray-700">文件预览</h2>
      </div>

      {/* 搜索框 */}
      <div className="flex-shrink-0 p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索文件名..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* 文件列表 */}
      <div className="flex-1 overflow-y-auto p-3">
        {totalFiles === 0 && !searchQuery ? (
          <div className="text-center py-8">
            <p className="text-xs text-gray-400">暂无文件</p>
            <p className="text-[10px] text-gray-300 mt-1">对话中生成或上传的文件将显示在这里</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Agent生成的文件 */}
            {(filteredAgentFiles.length > 0 || documentGenerationTasks.length > 0) && (
              <div>
                <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2 px-1">
                  Agent 生成
                </div>
                <div className="space-y-1">
                  {/* 正在生成的任务 */}
                  {documentGenerationTasks.map((task) => {
                    const DocIcon = getDocumentIcon(task.type);
                    return (
                      <div
                        key={task.id}
                        className={clsx(
                          'p-3 rounded-lg',
                          task.status === 'generating' ? 'bg-blue-50' :
                          task.status === 'completed' ? 'bg-white border border-gray-200' :
                          task.status === 'failed' ? 'bg-red-50' : 'bg-gray-50'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className={clsx(
                              'flex-shrink-0 w-8 h-8 rounded flex items-center justify-center',
                              task.status === 'generating' ? 'bg-blue-100' :
                              task.status === 'completed' ? 'bg-emerald-50' :
                              task.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                            )}>
                              <DocIcon className={clsx(
                                'w-4 h-4',
                                task.status === 'generating' ? 'text-blue-500' :
                                task.status === 'completed' ? 'text-emerald-500' :
                                task.status === 'failed' ? 'text-red-500' : 'text-gray-500'
                              )} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {getDocumentTypeLabel(task.type)}文档
                              </p>
                              {task.status === 'generating' && (
                                <div className="flex items-center space-x-2 mt-1">
                                  <div className="flex-1 h-1 bg-blue-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-500 rounded-full transition-all"
                                      style={{ width: `${task.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-blue-600">{Math.round(task.progress)}%</span>
                                </div>
                              )}
                              {task.status === 'failed' && (
                                <p className="text-[10px] text-red-500 mt-0.5">生成失败</p>
                              )}
                            </div>
                          </div>
                          {task.status === 'generating' && (
                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
                          )}
                          {task.status === 'completed' && (
                            <FileActionMenu
                              fileId={task.id}
                              previewUrl={task.result?.previewUrl}
                              downloadUrl={task.result?.url}
                              filename={`${getDocumentTypeLabel(task.type)}文档`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* 已生成的文件 */}
                  {filteredAgentFiles.map((file) => {
                    const FileIcon = getFileIcon(file.type);
                    return (
                      <div
                        key={file.id}
                        className="p-3 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-8 h-8 bg-emerald-50 rounded flex items-center justify-center">
                              <FileIcon className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">{getFileTypeLabel(file.type)}</p>
                            </div>
                          </div>
                          <FileActionMenu
                            fileId={file.id}
                            previewUrl={file.previewUrl || file.url}
                            downloadUrl={file.url}
                            filename={file.name}
                            messageId={file.messageId}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 用户上传的文件 */}
            {filteredUserFiles.length > 0 && (
              <div>
                <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2 px-1">
                  用户上传
                </div>
                <div className="space-y-1">
                  {filteredUserFiles.map((file) => {
                    const FileIcon = getFileIcon(file.type);
                    return (
                      <div
                        key={file.id}
                        className="p-3 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                              <FileIcon className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">{getFileTypeLabel(file.type)}</p>
                            </div>
                          </div>
                          <FileActionMenu
                            fileId={file.id}
                            previewUrl={file.url}
                            downloadUrl={file.url}
                            filename={file.name}
                            messageId={file.messageId}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 搜索无结果 */}
            {searchQuery && filteredAgentFiles.length === 0 && filteredUserFiles.length === 0 && (
              <div className="text-center py-6">
                <p className="text-xs text-gray-400">未找到匹配的文件</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
