import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Card } from 'antd';
import { getEnvConfigListAPI, updateEnvConfigDataAPI } from '@/api/Project';
import { EnvConfig } from '@/types/app/project';
import Title from '@/components/Title';
import { FormOutlined } from '@ant-design/icons';

export default () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<EnvConfig[]>([]);
  const [editItem, setEditItem] = useState<EnvConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 获取环境配置列表
  const getList = async () => {
    setLoading(true);
    try {
      const { data } = await getEnvConfigListAPI();
      setList(data);
    } catch (e) {
      // 错误处理
    }
    setLoading(false);
  };

  useEffect(() => {
    getList();
  }, []);

  // 打开编辑弹窗
  const handleEdit = (item: EnvConfig) => {
    setEditItem(item);
    setIsModalOpen(true);
    form.setFieldsValue({
      value: JSON.stringify(item.value, null, 2),
    });
  };

  // 保存编辑
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      let jsonValue;
      try {
        jsonValue = JSON.parse(values.value);
      } catch (e) {
        message.error('请输入合法的JSON格式');
        return;
      }
      await updateEnvConfigDataAPI({ ...editItem!, value: jsonValue });
      message.success('保存成功');
      setIsModalOpen(false);
      setEditItem(null);
      getList();
    } catch (e) {
      // 校验失败
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'center' as const },
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '配置内容',
      dataIndex: 'value',
      key: 'value',
      render: (value: object) => (
        <pre className="max-w-[400px] whitespace-pre-wrap break-all bg-gray-50 dark:bg-[#222] p-2 rounded text-xs overflow-auto">{JSON.stringify(value, null, 2)}</pre>
      ),
    },
    { title: '备注', dataIndex: 'notes', key: 'notes' },
    {
      title: '操作',
      key: 'action',
      align: 'center' as const,
      render: (_: any, record: EnvConfig) => (
        <Button icon={<FormOutlined />} onClick={() => handleEdit(record)}>
          修改
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title value="环境配置" />
      
      <Card className="my-2 overflow-scroll">
        <Table
          rowKey="id"
          dataSource={list}
          columns={columns}
          loading={loading}
          pagination={false}
        />
      </Card>
      <Modal
        title={`编辑配置 - ${editItem?.name}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="配置内容 (JSON)"
            name="value"
            rules={[{ required: true, message: '请输入配置内容' }]}
          >
            <Input.TextArea rows={10} placeholder="请输入JSON格式内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}