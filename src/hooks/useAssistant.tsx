import { useState, useEffect } from 'react';
import { message } from 'antd';
import { 
  getAssistants, 
  saveAssistants, 
  testAssistantConnection,
  callAssistantAPI
} from '@/services/assistant';
import { Assistant } from '@/types/app/assistant';

export default function useAssistant() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  // 初始化加载助手列表
  useEffect(() => {
    const loadedAssistants = getAssistants();
    setAssistants(loadedAssistants);
    
    // 设置默认助手
    const defaultAssistant = loadedAssistants.find(a => a.isDefault);
    if (defaultAssistant) {
      setSelectedAssistant(defaultAssistant.id);
    }
  }, []);

  // 添加或更新助手
  const saveAssistant = (assistant: Omit<Assistant, 'id' | 'isDefault'>, id?: string) => {
    setLoading(true);
    try {
      let updatedAssistants: Assistant[];
      
      if (id) {
        // 更新现有助手
        updatedAssistants = assistants.map(a => 
          a.id === id ? { ...assistant, id, isDefault: a.isDefault } : a
        );
      } else {
        // 添加新助手
        const newAssistant = {
          ...assistant,
          id: Date.now().toString(),
          isDefault: assistants.length === 0
        };
        updatedAssistants = [...assistants, newAssistant];
      }

      saveAssistants(updatedAssistants);
      setAssistants(updatedAssistants);
      message.success(id ? '助手已更新' : '助手已添加');
      return true;
    } catch (error) {
      message.error('保存失败');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 删除助手
  const deleteAssistant = (id: string) => {
    const updatedAssistants = assistants.filter(a => a.id !== id);
    saveAssistants(updatedAssistants);
    setAssistants(updatedAssistants);
    
    // 如果删除的是当前选中的助手，清空选中状态
    if (selectedAssistant === id) {
      setSelectedAssistant(null);
    }
    
    message.success('助手已删除');
  };

  // 设置默认助手
  const setDefaultAssistant = (id: string) => {
    const updated = assistants.map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    saveAssistants(updated);
    setAssistants(updated);
    setSelectedAssistant(id);
    message.success('默认助手已更新');
  };

  // 测试助手连接
  const testConnection = async (assistant: Assistant) => {
    setTesting(true);
    const result = await testAssistantConnection(assistant);
    setTesting(false);
    return result;
  };

  // 调用助手API
  const callAssistant = async (
    messages: Array<{role: string; content: string}>,
    options?: {
      stream?: boolean;
      temperature?: number;
      max_tokens?: number;
    }
  ) => {
    if (!selectedAssistant) {
      message.error('请先选择助手');
      return null;
    }

    const assistant = assistants.find(a => a.id === selectedAssistant);
    if (!assistant) {
      message.error('助手不存在');
      return null;
    }

    return callAssistantAPI(assistant, messages, options);
  };

  return {
    assistants,
    selectedAssistant,
    setSelectedAssistant,
    loading,
    testing,
    saveAssistant,
    deleteAssistant,
    setDefaultAssistant,
    testConnection,
    callAssistant
  };
}
