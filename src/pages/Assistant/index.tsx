import {
  Button,
  Card,
  Form,
  Input,
  List,
  message,
  Modal,
  Popconfirm,
} from 'antd';
import { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import Title from '@/components/Title';
import {
  getAssistantListAPI,
  editAssistantDataAPI,
  delAssistantDataAPI,
  setDefaultAssistantDataAPI,
  addAssistantDataAPI,
  processDocument,
} from '@/api/Assistant.ts';
import { Assistant } from '@/types/app/assistant';

export default () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [testing, setTesting] = useState(false);
  const [adding, setAdding] = useState(false);

  // 获取助手列表
  const handleListData = async () => {
    try {
      const { data } = await getAssistantListAPI();
      setAssistants(data);
    } catch (error) {
      console.error('获取助手列表失败', error);
    }
  };

  useEffect(() => {
    handleListData();
  }, []);

  // 提交表单
  const handleSubmit = async () => {
    setAdding(true);
    const values: Assistant = await form.validateFields();
    if (values.id) {
      await editAssistantDataAPI({ ...values });
    } else {
      await addAssistantDataAPI({ ...values });
    }
    setIsModalOpen(false);
    form.resetFields();
    setEditingId(null);
    await handleListData();
    message.success('🎉 助手保存成功');
    setAdding(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await delAssistantDataAPI(id);
      await handleListData();
    } catch (error) {
      console.error('🎉 删除助手失败', error);
      message.error('🎉 删除助手失败');
    }
  };

  const setDefaultAssistant = async (id: number) => {
    try {
      await setDefaultAssistantDataAPI(id);
      await handleListData();
    } catch (error) {
      console.error('设置默认助手失败', error);
      message.error('🎉 设置默认助手失败');
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const result = await processDocument({
        content: '测试连接',
        operation: 'test',
      });
      if (result) {
        message.success('连接成功');
      } else {
        message.error('连接失败');
      }
      setTesting(false);
    } catch (error) {
      console.error('测试助手连接失败', error);
      message.error('连接失败');
      setTesting(false);
    }
  };

  return (
    <div>
      <Title value="助手管理">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          添加助手
        </Button>
      </Title>

      <Card>
        <List
          dataSource={assistants}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  onClick={() => {
                    form.setFieldsValue(item);
                    setEditingId(item.id);
                    setIsModalOpen(true);
                  }}
                >
                  编辑
                </Button>,
                <Button
                  type="link"
                  onClick={() => testConnection()}
                  loading={testing}
                >
                  测试连接
                </Button>,
                <Button
                  type={item.isDefault ? 'primary' : 'default'}
                  onClick={() => setDefaultAssistant(item.id)}
                >
                  {item.isDefault ? '默认助手' : '设为默认'}
                </Button>,
                <Popconfirm
                  title="警告"
                  description="你确定要删除吗"
                  okText="确定"
                  cancelText="取消"
                  onConfirm={() => handleDelete(item.id!)}
                >
                  <span>删除</span>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={item.name}
                description={`${item.baseUrl} (模型: ${item.modelId})`}
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title={editingId ? '编辑助手' : '添加助手'}
        open={isModalOpen}
        onOk={handleSubmit}
        loading={adding}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingId(null);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="助手名称"
            rules={[{ required: true, message: '请输入助手名称' }]}
          >
            <Input placeholder="例如: DeepSeek" />
          </Form.Item>

          <Form.Item
            name="baseUrl"
            label="API基础地址"
            rules={[{ required: true, message: '请输入API基础地址' }]}
          >
            <Input placeholder="例如: https://api.deepseek.com" />
          </Form.Item>

          <Form.Item
            name="apiKey"
            label="API密钥"
            rules={[{ required: true, message: '请输入API密钥' }]}
          >
            <Input.Password placeholder="输入API密钥" />
          </Form.Item>

          <Form.Item
            name="modelId"
            label="模型ID"
            rules={[{ required: true, message: '请输入模型ID' }]}
          >
            <Input placeholder="例如: deepseek-chat" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
