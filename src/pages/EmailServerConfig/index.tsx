import { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, InputNumber, message, Modal, notification, Popconfirm, Row, Switch, Table } from 'antd';
import { DeleteOutlined, FormOutlined, SendOutlined } from '@ant-design/icons';

import { titleSty } from '@/styles/sty';
import Title from '@/components/Title';
import { addEmailServerConfigDataAPI, delEmailServerConfigDataAPI, editEmailServerConfigDataAPI, getEmailServerConfigDataAPI, getEmailServerConfigListAPI, setEmailServerConfigDefaultAPI, testEmailServerConfigAPI } from '@/api/EmailServerConfig.ts';
import type { EmailServerConfig } from '@/types/app/emailServerConfig';
import { ColumnType } from 'antd/es/table';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';

export default () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [emailServerConfigList, setEmailServerConfigList] = useState<EmailServerConfig[]>([]);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [emailServerConfig, setEmailServerConfig] = useState<EmailServerConfig>({} as EmailServerConfig);
  const [isMethod, setIsMethod] = useState<'create' | 'edit'>('create');
  const [form] = Form.useForm();
  const [value, setValue] = useState<string>('');

  const columns: ColumnType<EmailServerConfig>[] = [
    {
      title: '配置名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: 'SMT服务器地址',
      dataIndex: 'host',
      key: 'host',
      align: 'center',
    },
    {
      title: 'SMTP服务器端口',
      dataIndex: 'port',
      key: 'port',
      align: 'center',
    },
    {
      title: '发送者邮箱地址',
      dataIndex: 'username',
      key: 'username',
      align: 'center',
    },
    {
      title: '是否启用SSL',
      dataIndex: 'sslEnable',
      key: 'sslEnable',
      align: 'center',
      render: (value: boolean) => <Switch checked={value} />,
    },
    {
      title: '是否启用TLS',
      dataIndex: 'tlsEnable',
      key: 'tlsEnable',
      align: 'center',
      render: (value: boolean) => <Switch disabled={true} checked={value} />,
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      align: 'center',
      render: (value: boolean) => <Switch disabled={true} checked={value} />,
    },
    {
      title: '是否为默认配置',
      dataIndex: 'isDefault',
      key: 'isDefault',
      align: 'center',
      render: (value: boolean, record: EmailServerConfig) => <Switch checked={value} onClick={() => setEmailServer(record.id!)} />,
    },
    {
      title: '扩展配置',
      dataIndex: 'ext',
      key: 'ext',
      align: 'center',
      render: (value: object) => <>{<pre className="min-w-[200px] whitespace-pre-wrap break-all bg-slate-50 dark:bg-slate-800 p-2 rounded text-xs overflow-auto">{JSON.stringify(value, null, 2)}</pre>}</>,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      align: 'center',
      render: (_: string, record: EmailServerConfig) => (
        <div className="flex justify-center space-x-2">
          <Button title={'编辑'} type="text" onClick={() => editFootprintData(record.id!)} icon={<FormOutlined className="text-primary" />} />
          <Button title={'测试连接'} type="text" onClick={() => testEmailServer(record.id!)} icon={<SendOutlined className="text-primary" />} />
          <Popconfirm title="警告" description="你确定要删除吗" okText="确定" cancelText="取消" onConfirm={() => delFootprintData(record.id!)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const testEmailServer = async (id: number) => {
    try {
      await testEmailServerConfigAPI(id);
      notification.success({ message: '🎉 测试邮件服务成功' });
    } catch (error) {
      console.error(error);
    }
  };

  const setEmailServer = async (id: number) => {
    try {
      await setEmailServerConfigDefaultAPI(id);
      await getFootprintList()
      notification.success({ message: '🎉 启用邮件服务成功' });
    } catch (error) {
      console.error(error);
    }
  };

  const getFootprintList = async () => {
    try {
      const { data } = await getEmailServerConfigListAPI('');
      setEmailServerConfigList(data as EmailServerConfig[]);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    getFootprintList();
  }, []);

  const reset = () => {
    setIsMethod('create');
    form.resetFields();
    setEmailServerConfig({} as EmailServerConfig);
    setIsModelOpen(false);
  };

  const delFootprintData = async (id: number) => {
    setLoading(true);

    try {
      await delEmailServerConfigDataAPI(id);
      notification.success({ message: '🎉 删除邮件服务成功' });
      getFootprintList();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const addFootprintData = () => {
    setIsMethod('create');
    setIsModelOpen(true);
    form.resetFields();
    setEmailServerConfig({} as EmailServerConfig);
  };

  const editFootprintData = async (id: number) => {
    try {
      setEditLoading(true);

      setIsMethod('edit');
      setIsModelOpen(true);

      const { data } = await getEmailServerConfigDataAPI(id);
      const extObj = typeof data.ext === 'string' && data.ext ? JSON.parse(data.ext) : (typeof data.ext === 'object' ? data.ext : {});
      data.extStr = JSON.stringify(extObj, null, 2);
      setValue(data.extStr);
      setEmailServerConfig(data);
      form.setFieldsValue(data);

      setEditLoading(false);
    } catch (error) {
      console.error(error);
      setEditLoading(false);
    }
  };

  const onSubmit = async () => {
    try {
      setBtnLoading(true);
      form.validateFields().then(async (values: EmailServerConfig) => {
        try {
          values.ext = JSON.parse(values.extStr!);
          if (!values.ext) {
            values.ext = {};
          }
        } catch (error) {
          values.ext = {};
          console.error(error);
        }
        if (isMethod === 'edit') {
          await editEmailServerConfigDataAPI({ ...emailServerConfig, ...values });
          message.success('🎉 修改邮件服务成功');
        } else {
          await addEmailServerConfigDataAPI({ ...emailServerConfig, ...values });
          message.success('🎉 新增邮件服务成功');
        }
        setBtnLoading(false);
        getFootprintList();
        reset();
      });

      setBtnLoading(false);
    } catch (error) {
      console.error(error);
      setBtnLoading(false);
    }
  };

  const closeModel = () => reset();

  const onFilterSubmit = async (values: EmailServerConfig) => {
    try {
      setLoading(true);
      const key: string = values?.key !== undefined ? values?.key : '';
      const { data } = await getEmailServerConfigListAPI(key);
      setEmailServerConfigList(data);

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div>
      <Title value="邮件服务管理">
        <Button type="primary" size="large" onClick={addFootprintData}>
          新增邮件服务
        </Button>
      </Title>

      <Card className="border-stroke my-2 overflow-scroll">
        <div className="flex">
          <Form layout="inline" onFinish={onFilterSubmit} autoComplete="off" className="flex-nowrap w-full">
            <Form.Item label="名称" name="key" className="min-w-[200px]">
              <Input placeholder="请输入名称关键词" />
            </Form.Item>

            <Form.Item className="pr-6">
              <Button type="primary" htmlType="submit">
                查询
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Card>

      <Card className={`${titleSty} min-h-[calc(100vh-270px)]`}>
        <Table rowKey="id" dataSource={emailServerConfigList} columns={columns} loading={loading} scroll={{ x: 'max-content' }} />
      </Card>
      <Modal loading={editLoading} title={isMethod === 'edit' ? '编辑邮件服务' : '新增邮件服务'} open={isModelOpen} onCancel={closeModel} destroyOnClose footer={null} width={1000}>
        <Form form={form} layout="vertical" initialValues={emailServerConfig} size="large" preserve={false} className="mt-6">
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="配置名称" name="name" rules={[{ required: true, message: '配置名称不能为空' }]}>
                <Input placeholder="配置名称" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="SMTP服务器地址" name="host" rules={[{ required: true, message: 'SMTP服务器地址不能为空' }]}>
                <Input placeholder="SMTP服务器地址" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="SMTP服务器端口" name="port" rules={[{ required: true, message: 'SMTP服务器端口不能为空' }]}>
                <InputNumber style={{ width: '100%' }} min={1} placeholder="SMTP服务器端口" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="发送者邮箱地址" name="username" rules={[{ required: true, message: '发送者邮箱地址不能为空' }]}>
                <Input placeholder="发送者邮箱地址" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="密码/授权码" name="password" rules={[{ required: true, message: '密码/授权码不能为空' }]}>
                <Input placeholder="密码/授权码" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="是否启用SSL" name="sslEnable">
                    <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="是否启用TLS" name="tlsEnable">
                    <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Form.Item name="extStr" label={'扩展配置'} className="mb-4">
            <CodeMirror minHeight={'300px'} maxHeight={'300px'} value={value} extensions={[json()]} theme={document.body.classList.contains('dark') ? 'dark' : 'light'} basicSetup={{ lineNumbers: true, foldGutter: true }} style={{ borderRadius: 6 }} />
          </Form.Item>
          <Form.Item className="!mb-0 w-full">
            <Button type="primary" onClick={onSubmit} loading={btnLoading} className="w-full">
              {isMethod === 'edit' ? '编辑邮件服务' : '新增邮件服务'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
