import { useEffect, useState, useRef } from 'react';
import { Table, Button, Modal, Form, message, Card, Tabs } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';

import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';

import Title from '@/components/Title';
import { getEnvConfigListAPI, updateEnvConfigDataAPI, getPageConfigListAPI, updatePageConfigDataAPI } from '@/api/Config';
import { Config } from '@/types/app/config';
import { titleSty } from '@/styles/sty';

interface Props {
  open: boolean;
  onCancel: () => void;
  onSave: () => void;
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  onFormat: () => void;
  loading: boolean;
  title: string;
  form: FormInstance;
}

function ConfigEditModal({ open, onCancel, onSave, value, error, onChange, onFormat, loading, title, form }: Props) {
  return (
    <Modal title={title} open={open} onCancel={onCancel} width={1000} footer={null}>
      <Form form={form} layout="vertical" onFinish={onSave} size="large">
        <Form.Item name="value" rules={[{ required: true, message: '请输入配置内容' }]} className="mb-4" validateStatus={error ? 'error' : ''} help={error ? `JSON格式错误: ${error}` : ''}>
          <CodeMirror value={value} extensions={[json()]} onChange={onChange} theme={document.body.classList.contains('dark') ? 'dark' : 'light'} basicSetup={{ lineNumbers: true, foldGutter: true }} style={error ? { border: '1px solid #ff4d4f', borderRadius: 6 } : { borderRadius: 6 }} />
        </Form.Item>

        <Button onClick={onFormat} className="w-full mb-2">
          格式化
        </Button>
        <Button type="primary" htmlType="submit" loading={loading} className="w-full">
          保存配置
        </Button>
      </Form>
    </Modal>
  );
}

const tabConfig = {
  env: {
    label: '环境配置',
    getList: getEnvConfigListAPI,
    update: async (item: Config, value: object) => updateEnvConfigDataAPI({ ...item, value }),
    modalTitle: '编辑配置',
  },
  page: {
    label: '页面配置',
    getList: getPageConfigListAPI,
    update: async (item: Config, value: object) => updatePageConfigDataAPI(Number(item.id), value),
    modalTitle: '编辑页面配置',
  },
};

export default () => {
  // 合并状态
  const [activeTab, setActiveTab] = useState<'env' | 'page'>('env');
  const [data, setData] = useState<{ [key: string]: Config[] }>({ env: [], page: [] });
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({ env: false, page: false });
  const [editItem, setEditItem] = useState<Config | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonValue, setJsonValue] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);
  const formRef = useRef<{ [key: string]: FormInstance[] }>({ env: Form.useForm(), page: Form.useForm() });

  // 获取配置列表
  const fetchList = async (type: 'env' | 'page') => {
    setLoading((l) => ({ ...l, [type]: true }));
    try {
      const { data: list } = await tabConfig[type].getList();
      setData((d) => ({ ...d, [type]: list }));
    } catch (e) {
      console.error(e);
    }
    setLoading((l) => ({ ...l, [type]: false }));
  };

  useEffect(() => {
    fetchList(activeTab);
  }, [activeTab]);

  // 打开编辑弹窗
  const handleEdit = (item: Config) => {
    setEditItem(item);
    setIsModalOpen(true);
    const str = JSON.stringify(item.value, null, 2);
    setJsonValue(str);
    formRef.current[activeTab][0].setFieldsValue({ value: str });
    setJsonError(null);
  };

  // 保存编辑
  const handleSave = async () => {
    try {
      setBtnLoading(true);
      const values = await formRef.current[activeTab][0].validateFields();
      let parsed;
      try {
        parsed = JSON.parse(values.value);
      } catch (e) {
        console.error(e);
        message.error('请输入合法的JSON格式');
        setBtnLoading(false);
        return;
      }
      await tabConfig[activeTab].update(editItem!, parsed);
      message.success('保存成功');
      fetchList(activeTab);
      setIsModalOpen(false);
      setEditItem(null);
      setBtnLoading(false);
    } catch (e) {
      console.error(e);
      setBtnLoading(false);
    }
  };

  // JSON 输入变更时校验
  const handleJsonChange = (value: string) => {
    setJsonValue(value);
    formRef.current[activeTab][0].setFieldsValue({ value });
    try {
      JSON.parse(value);
    } catch (error) {
      console.error(error);
    }
  };

  // 格式化 JSON
  const handleFormatJson = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(jsonValue), null, 2);
      setJsonValue(formatted);
      formRef.current[activeTab][0].setFieldsValue({ value: formatted });
      setJsonError(null);
    } catch (error) {
      console.error(error);
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
      render: (value: object) => <>{activeTab === 'page' ? <span className="text-sm text-gray-500">内容过多，不易展示</span> : <pre className="min-w-[200px] whitespace-pre-wrap break-all bg-slate-50 dark:bg-slate-800 p-2 rounded text-xs overflow-auto">{JSON.stringify(value, null, 2)}</pre>}</>,
    },
    {
      title: '操作',
      key: 'action',
      align: 'center' as const,
      render: (_: unknown, record: Config) => <Button icon={<FormOutlined />} onClick={() => handleEdit(record)} />,
    },
  ];

  return (
    <div>
      <Title value="项目配置" />

      <Card className={`${titleSty} min-h-[calc(100vh-200px)]`}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'env' | 'page')}
          items={Object.keys(tabConfig).map((key) => ({
            key,
            label: tabConfig[key as 'env' | 'page'].label,
            children: <Table rowKey="id" dataSource={data[key]} columns={columns} loading={loading[key]} pagination={false} />,
          }))}
          className="[&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav-wrap]:justify-center"
        />
      </Card>

      <ConfigEditModal key={activeTab} open={isModalOpen} onCancel={() => setIsModalOpen(false)} onSave={handleSave} value={jsonValue} error={jsonError} onChange={handleJsonChange} onFormat={handleFormatJson} loading={btnLoading} title={editItem ? tabConfig[activeTab].modalTitle : ''} form={formRef.current[activeTab][0]} />
    </div>
  );
};
