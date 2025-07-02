import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Card } from 'antd';
import { getEnvConfigListAPI, updateEnvConfigDataAPI } from '@/api/Project';
import { EnvConfig } from '@/types/app/project';
import Title from '@/components/Title';
import { FormOutlined } from '@ant-design/icons';
import { titleSty } from '@/styles/sty';

export default () => {
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
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
      setBtnLoading(true);
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
      getList();
      setIsModalOpen(false);
      setEditItem(null);
      setBtnLoading(false);
    } catch (e) {
      // 校验失败
      setBtnLoading(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'center' as const },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '备注', dataIndex: 'notes', key: 'notes' },
    {
      title: '配置内容',
      dataIndex: 'value',
      key: 'value',
      render: (value: object) => (
        <pre className="whitespace-pre-wrap break-all bg-gray-50 dark:bg-[#222] p-2 rounded text-xs overflow-auto">{JSON.stringify(value, null, 2)}</pre>
      ),
    },
    {
      title: '操作',
      key: 'action',
      align: 'center' as const,
      render: (_: any, record: EnvConfig) => (
        <Button icon={<FormOutlined />} onClick={() => handleEdit(record)} />
      ),
    },
  ];

  return (
    <div>
      <Title value="环境配置" />

      <Card className={`${titleSty} min-h-[calc(100vh-160px)]`}>
        <Table
          rowKey="id"
          dataSource={list}
          columns={columns}
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={`编辑配置`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} size='large'>
          <Form.Item
            name="value"
            rules={[{ required: true, message: '请输入配置内容' }]}
            className='mb-4'
          >
            <Input.TextArea rows={10} placeholder="请输入JSON格式内容" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={btnLoading} className="w-full">保存</Button>
        </Form>
      </Modal>
    </div>
  );
}