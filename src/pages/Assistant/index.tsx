import { Button, Card, Form, Input, List, Modal } from 'antd';
import { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import Title from '@/components/Title';
import useAssistant from '@/hooks/useAssistant';

export default () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const {
    assistants,
    testing,
    saveAssistant,
    deleteAssistant,
    setDefaultAssistant,
    testConnection
  } = useAssistant();

  // 提交表单
  const handleSubmit = () => {
    form.validateFields().then(values => {
      const success = saveAssistant(values, editingId || undefined);
      if (success) {
        setIsModalOpen(false);
        form.resetFields();
        setEditingId(null);
      }
    });
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
                <Button type="link" onClick={() => {
                  form.setFieldsValue(item);
                  setEditingId(item.id);
                  setIsModalOpen(true);
                }}>
                  编辑
                </Button>,
                <Button 
                  type="link" 
                  onClick={() => testConnection(item)}
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
                <Button 
                  type="link" 
                  danger 
                  onClick={() => deleteAssistant(item.id)}
                >
                  删除
                </Button>
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
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingId(null);
        }}
      >
        <Form form={form} layout="vertical">
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
