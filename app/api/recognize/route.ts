import { NextRequest, NextResponse } from 'next/server';

// 从环境变量中获取 API 配置
const ARK_API_KEY = process.env.ARK_API_KEY;
const ARK_API_URL = process.env.ARK_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const ARK_MODEL = process.env.ARK_MODEL || 'ep-20251019072100-m5995';

export async function POST(request: NextRequest) {
  try {
    // 检查环境变量
    if (!ARK_API_KEY) {
      throw new Error('火山引擎 API Key 未配置');
    }

    // 解析请求体
    const body = await request.json();
    const { image, format } = body;

    if (!image) {
      throw new Error('图片数据不能为空');
    }

    // 构建火山引擎 API 请求
    const apiPayload = {
      model: ARK_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "请详细识别这张图片的内容，包括：\n1. 图片中的主要物体和元素\n2. 场景描述\n3. 文字内容（如果有）\n4. 颜色和风格\n5. 其他值得注意的细节\n\n请用中文回答，提供尽可能详细和准确的描述。"
            },
            {
              type: "image_url",
              image_url: {
                url: image
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    };

    // 调用火山引擎 API
    const response = await fetch(ARK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ARK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Volcengine API Error:', errorText);

      // 根据不同的错误状态码返回相应的错误信息
      if (response.status === 401) {
        throw new Error('API Key 无效或已过期');
      } else if (response.status === 429) {
        throw new Error('API 调用频率过高，请稍后重试');
      } else if (response.status >= 500) {
        throw new Error('服务器错误，请稍后重试');
      } else {
        throw new Error(`API 请求失败: ${response.status}`);
      }
    }

    // 解析 API 响应
    const data = await response.json();

    // 提取识别结果
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('API 返回结果格式异常');
    }

    // 返回识别结果
    return NextResponse.json({
      success: true,
      content: content,
      usage: data.usage,
      model: data.model
    });

  } catch (error) {
    console.error('Image recognition error:', error);

    // 返回错误信息
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '识别过程中发生未知错误'
      },
      { status: 500 }
    );
  }
}