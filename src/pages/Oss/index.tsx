import { useState, useEffect } from 'react';
import { Table, Button, Form, Input, Popconfirm, message, Card, Modal, Select } from 'antd';
import { DeleteOutlined, FormOutlined, PoweroffOutlined, StarOutlined } from '@ant-design/icons';

import Title from '@/components/Title';
import { titleSty } from '@/styles/sty';
import type { Oss } from '@/types/app/oss';
import type { ColumnsType } from 'antd/es/table';
import { addOssDataAPI, delOssDataAPI, editOssDataAPI, getOssListAPI, enableOssDataAPI, disableOssDataAPI, getOssDataAPI, getOssPlatformListAPI } from '@/api/Oss';

export default () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [oss, setOss] = useState<Oss>({} as Oss);
  const [ossList, setOssList] = useState<Oss[]>([]);
  const [platformList, setPlatformList] = useState<{ label: string; value: string; disabled: boolean }[]>([]);
  const [form] = Form.useForm();

  const columns: ColumnsType<Oss> = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'center', width: 80 },
    {
      title: '状态',
      fixed: 'left',
      dataIndex: 'isEnable',
      key: 'isEnable',
      align: 'center',
      width: 150,
      render: (isEnable: number) => (
        <div className="space-x-2">
          <span className={`inline-block w-3 h-3 ${isEnable ? 'bg-green-500' : 'bg-red-500'} rounded-full`} />
          <span>{isEnable ? '开启' : '禁用'}</span>
        </div>
      ),
    },
    {
      title: '平台',
      dataIndex: 'platformName',
      key: 'platformName',
      align: 'center',
      width: 120,
    },
    { title: '地域', dataIndex: 'endPoint', key: 'endPoint' },
    { title: '存储桶', dataIndex: 'bucketName', key: 'bucketName' },
    { title: '域名', dataIndex: 'domain', key: 'domain' },
    { title: '文件目录', dataIndex: 'basePath', key: 'basePath', align: 'center', width: 120 },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      align: 'center',
      width: 280,
      render: (_, record: Oss) => (
        <div className="space-x-2">
          {record.isEnable ? <Button type="primary" disabled onClick={() => disableOssData(record.id!)} icon={<StarOutlined />} /> : <Button type="primary" onClick={() => enableOssData(record.id!)} icon={<PoweroffOutlined />} />}

          <Button onClick={() => editOssData(record)} icon={<FormOutlined />} />

          <Popconfirm title="警告" description="你确定要删除吗" okText="确定" cancelText="取消" onConfirm={() => delOssData(record.id!)}>
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  // 获取支持的平台列表
  const getOssPlatformList = async () => {
    // 获取已经使用的平台
    const selectPlatformList = ossList.map((item) => item.platform);

    const { data } = await getOssPlatformListAPI();
    setPlatformList(
      data.map((item) => ({
        label: item.name,
        value: item.value,
        // 限制一个平台只能添加一个
        disabled: selectPlatformList.includes(item.value),
      })),
    );
  };

  const getOssList = async () => {
    try {
      setLoading(true);

      const { data } = await getOssListAPI();
      setOssList(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getOssList();
    getOssPlatformList();
  }, []);

  const enableOssData = async (id: number) => {
    try {
      setLoading(true);

      await enableOssDataAPI(id);
      getOssList();
      message.success('启用成功');
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const disableOssData = async (id: number) => {
    try {
      setLoading(true);

      await disableOssDataAPI(id);
      getOssList();
      message.success('禁用成功');
    } catch (error) {
      console.error(error);
    }
  };

  const editOssData = async (record: Oss) => {
    try {
      setEditLoading(true);

      setIsModalOpen(true);

      const { data } = await getOssDataAPI(record.id);
      setOss(data);
      form.setFieldsValue(data);

      setEditLoading(false);
    } catch (error) {
      console.error(error);
      setEditLoading(false);
    }
  };

  const delOssData = async (id: number) => {
    try {
      setLoading(true);

      await delOssDataAPI(id);
      getOssList();
      message.success('🎉 删除存储配置成功');
    } catch (error) {
      console.error(error);
    }
  };

  const addOssData = () => {
    setOss({} as Oss);
    form.resetFields();
    form.setFieldsValue({});
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const onSubmit = async () => {
    try {
      setBtnLoading(true);

      const values = await form.validateFields();

      if (oss.id) {
        await editOssDataAPI({ ...oss, ...values });
        message.success('🎉 编辑存储配置成功');
      } else {
        await addOssDataAPI(values);
        message.success('🎉 新增存储配置成功');
      }

      getOssList();
      setIsModalOpen(false);
      form.resetFields();

      setBtnLoading(false);
    } catch (error) {
      console.error(error);
      setBtnLoading(false);
    }
  };

  return (
    <div>
      <Title value="存储管理">
        <Button type="primary" size="large" onClick={addOssData}>
          新增配置
        </Button>
      </Title>

      <Card className={`${titleSty} min-h-[calc(100vh-160px)]`}>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={ossList}
          columns={columns}
          scroll={{ x: 'max-content' }}
          pagination={{
            position: ['bottomCenter'],
            pageSize: 8,
          }}
        />
      </Card>

      <Modal loading={editLoading} title={oss.id ? '编辑存储配置' : '新增存储配置'} open={isModalOpen} onCancel={handleCancel} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={onSubmit} size="large" className="mt-6">
          {!oss.id && (
            <Form.Item label="选择平台" name="platform" className="w-full">
              <Select options={platformList} placeholder="请选择平台" allowClear />
            </Form.Item>
          )}

          {oss.platform !== 'local' && (
            <>
              <Form.Item
                label="Access Key"
                name="accessKey"
                rules={[
                  { required: true, message: 'Access Key 不能为空' },
                  { min: 10, max: 50, message: 'Access Key 限制在10~50个字符' },
                ]}
              >
                <Input placeholder="请输入Access Key" />
              </Form.Item>

              <Form.Item label="SecretKey" name="secretKey" rules={[{ required: true, message: 'SecretKey不能为空' }]}>
                <Input.Password placeholder="请输入SecretKey" />
              </Form.Item>

              <Form.Item label="地域" name="endPoint" rules={[{ required: true, message: '地域不能为空' }]}>
                <Input placeholder="请输入地域" />
              </Form.Item>

              <Form.Item label="存储桶" name="bucketName" rules={[{ required: true, message: '存储桶不能为空' }]}>
                <Input placeholder="请输入存储桶" />
              </Form.Item>
            </>
          )}

          <Form.Item label="域名" name="domain" rules={[{ required: true, message: '域名不能为空' }]}>
            <Input placeholder="请输入域名" />
          </Form.Item>

          {oss.platform !== 'local' && (
            <Form.Item label="文件目录" name="basePath" rules={[{ required: true, message: '文件目录不能为空' }]}>
              <Input placeholder="请输入文件目录" />
            </Form.Item>
          )}

          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" loading={btnLoading} className="w-full">
              {oss.id ? '保存修改' : '新增配置'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
