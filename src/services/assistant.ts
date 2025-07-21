import { message } from 'antd';
import { Assistant } from '@/types/app/assistant';

const url = 'https://api.deepseek.com'

// 测试助手连接
export const testAssistantConnection = async (assistant: Assistant) => {
  try {
    // 确保baseURL以/v1结尾
    const baseUrl = url.endsWith('/v1') 
      ? url 
      : `${url.replace(/\/+$/, '')}/v1`;
    
    // 确保API密钥没有多余空格
    const apiKey = assistant.key.trim();
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      body: JSON.stringify({
        model: assistant.model || 'moonshot-v1-8k',
        messages: [
          { 
            role: 'system', 
            content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。'
          },
          { role: 'user', content: '测试连接' }
        ],
        temperature: 0.3
      })
    });

    if (response.ok) {
      message.success('测试连接成功');
      return true;
    } else {
      message.error('测试连接失败');
      return false;
    }
  } catch (error) {
    console.error(error);
    message.error('测试连接失败');
    return false;
  }
};

// 调用助手API
export const callAssistantAPI = async (
  assistant: Assistant,
  messages: Array<{role: string; content: string}>,
  options: {
    stream?: boolean;
    temperature?: number;
    max_tokens?: number;
  } = {}
) => {
  try {
    // 确保baseURL以/v1结尾
    const baseUrl = url.endsWith('/v1') 
      ? url 
      : `${url.replace(/\/+$/, '')}/v1`;
    
    // 确保API密钥没有多余空格
    const apiKey = assistant.key.trim();
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      body: JSON.stringify({
        model: assistant.model || 'moonshot-v1-8k',
        messages,
        stream: options.stream ?? false,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.max_tokens,
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    if (options.stream) {
      return response.body?.getReader();
    }
    
    return await response.json();
  } catch (error) {
    message.error('调用助手API失败');
    throw error;
  }
};
