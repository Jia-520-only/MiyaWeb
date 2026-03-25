/**
 * AI Service - 弥娅 AI 问答服务
 * 基于网站内容回答用户问题
 */

import { getContent } from './contentStorage'

// AI 配置 - 请在这里配置你的 API Key
const AI_CONFIG = {
  // API Key（需要替换为你的实际 API Key）
  apiKey: import.meta.env.VITE_AI_API_KEY || '',

  // API 端点（根据你使用的 AI 服务修改）
  // OpenAI: https://api.openai.com/v1/chat/completions
  // 通义千问: https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
  // 讯飞星火: https://spark-api.xf-yun.com/v3.5/chat
  apiEndpoint: import.meta.env.VITE_AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions',

  // 模型名称
  // OpenAI: gpt-3.5-turbo, gpt-4
  // 通义千问: qwen-turbo, qwen-plus, qwen-max
  // 讯飞星火: spark-lite, spark-pro, spark-max
  model: import.meta.env.VITE_AI_MODEL || 'gpt-3.5-turbo'
}

// 获取网站内容作为知识库
function getWebsiteContent(): string {
  try {
    let content = '这是 jiaandmiya 网站的内容：\n\n'

    // 获取各个页面的内容
    const pages = ['about', 'culture', 'footer-info', 'nav-items']

    pages.forEach(page => {
      const pageContent = getContent(page)
      if (pageContent) {
        content += `\n=== ${page} ===\n${pageContent}\n`
      }
    })

    // 添加网站介绍
    content += '\n=== 网站介绍 ===\n'
    content += 'jiaandmiya 是一个简约、技术、二次元、社区的网站。\n'
    content += '网站包含：技术笔记、文化区、社区、免费资源等板块。\n'
    content += '弥娅（Miya）是网站的虚拟管家，负责为用户解答问题。\n'

    return content
  } catch (error) {
    console.error('获取网站内容失败:', error)
    return '网站内容加载失败'
  }
}

/**
 * 构建 AI 提示词
 */
function buildPrompt(userQuestion: string, imageDescription?: string): string {
  const websiteContent = getWebsiteContent()

  let prompt = `你是弥娅（Miya），jiaandmiya 网站的虚拟管家。

${websiteContent}

你的职责：
1. 基于网站内容回答用户的问题
2. 语气亲切友好，符合二次元风格
3. 如果问题超出网站内容范围，委婉告知
4. 回答简洁明了，不要太冗长

`

  if (imageDescription) {
    prompt += `\n用户上传了一张图片，描述如下：${imageDescription}\n`
    prompt += `用户关于图片的问题：${userQuestion}\n\n`
    prompt += `请基于图片和网站内容回答用户的问题。`
  } else {
    prompt += `\n用户的问题：${userQuestion}\n\n`
    prompt += `请基于网站内容回答用户的问题。`
  }

  return prompt
}

/**
 * 调用 AI API
 */
async function callAI(messages: Array<{ role: string; content: string }>): Promise<string> {
  if (!AI_CONFIG.apiKey) {
    throw new Error('AI API Key 未配置，请在 .env 文件中配置 VITE_AI_API_KEY')
  }

  try {
    const response = await fetch(AI_CONFIG.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`AI API 调用失败: ${response.status} - ${error}`)
    }

    const data = await response.json()

    // 根据不同的 AI 服务，提取返回的内容
    // OpenAI: data.choices[0].message.content
    // 通义千问: data.output.text
    // 讯飞星火: data.payload.choices.text[0].content
    const aiContent = data.choices?.[0]?.message?.content ||
                      data.output?.text ||
                      data.payload?.choices?.text?.[0]?.content ||
                      ''

    return aiContent.trim()
  } catch (error) {
    console.error('AI API 调用失败:', error)
    throw error
  }
}

/**
 * 分析图片
 * 使用 OpenAI Vision API（兼容格式）分析图片内容
 * 如果 API 不支持 Vision，则使用备用文本描述
 */
async function analyzeImage(imageBase64: string): Promise<string> {
  if (!AI_CONFIG.apiKey) {
    return '用户上传了一张图片（AI 服务未配置，无法分析）'
  }

  try {
    const response = await fetch(AI_CONFIG.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请用简短的中文描述这张图片的内容。'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:')
                    ? imageBase64
                    : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 200
      })
    })

    if (!response.ok) {
      // Vision API 不可用，返回备用描述
      return '用户上传了一张图片'
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content?.trim() || '用户上传了一张图片'
  } catch {
    return '用户上传了一张图片'
  }
}

/**
 * 主要的 AI 问答函数
 */
export async function askMiya(question: string, image?: string): Promise<string> {
  try {
    let imageDescription: string | undefined

    // 如果有图片，先分析图片
    if (image) {
      imageDescription = await analyzeImage(image)
    }

    // 构建提示词
    const systemPrompt = buildPrompt(question, imageDescription)

    // 准备消息
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: question
      }
    ]

    // 如果有图片，添加图片描述到用户消息
    if (imageDescription) {
      messages[1].content += `\n\n（用户上传了一张图片：${imageDescription}）`
    }

    // 调用 AI
    const response = await callAI(messages)

    return response
  } catch (error) {
    console.error('AI 问答失败:', error)
    throw error
  }
}

/**
 * 检查 AI 是否配置
 */
export function isAIConfigured(): boolean {
  return !!AI_CONFIG.apiKey
}

/**
 * 获取 AI 配置状态
 */
export function getAIConfigStatus(): { configured: boolean; apiKey: string; endpoint: string; model: string } {
  return {
    configured: !!AI_CONFIG.apiKey,
    apiKey: AI_CONFIG.apiKey ? '已配置' : '未配置',
    endpoint: AI_CONFIG.apiEndpoint,
    model: AI_CONFIG.model
  }
}
