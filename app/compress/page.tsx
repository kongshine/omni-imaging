'use client';

import { useState, useRef, ChangeEvent } from 'react';

export default function ImageCompressor() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [compressionQuality, setCompressionQuality] = useState<number>(80);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setOriginalSize(file.size);

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setOriginalImage(result);
        setCompressedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = () => {
    if (!originalImage) return;

    setIsCompressing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedUrl = URL.createObjectURL(blob);
            setCompressedImage(compressedUrl);
            setCompressedSize(blob.size);
          }
          setIsCompressing(false);
        },
        'image/jpeg',
        compressionQuality / 100
      );
    };

    img.src = originalImage;
  };

  const downloadCompressedImage = () => {
    if (!compressedImage) return;

    const link = document.createElement('a');
    link.href = compressedImage;
    link.download = `compressed_${fileName}`;
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

  const calculateCompressionRatio = (): string => {
    if (originalSize === 0 || compressedSize === 0) return '0%';
    const ratio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    return `${ratio}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <a
                href="/"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">图片压缩</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium">
                🗜️ 压缩工具
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            智能图片压缩
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            快速压缩图片文件大小，保持清晰度的同时减小文件体积。支持 JPG、PNG 等多种格式。
          </p>
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
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    点击上传图片
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    支持 JPG、PNG、GIF 等格式，最大 10MB
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
                      className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      {formatFileSize(originalSize)}
                    </div>
                  </div>
                </div>

                {/* Compression Controls */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        压缩质量: {compressionQuality}%
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={compressionQuality}
                        onChange={(e) => setCompressionQuality(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>10% (最小)</span>
                        <span>100% (原始)</span>
                      </div>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={compressImage}
                        disabled={isCompressing}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                      >
                        {isCompressing ? '压缩中...' : '开始压缩'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Compressed Image Preview */}
                {compressedImage && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">压缩后图片</h3>
                    <div className="relative inline-block">
                      <img
                        src={compressedImage}
                        alt="Compressed"
                        className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
                      />
                      <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-sm">
                        {formatFileSize(compressedSize)}
                      </div>
                    </div>

                    {/* Compression Stats */}
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">原始大小</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatFileSize(originalSize)}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">压缩后大小</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatFileSize(compressedSize)}
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 text-center">
                        <p className="text-sm text-green-600 dark:text-green-400">压缩率</p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {calculateCompressionRatio()}
                        </p>
                      </div>
                    </div>

                    {/* Download Button */}
                    <div className="mt-6 flex gap-4">
                      <button
                        onClick={downloadCompressedImage}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        下载压缩图片
                      </button>
                      <button
                        onClick={() => {
                          setOriginalImage(null);
                          setCompressedImage(null);
                          setFileName('');
                        }}
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
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              ⚡
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">快速处理</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              本地处理，无需上传到服务器，保护您的隐私
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              🎯
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">精准控制</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              10%-100% 压缩质量自由调节，满足不同需求
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              📊
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">实时对比</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              压缩前后大小对比，清晰显示压缩效果
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}