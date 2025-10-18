'use client';

import { useState, useRef, ChangeEvent } from 'react';

// ⚠️ 安全提醒：API Key 不应该直接暴露在前端代码中
// 这里仅用于演示，实际项目中应该通过后端服务来调用 API
const REMOVE_BG_API_KEY = '2WhPbFa5X9BaRVk8cE5AJEVc';
const REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg';

export default function BackgroundRemover() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setOriginalSize(file.size);
      setError('');

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setOriginalImage(result);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackground = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setError('');

    try {
      // Convert data URL to Blob
      const response = await fetch(originalImage);
      const blob = await response.blob();

      // Create FormData for API request
      const formData = new FormData();
      formData.append('image_file', blob, fileName);
      formData.append('size', 'auto');

      // Call remove.bg API
      const apiResponse = await fetch(REMOVE_BG_API_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': REMOVE_BG_API_KEY,
        },
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`API Error: ${apiResponse.status} - ${errorText}`);
      }

      // Get the processed image as Blob
      const processedBlob = await apiResponse.blob();
      const processedUrl = URL.createObjectURL(processedBlob);
      setProcessedImage(processedUrl);

    } catch (err) {
      console.error('Background removal error:', err);
      setError(err instanceof Error ? err.message : '处理失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadProcessedImage = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `no-bg_${fileName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetImages = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setFileName('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <a
                href="/"
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">抠图去背景</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                ✂️ AI 去背景
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            智能抠图去背景
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            使用 AI 技术智能识别并移除图片背景，支持人像、物品等多种场景，一键获得透明背景图片。
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>安全提醒：</strong>此功能演示使用了 API Key，实际生产环境中应该通过后端服务调用 API 以保护密钥安全。
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
          <div className="text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {!originalImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 cursor-pointer hover:border-green-500 dark:hover:border-green-400 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    点击上传图片
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    支持 JPG、PNG 等格式，推荐上传人物或物品清晰的照片
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Original Image Preview */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">原始图片</h3>
                  <div className="relative inline-block">
                    <img
                      src={originalImage}
                      alt="Original"
                      className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain bg-gray-100 dark:bg-gray-700"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      {formatFileSize(originalSize)}
                    </div>
                  </div>
                </div>

                {/* Processing Controls */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">准备去除背景</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        AI 将自动识别主体并移除背景
                      </p>
                    </div>
                    <button
                      onClick={removeBackground}
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center"
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          处理中...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          开始去背景
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-red-800 dark:text-red-200">
                        <strong>处理失败：</strong>{error}
                      </div>
                    </div>
                  </div>
                )}

                {/* Processed Image Preview */}
                {processedImage && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      <span className="text-green-600 dark:text-green-400">✓</span> 去除背景完成
                    </h3>
                    <div className="relative inline-block">
                      <img
                        src={processedImage}
                        alt="Processed"
                        className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
                        style={{ background: 'repeating-conic-gradient(#f0f0f0 0% 25%, white 0% 50%) 50% / 20px 20px' }}
                      />
                      <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-sm">
                        透明背景
                      </div>
                    </div>

                    {/* Download Button */}
                    <div className="mt-6 flex gap-4">
                      <button
                        onClick={downloadProcessedImage}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        下载透明背景图片
                      </button>
                      <button
                        onClick={resetImages}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                      >
                        重新上传
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              🎯
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">精准识别</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI 智能识别人像、物品等主体，精确分离前景和背景
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              ⚡
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">快速处理</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              一键去除背景，几秒钟内获得高质量的透明背景图片
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              🎨
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">高质量输出</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              保持边缘细节自然，支持 PNG 格式透明背景输出
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}