const OPENROUTER_API_KEY = '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'

export interface AIRequest {
  model: string
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  temperature?: number
  max_tokens?: number
}

export interface AIResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class OpenRouterService {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1'

  constructor() {
    this.apiKey = OPENROUTER_API_KEY
  }

  async generateCode(prompt: string, language: string = 'javascript'): Promise<string> {
    const request: AIRequest = {
      model: 'anthropic/claude-3-haiku',
      messages: [
        {
          role: 'system',
          content: `You are an expert ${language} developer. Generate clean, efficient, and well-documented code.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }

    try {
      const response = await this.makeRequest(request)
      return response.choices[0].message.content
    } catch (error) {
      console.error('OpenRouter API error:', error)
      throw new Error('Failed to generate code')
    }
  }

  async generateText(prompt: string, type: 'blog' | 'email' | 'social' | 'creative' = 'creative'): Promise<string> {
    const systemPrompts = {
      blog: 'You are a professional content writer. Write engaging, SEO-optimized blog content.',
      email: 'You are a professional copywriter. Write persuasive, conversion-focused email content.',
      social: 'You are a social media expert. Write engaging, viral-worthy social media content.',
      creative: 'You are a creative writer. Write imaginative, compelling creative content.'
    }

    const request: AIRequest = {
      model: 'anthropic/claude-3-haiku',
      messages: [
        {
          role: 'system',
          content: systemPrompts[type]
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500
    }

    try {
      const response = await this.makeRequest(request)
      return response.choices[0].message.content
    } catch (error) {
      console.error('OpenRouter API error:', error)
      throw new Error('Failed to generate text')
    }
  }

  private async makeRequest(request: AIRequest): Promise<AIResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AURION SaaS'
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
    }

    return await response.json()
  }
}

export const openRouterService = new OpenRouterService()