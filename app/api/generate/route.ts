import { NextRequest, NextResponse } from 'next/server';

// 从环境变量中获取 API 配置
const ARK_API_KEY = process.env.ARK_API_KEY;
const ARK_IMAGE_API_URL = process.env.ARK_IMAGE_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
const ARK_IMAGE_MODEL = process.env.ARK_IMAGE_MODEL || 'ep-20251019074912-dv2b8';

export async function POST(request: NextRequest) {
  try {
    // 检查环境变量
    if (!ARK_API_KEY) {
      throw new Error('火山引擎 API Key 未配置');
    }

    // 解析请求体
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      throw new Error('提示词不能为空且必须是字符串');
    }

    // 验证提示词长度
    if (prompt.length > 1000) {
      throw new Error('提示词过长，请控制在1000字符以内');
    }

    // 构建火山引擎图像生成 API 请求
    const apiPayload = {
      model: ARK_IMAGE_MODEL,
      prompt: prompt.trim(),
      sequential_image_generation: "disabled",
      response_format: "url",
      size: "2K",
      stream: false,
      watermark: true
    };

    console.log('Sending image generation request:', apiPayload);

    // 调用火山引擎图像生成 API
    const response = await fetch(ARK_IMAGE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARK_API_KEY}`,
      },
      body: JSON.stringify(apiPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Volcengine Image API Error:', errorText);

      // 根据不同的错误状态码返回相应的错误信息
      if (response.status === 401) {
        throw new Error('API Key 无效或已过期');
      } else if (response.status === 429) {
        throw new Error('API 调用频率过高，请稍后重试');
      } else if (response.status >= 500) {
        throw new Error('服务器错误，请稍后重试');
      } else {
        throw new Error(`图像生成 API 请求失败: ${response.status}`);
      }
    }

    // 解析 API 响应
    const data = await response.json();
    console.log('Image generation response:', data);

    // 提取图片 URL
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      console.error('Invalid API response structure:', data);
      throw new Error('API 返回结果格式异常，未找到图片 URL');
    }

    // 返回生成结果
    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      prompt: prompt.trim(),
      usage: data.usage,
      model: data.model,
      created: data.created
    });

  } catch (error) {
    console.error('Image generation error:', error);

    // 返回错误信息
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '图像生成过程中发生未知错误'
      },
      { status: 500 }
    );
  }
}