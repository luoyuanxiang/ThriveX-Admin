import type { MenuProps } from 'antd';
import { Button, Card, Form, Input, Layout, Menu, message, Modal, Select, Table } from 'antd';
import Title from '@/components/Title';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { editEmailTemplateDataAPI, getEmailTemplateListAPI, sendEmailTemplateAPI } from '@/api/EmailTemplate.ts';
import { CheckParamsFormValues, EmailTemplate, ParamsColumns } from '@/types/app/emailTemplate';
import { useEffect, useState } from 'react';
import { CheckCircleOutlined, EyeOutlined, SaveOutlined, SettingOutlined } from '@ant-design/icons';
import { ColumnType } from 'antd/es/table';
import paramsData from './ParamsData.json';
import { EmailServerConfig } from '@/types/app/emailServerConfig';
import { getEmailServerConfigListAPI } from '@/api/EmailServerConfig.ts';

type MenuItem = Required<MenuProps>['items'][number];
const { Sider, Content } = Layout;
type ParamsDataType = {
  [key: string]: ParamsColumns[];
};

export default () => {
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [emailTemplateList, setEmailTemplateList] = useState<EmailTemplate[]>([]);
  const [htmlCode, setHtmlCode] = useState('');
  const [previewModal, setPreviewModal] = useState(false);
  const [form] = Form.useForm();
  const [templateParams, setTemplateParams] = useState<ParamsColumns[]>();
  const [previewParamsModal, setPreviewParamsModal] = useState(false);
  const [checkParamsModal, setCheckParamsModal] = useState(false);
  const [emailServerConfigList, setEmailServerConfigList] = useState<EmailServerConfig[]>();
  const [butLoading, setButLoading] = useState(false);

  const getTemplateList = async () => {
    const { data } = await getEmailTemplateListAPI();
    setEmailTemplateList(data);
    form.setFieldsValue(data[0]);
    setEmailTemplate(data[0]);
    setMenuItems(data.map((item) => ({ key: item.id + '', label: item.name })));
  };

  useEffect(() => {
    getTemplateList();
  }, []);

  const onMenuClick: MenuProps['onClick'] = (e) => {
    const data = emailTemplateList.find((item) => Number(e.key) === item.id);
    form.setFieldsValue(data);
    setEmailTemplate(data);
  };

  const updTemplate = async () => {
    try {
      const values = await form.validateFields();
      const { code } = await editEmailTemplateDataAPI({ ...emailTemplate, ...values });
      if (code == 200) {
        message.success('🎉 邮件模板修改成功');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePreview = () => {
    setHtmlCode(emailTemplate?.content || '');
    setPreviewModal(true);
  };

  const handlePreviewParams = () => {
    const name = emailTemplate?.name;
    if (name && Object.prototype.hasOwnProperty.call(paramsData, name)) {
      setTemplateParams((paramsData as ParamsDataType)[name]);
    } else {
      setTemplateParams(undefined);
    }
    setPreviewParamsModal(true);
  };

  const handleCheckParams = async () => {
    const { data } = await getEmailServerConfigListAPI('');
    setEmailServerConfigList(data as EmailServerConfig[]);
    const name = emailTemplate?.name;
    if (name && Object.prototype.hasOwnProperty.call(paramsData, name)) {
      setTemplateParams((paramsData as ParamsDataType)[name]);
    } else {
      setTemplateParams(undefined);
    }
    setCheckParamsModal(true);
  };

  const onCheckParams = async (params: CheckParamsFormValues) => {
    setButLoading(true);
    params.templateName = emailTemplate?.name;
    const { code, message: msg } = await sendEmailTemplateAPI(params);
    if (code === 200) {
      message.success('🎉 邮件发送成功');
      setCheckParamsModal(false);
      setButLoading(true);
    } else {
      message.error('邮件发送失败: ' + msg);
      setButLoading(false);
    }
  };

  const columns: ColumnType<ParamsColumns>[] = [
    {
      title: '字段名称',
      dataIndex: 'fieldName',
      key: 'fieldName',
      align: 'center',
    },
    {
      title: '字段类型',
      dataIndex: 'fieldType',
      key: 'fieldType',
      align: 'center',
    },
    {
      title: '字段描述',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
    },
  ];

  const renderFormItem = (fieldType: string, placeholder: string) => {
    switch (fieldType) {
      case 'string':
        return <Input placeholder={`请输入${placeholder}`} />;
      case 'number':
        return <Input type="number" placeholder={`请输入${placeholder}`} />;
      case 'boolean':
        return (
          <Select placeholder={`请选择${placeholder}`}>
            <Select.Option value={true}>是</Select.Option>
            <Select.Option value={false}>否</Select.Option>
          </Select>
        );
      default:
        return <Input placeholder={`请输入${placeholder}`} />;
    }
  };

  return (
    <div>
      <Title value="邮件模板管理"></Title>
      <Card>
        <Layout style={{ height: '100vh' }}>
          <Sider width={256} theme="light">
            <Menu mode="inline" defaultSelectedKeys={['1']} items={menuItems} onClick={onMenuClick} />
          </Sider>
          <Layout>
            <Content style={{ backgroundColor: '#fff' }}>
              <Form form={form} layout="vertical" initialValues={emailTemplate} size="large" preserve={false} className="mt-6">
                <Card>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Form.Item name="subject" rules={[{ required: true, message: '邮件主题不能为空' }]}>
                      <Input placeholder="邮件主题" />
                    </Form.Item>
                    <div>
                      <Button style={{ marginRight: 8 }} type="primary" icon={<CheckCircleOutlined />} onClick={handleCheckParams}>
                        验证模板
                      </Button>
                      <Button style={{ marginRight: 8 }} icon={<SettingOutlined />} onClick={handlePreviewParams}>
                        模板参数
                      </Button>
                      <Button style={{ marginRight: 8 }} icon={<EyeOutlined />} onClick={handlePreview}>
                        预览
                      </Button>
                      <Button style={{ marginRight: 8 }} type="primary" icon={<SaveOutlined />} onClick={updTemplate}>
                        保存
                      </Button>
                    </div>
                  </div>
                </Card>
                <Card style={{ marginTop: 16 }}>
                  <div style={{ borderRadius: 4, padding: 16, minHeight: 400 }}>
                    <Form.Item name="content" rules={[{ required: true, message: '配置名称不能为空' }]}>
                      <CodeMirror minHeight={'100px'} maxHeight={'500px'} extensions={[html()]} theme={document.body.classList.contains('dark') ? 'dark' : 'light'} basicSetup={{ lineNumbers: true, foldGutter: true }} style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </div>
                </Card>
              </Form>
            </Content>
          </Layout>
        </Layout>
      </Card>
      <Modal title={'模板预览'} open={previewModal} onCancel={() => setPreviewModal(false)} footer={null}>
        <div
          style={{
            padding: 20,
            border: '1px solid #e8e8e8',
            borderRadius: 4,
            minHeight: 200,
          }}
          dangerouslySetInnerHTML={{ __html: htmlCode }}
        />
      </Modal>
      <Modal width={1000} title={emailTemplate?.name + ' 模板参数'} open={previewParamsModal} onCancel={() => setPreviewParamsModal(false)} footer={null}>
        <div>
          <Card title={'系统变量'}>
            <Table
              rowKey={'fieldName'}
              bordered
              pagination={false}
              dataSource={[
                {
                  fieldName: 'site.title',
                  fieldType: 'string',
                  description: '站点标题',
                },
                {
                  fieldName: 'site.subtitle',
                  fieldType: 'string',
                  description: '站点副标题',
                },
                {
                  fieldName: 'site.logo',
                  fieldType: 'string',
                  description: '站点 Logo URL',
                },
                {
                  fieldName: 'site.url',
                  fieldType: 'string',
                  description: '站点外部访问地址',
                },
              ]}
              columns={columns}
              scroll={{ x: 'max-content' }}
            />
          </Card>
          <Card title={'模板变量'}>
            <Table rowKey={'fieldName'} bordered pagination={false} dataSource={templateParams} columns={columns} />
          </Card>
        </div>
      </Modal>
      <Modal title={'验证模板'} open={checkParamsModal} onCancel={() => setCheckParamsModal(false)} footer={null}>
        <Form layout="vertical" size="large" onFinish={onCheckParams} preserve={false} className="mt-6">
          <Form.Item label="邮件服务器" name="emailServerId" rules={[{ required: true, message: `邮件服务不能为空` }]}>
            <Select placeholder="请选择邮件服务器">
              {emailServerConfigList?.map((item: EmailServerConfig) => (
                <Select.Option value={item.id} key={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {templateParams?.map((item: ParamsColumns) => (
            <Form.Item rules={[{ required: true, message: `${item.description}不能为空` }]} label={item.description} name={item.fieldName} key={item.fieldName}>
              {renderFormItem(item.fieldType as string, item.description as string)}
            </Form.Item>
          ))}
          <Form.Item
            label="接收邮箱"
            name="mail"
            rules={[
              { required: true, message: `接收邮箱不能为空` },
              { type: 'email', message: '请输入正确的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入接收邮箱" />
          </Form.Item>
          <Form.Item className="pr-6">
            <Button type="primary" loading={butLoading} className={'w-full'} htmlType="submit" icon={<CheckCircleOutlined />}>
              测试发送
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
