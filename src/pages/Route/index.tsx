import { useState, useEffect } from 'react';
import { Table, Button, Form, Input, Popconfirm, message, Card } from 'antd';
import { DeleteOutlined, FormOutlined } from '@ant-design/icons';

import Title from '@/components/Title';
import { getRouteListAPI, addRouteDataAPI, editRouteDataAPI, delRouteDataAPI, getRouteDataAPI } from '@/api/Route';
import { Route } from '@/types/app/route';
import { ColumnsType } from 'antd/es/table';

export default () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const [form] = Form.useForm();

  const [route, setRoute] = useState<Route>({} as Route);
  const [list, setList] = useState<Route[]>([]);

  const columns: ColumnsType<Route> = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'center' },
    { title: '路径', dataIndex: 'path', key: 'path' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    {
      title: '操作',
      key: 'action',
      render: (_: string, record: Route) => (
        <>
          <Button onClick={() => editRouteData(record)} icon={<FormOutlined />} />
          <Popconfirm title="警告" description="你确定要删除吗" okText="确定" cancelText="取消" onConfirm={() => delRouteData(record.id!)}>
            <Button type="primary" danger className="ml-2" icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      ),
    },
  ];

  const getRouteList = async () => {
    try {
      setLoading(true);

      const { data } = await getRouteListAPI();
      setList(data);

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getRouteList();
  }, []);

  const editRouteData = async (record: Route) => {
    try {
      setLoading(true);

      const { data } = await getRouteDataAPI(record.id);
      setRoute(data);
      form.setFieldsValue(data);

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const delRouteData = async (id: number) => {
    try {
      setLoading(true);

      await delRouteDataAPI(id);
      getRouteList();
      message.success('🎉 删除路由成功');

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    try {
      setLoading(true);
      setBtnLoading(true);

      form.validateFields().then(async (values: Route) => {
        if (route.id) {
          await editRouteDataAPI({ ...route, ...values });
          message.success('🎉 编辑路由成功');
        } else {
          await addRouteDataAPI(values);
          message.success('🎉 新增路由成功');
        }

        getRouteList();
        form.resetFields();
        form.setFieldsValue({ path: '', description: '' });
        setRoute({} as Route);
      });

      setLoading(false);
      setBtnLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setBtnLoading(true);
    }
  };

  return (
    <div>
      <Title value="路由管理" />

      <div className="flex md:justify-between flex-col md:flex-row mx-auto mt-2 min-h-[calc(100vh-160px)]">
        <Card className="w-full md:w-[40%] h-73">
          <Form form={form} layout="vertical" initialValues={route} onFinish={onSubmit} size="large">
            <Form.Item label="路由路径" name="path" rules={[{ required: true, message: '路由路径不能为空' }]}>
              <Input placeholder="请输入路由路径" />
            </Form.Item>

            <Form.Item label="路由描述" name="description" rules={[{ required: true, message: '路由描述不能为空' }]}>
              <Input placeholder="请输入路由描述" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={btnLoading} className="w-full">
                {route.id ? '编辑路由' : '新增路由'}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card className="w-full md:w-[59%] [&>.ant-card-body]:!p-0 mt-2 md:mt-0">
          <Table
            rowKey="id"
            dataSource={list}
            columns={columns}
            scroll={{ x: 'max-content' }}
            pagination={{
              position: ['bottomCenter'],
              pageSize: 8,
            }}
            loading={loading}
          />
        </Card>
      </div>
    </div>
  );
};
