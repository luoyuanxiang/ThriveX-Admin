import { Button, Card, Form, Input, List, Modal, Popconfirm, Select } from 'antd';
import { useState } from 'react';
import { DeleteOutlined, FormOutlined, PlusOutlined } from '@ant-design/icons';
import Title from '@/components/Title';
import useAssistant from '@/hooks/useAssistant';

export default () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState<string | null>(null);

  const {
    list,
    testingMap,
    saveAssistant,
    delAssistantData,
    setDefaultAssistant,
    testConnection
  } = useAssistant();

  // 提交表单
  const handleSubmit = () => {
    form.validateFields().then(values => {
      saveAssistant({ ...values, id }).then(success => {
        if (success) {
          setIsModalOpen(false);
          form.resetFields();
          setId(null);
        }
      });
    });
  };

  return (
    <div>
      <Title value="助手管理">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >添加助手</Button>
      </Title>

      <Card>
        <List
          key="id"
          dataSource={list}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="test"
                  type="link"
                  onClick={() => testConnection(item)}
                  loading={testingMap[item.id]}
                >{testingMap[item.id] ? '测试中...' : '测试连接'}</Button>,

                <Button key="edit" onClick={() => {
                  form.setFieldsValue(item);
                  setId(item.id);
                  setIsModalOpen(true);
                }} icon={<FormOutlined />} />,

                <Popconfirm
                  key="delete"
                  title="您确定要删除这个助手吗？"
                  onConfirm={() => delAssistantData(+item.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button key="delete" type="primary" color="danger" danger icon={<DeleteOutlined />} />
                </Popconfirm>,

                <Button
                  key="default"
                  type={item.isDefault ? 'primary' : 'default'}
                  onClick={() => setDefaultAssistant(+item.id)}
                >{item.isDefault ? '默认助手' : '设为默认'}</Button>
              ]}
            >
              <List.Item.Meta title={item.name} description={`模型: ${item.model}`} />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title={id ? '编辑助手' : '添加助手'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setId(null);
        }}
      >
        <Form form={form} layout="vertical" size="large">
          <Form.Item
            name="name"
            label="助手名称"
            rules={[{ required: true, message: '请输入助手名称' }]}
          >
            <Input placeholder="DeepSeek" />
          </Form.Item>

          <Form.Item
            name="key"
            label="API密钥"
            rules={[{ required: true, message: '请输入API密钥' }]}
          >
            <Input.Password placeholder="输入API密钥" />
          </Form.Item>

          <Form.Item
            name="model"
            label="模型"
            rules={[{ required: true, message: '请输入模型' }]}
          >
            <Select placeholder="选择模型">
              <Select.Option value="deepseek-chat">deepseek-chat</Select.Option>
              <Select.Option value="deepseek-reasoner">deepseek-reasoner</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
