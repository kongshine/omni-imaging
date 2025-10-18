'use client';

import { useState, useRef, ChangeEvent } from 'react';

export default function ImageRecognizer() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [recognitionResult, setRecognitionResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [imageFormat, setImageFormat] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setError('');
      setRecognitionResult('');

      // 获取图片格式
      const format = file.type.split('/')[1] || 'jpeg';
      setImageFormat(format);

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setOriginalImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertToBase64 = (dataUrl: string): string => {
    // 移除 data URL 前缀，只保留 Base64 编码部分
    const base64 = dataUrl.split(',')[1];
    return base64;
  };

  const recognizeImage = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setError('');
    setRecognitionResult('');

    try {
      // 转换为 Base64
      const base64Image = convertToBase64(originalImage);

      // 构建 data URL 格式
      const imageUrl = `data:image/${imageFormat};base64,${base64Image}`;

      // 调用火山引擎 API
      const response = await fetch('/api/recognize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageUrl,
          format: imageFormat
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '识别失败，请重试');
      }

      const data = await response.json();
      setRecognitionResult(data.content || '识别完成，但未获得结果');

    } catch (err) {
      console.error('Recognition error:', err);
      setError(err instanceof Error ? err.message : '识别失败，请重试');
    } finally {
      setIsProcessing(false);
    }
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
    setRecognitionResult('');
    setFileName('');
    setError('');
    setImageFormat('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <a
                href="/"
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">图片识别</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm font-medium">
                🔍 AI 识别
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            智能图片识别
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            使用先进的 AI 技术识别图片内容，包括物体、场景、文字、人脸等多种元素，提供详细的识别结果。
          </p>
        </div>

        {/* API Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>技术支持：</strong>使用火山引擎 AI 模型进行图片识别，支持多种识别场景。
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
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    点击上传图片
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    支持 JPG、PNG、WEBP 等格式，AI 将智能识别图片内容
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Original Image Preview */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">待识别图片</h3>
                  <div className="relative inline-block">
                    <img
                      src={originalImage}
                      alt="Original"
                      className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain bg-gray-100 dark:bg-gray-700"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      {fileName} • {imageFormat.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Recognition Controls */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">准备识别图片内容</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        AI 将分析图片中的物体、场景、文字等信息
                      </p>
                    </div>
                    <button
                      onClick={recognizeImage}
                      disabled={isProcessing}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center"
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          识别中...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          开始识别
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
                        <strong>识别失败：</strong>{error}
                      </div>
                    </div>
                  </div>
                )}

                {/* Recognition Result */}
                {recognitionResult && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      <span className="text-purple-600 dark:text-purple-400">✓</span> 识别结果
                    </h3>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                      <div className="prose dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                          {recognitionResult}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex gap-4">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(recognitionResult);
                        }}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        复制结果
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
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              🎯
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">物体识别</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              精准识别图片中的各种物体，包括名称、特征和属性
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              📝
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">文字识别</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              提取图片中的文字内容，支持中英文和多种字体
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              🌍
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">场景分析</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              分析图片场景、环境、氛围等上下文信息
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}