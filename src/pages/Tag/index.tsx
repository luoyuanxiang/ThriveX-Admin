import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Popconfirm,
  Spin,
  Table,
} from 'antd';
import {
  addTagDataAPI,
  delTagDataAPI,
  editTagDataAPI,
  getTagDataAPI,
  getTagPagingAPI,
} from '@/api/Tag';
import { Tag } from '@/types/app/tag';
import Title from '@/components/Title';
import { ColumnsType } from 'antd/es/table';

export default () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [form] = Form.useForm();

  const [tag, setTag] = useState<Tag>({} as Tag);
  const [list, setList] = useState<Tag[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const columns: ColumnsType<Tag> = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'center' },
    { title: '标签名称', dataIndex: 'name', key: 'name', align: 'center' },
    {
      title: '操作',
      key: 'action',
      render: (_: string, record: Tag) => (
        <>
          <Button onClick={() => editTagData(record)}>修改</Button>
          <Popconfirm
            title="警告"
            description="你确定要删除吗"
            okText="确定"
            cancelText="取消"
            onConfirm={() => delTagData(record.id!)}
          >
            <Button type="primary" danger className="ml-2">
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const getTagList = async (current: number, pageSize: number) => {
    try {
      setLoading(true);
      const { data } = await getTagPagingAPI({
        pagination: {
          current,
          size: pageSize,
        },
      });
      setList(data.records);
      setPagination({
        ...pagination,
        current: data.current,
        pageSize: data.size,
        total: data.total,
      });

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTagList(1, 10);
  }, []);

  const editTagData = async (record: Tag) => {
    try {
      setEditLoading(true);

      const { data } = await getTagDataAPI(record.id);
      setTag(data);
      form.setFieldsValue(data);

      setEditLoading(false);
    } catch (error) {
      setEditLoading(false);
    }
  };

  const delTagData = async (id: number) => {
    try {
      setLoading(true);

      await delTagDataAPI(id);
      await getTagList(1, 10);
      message.success('🎉 删除标签成功');
    } catch (error) {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    try {
      setLoading(true);
      setBtnLoading(true);

      form.validateFields().then(async (values: Tag) => {
        if (tag.id) {
          await editTagDataAPI({ ...tag, ...values });
          message.success('🎉 编辑标签成功');
        } else {
          await addTagDataAPI(values);
          message.success('🎉 新增标签成功');
        }

        getTagList(1, 10);
        form.resetFields();
        form.setFieldsValue({ name: '' });
        setTag({} as Tag);
      });

      setLoading(false);
      setBtnLoading(false);
    } catch (error) {
      setLoading(false);
      setBtnLoading(false);
    }
  };

  // 处理分页变化
  const handleTableChange = async (pagination: any) => {
    const pager = { ...pagination };
    await getTagList(pager.current, pager.pageSize);
  };

  return (
    <div>
      <Title value="标签管理" />

      <div className="flex md:justify-between flex-col md:flex-row mx-auto mt-2 h-[calc(100vh-180px)]">
        <div className="w-full md:w-[40%]">
          <Spin spinning={editLoading}>
            {/* <Card className="w-full md:w-[40%] h-46"> */}
            <Card className="w-full h-46">
              <Form
                form={form}
                layout="vertical"
                initialValues={tag}
                onFinish={onSubmit}
                size="large"
              >
                <Form.Item
                  label="标签名称"
                  name="name"
                  rules={[{ required: true, message: '标签名称不能为空' }]}
                >
                  <Input placeholder="请输入标签名称" />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={btnLoading}
                    className="w-full"
                  >
                    {tag.id ? '编辑标签' : '新增标签'}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Spin>
        </div>

        <Card className="w-full md:w-[59%] [&>.ant-card-body]:!p-0 mt-2 md:mt-0">
          <Table
            rowKey="id"
            dataSource={list}
            columns={columns}
            scroll={{ x: 'max-content' }}
            pagination={{
              position: ['bottomCenter'],
              showSizeChanger: true,
              showTitle: true,
              showTotal(total, _) {
                return `共 ${total} 条数据`;
              },
              ...pagination,
            }}
            onChange={handleTableChange}
            loading={loading}
          />
        </Card>
      </div>
    </div>
  );
};
