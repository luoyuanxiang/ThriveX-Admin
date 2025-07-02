import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, message, Card } from 'antd';
import { getEnvConfigListAPI, updateEnvConfigDataAPI } from '@/api/Project';
import { EnvConfig } from '@/types/app/project';
import Title from '@/components/Title';
import { FormOutlined } from '@ant-design/icons';
import { titleSty } from '@/styles/sty';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';

export default () => {
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [list, setList] = useState<EnvConfig[]>([]);
  const [editItem, setEditItem] = useState<EnvConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonValue, setJsonValue] = useState('');

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
    const str = JSON.stringify(item.value, null, 2);
    setJsonValue(str);
    form.setFieldsValue({ value: str });
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

  // JSON 输入变更时校验
  const handleJsonChange = (value: string) => {
    setJsonValue(value);
    form.setFieldsValue({ value });
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  // 格式化 JSON
  const handleFormatJson = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(jsonValue), null, 2);
      setJsonValue(formatted);
      form.setFieldsValue({ value: formatted });
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message);
      message.error('格式化失败：' + err.message);
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
        <pre className="min-w-[200px] whitespace-pre-wrap break-all bg-slate-50 dark:bg-slate-800 p-2 rounded text-xs overflow-auto">{JSON.stringify(value, null, 2)}</pre>
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
            validateStatus={jsonError ? 'error' : ''}
            help={jsonError ? `JSON格式错误: ${jsonError}` : ''}
          >
            <CodeMirror
              value={jsonValue}
              extensions={[json()]}
              onChange={handleJsonChange}
              theme={document.body.classList.contains('dark') ? 'dark' : 'light'}
              basicSetup={{ lineNumbers: true, foldGutter: true }}
              style={jsonError ? { border: '1px solid #ff4d4f', borderRadius: 6 } : { borderRadius: 6 }}
            />
          </Form.Item>

          <Button onClick={handleFormatJson} className="w-full mb-2">格式化</Button>
          <Button type="primary" htmlType="submit" loading={btnLoading} className="w-full">保存配置</Button>
        </Form>
      </Modal>
    </div>
  );
}