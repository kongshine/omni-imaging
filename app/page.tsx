export default function Home() {
  const features = [
    {
      title: "图片压缩",
      description: "快速压缩图片文件大小，保持清晰度的同时减小文件体积",
      icon: "🗜️",
      href: "/compress",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "抠图去背景",
      description: "智能识别并移除图片背景，支持人像、物品等多种场景",
      icon: "✂️",
      href: "/remove-bg",
      color: "from-green-500 to-green-600"
    },
    {
      title: "图片识别",
      description: "AI智能识别图片内容，包括文字、物体、场景等元素",
      icon: "🔍",
      href: "/recognize",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "AI 生图",
      description: "基于文本描述生成高质量图片，支持多种风格和效果",
      icon: "🎨",
      href: "/generate",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="pt-8 pb-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            图片智能处理中心
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            集成多种AI图片处理功能，提供专业的图片编辑、识别和生成服务
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <a
                key={feature.href}
                href={feature.href}
                className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="p-8">
                  <div className="flex items-center mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-transparent bg-clip-text bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 dark:group-hover:from-white dark:group-hover:to-gray-300 transition-all duration-300">
                        {feature.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="mt-6 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-transparent bg-clip-text bg-gradient-to-r group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-300">
                    <span>立即体验</span>
                    <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Features Grid Alternative */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => (
              <a
                key={feature.href}
                href={feature.href}
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center text-xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {feature.title}
                </h4>
              </a>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © 2024 图片智能处理中心. 基于 Next.js 和 AI 技术构建
          </p>
        </div>
      </footer>
    </div>
  );
}
