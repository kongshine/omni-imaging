'use client';

import { useState } from 'react';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [generationHistory, setGenerationHistory] = useState<Array<{
    prompt: string;
    imageUrl: string;
    timestamp: Date;
  }>>([]);

  // 预设的提示词示例
  const promptExamples = [
    "星际穿越，黑洞，黑洞里冲出一辆快支离破碎的复古列车，强视觉冲击力，电影大片",
    "赛博朋克城市夜景，霓虹灯闪烁，未来科技感，高清细节",
    "梦幻森林，发光的蘑菇，神秘的生物，魔法氛围，油画风格",
    "古代中国宫殿，金碧辉煌，传统建筑，夕阳西下，壮丽景观",
    "深海世界，珊瑚礁，热带鱼，海底废墟，神秘色彩"
  ];

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('请输入图片描述');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedImage('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '生成失败，请重试');
      }

      const data = await response.json();

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);

        // 添加到历史记录
        setGenerationHistory(prev => [{
          prompt: prompt.trim(),
          imageUrl: data.imageUrl,
          timestamp: new Date()
        }, ...prev.slice(0, 9)]); // 保留最近10条
      } else {
        throw new Error('未收到生成的图片');
      }

    } catch (err) {
      console.error('Image generation error:', err);
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `ai-generated-${prompt.slice(0, 20)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      setError('下载失败，请重试');
    }
  };

  const useExamplePrompt = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      generateImage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <a
                href="/"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI 生图</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full text-sm font-medium">
                🎨 AI 创作
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            AI 智能生图
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            使用先进的 AI 技术生成高质量图片，只需输入描述文字，即可创造独特的视觉作品。
          </p>
        </div>

        {/* API Info */}
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-orange-800 dark:text-orange-200">
              <strong>创作提示：</strong>详细描述您想要的画面，包括风格、色彩、构图、氛围等元素，AI 会根据您的描述生成独特图片。
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Prompt Input */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                描述您想要的图片
              </h3>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="请详细描述您想要生成的图片内容，例如：赛博朋克城市夜景，霓虹灯闪烁，未来科技感..."
                className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={isGenerating}
              />

              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {prompt.length}/500 字符
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Ctrl+Enter 快速生成
                </span>
              </div>

              <button
                onClick={generateImage}
                disabled={isGenerating || !prompt.trim()}
                className="w-full mt-4 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    生成中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    开始生成
                  </>
                )}
              </button>
            </div>

            {/* Example Prompts */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                灵感示例
              </h3>
              <div className="space-y-3">
                {promptExamples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => useExamplePrompt(example)}
                    className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors group"
                    disabled={isGenerating}
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white line-clamp-2">
                        {example}
                      </p>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-orange-500 ml-2 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div className="space-y-6">
            {/* Generated Image */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                生成结果
              </h3>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-red-800 dark:text-red-200">
                      <strong>生成失败：</strong>{error}
                    </div>
                  </div>
                </div>
              )}

              {isGenerating ? (
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">AI 正在创作中...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">这可能需要几秒钟时间</p>
                  </div>
                </div>
              ) : generatedImage ? (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={generatedImage}
                      alt="Generated"
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-sm">
                      生成完成
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">提示词：</p>
                    <p className="text-sm text-gray-900 dark:text-white">{prompt}</p>
                  </div>

                  <button
                    onClick={() => downloadImage(generatedImage, prompt)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    下载图片
                  </button>
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-orange-600 dark:text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      输入描述后点击生成
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      AI 将为您创作独特的图片
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Generation History */}
        {generationHistory.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              创作历史
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {generationHistory.map((item, index) => (
                <div key={index} className="group relative">
                  <img
                    src={item.imageUrl}
                    alt={item.prompt}
                    className="w-full h-32 object-cover rounded-lg cursor-pointer group-hover:opacity-90 transition-opacity"
                    onClick={() => {
                      setGeneratedImage(item.imageUrl);
                      setPrompt(item.prompt);
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
              🎨
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">创意无限</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              支持各种风格和主题，从写实到抽象，激发创意灵感
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              ⚡
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">快速生成</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              先进的 AI 技术，几秒钟内生成高质量图片
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              💎
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">高清输出</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              支持 2K 高清分辨率，细节丰富，色彩鲜艳
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}