import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Image,
  Input,
  message,
  Popconfirm,
  Spin,
  Table,
  Tabs,
} from 'antd';
import {
  addSwiperDataAPI,
  delSwiperDataAPI,
  editSwiperDataAPI,
  getSwiperDataAPI,
  getSwiperPagingAPI,
} from '@/api/Swiper';
import { Swiper } from '@/types/app/swiper';
import Title from '@/components/Title';
import { ColumnsType } from 'antd/es/table';
import { CloudUploadOutlined, PictureOutlined } from '@ant-design/icons';
import Material from '@/components/Material';

export default () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [form] = Form.useForm();

  const [swiper, setSwiper] = useState<Swiper>({} as Swiper);
  const [list, setList] = useState<Swiper[]>([]);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [tab, setTab] = useState<string>('list');

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const columns: ColumnsType<Swiper> = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'center' },
    {
      title: '图片',
      dataIndex: 'image',
      key: 'image',
      width: 200,
      render: (url: string) => (
        <Image
          width={200}
          src={url}
          className="w-full rounded cursor-pointer"
        />
      ),
    },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '描述', dataIndex: 'description', key: 'description', width: 500 },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      render: (_: string, record: Swiper) => (
        <>
          <Button onClick={() => editSwiperData(record)}>修改</Button>

          <Popconfirm
            title="警告"
            description="你确定要删除吗"
            okText="确定"
            cancelText="取消"
            onConfirm={() => delSwiperData(record.id!)}
          >
            <Button type="primary" danger className="ml-2">
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const getSwiperList = async (current: number, size: number) => {
    try {
      setLoading(true);

      const { data } = await getSwiperPagingAPI({
        pagination: {
          current,
          size,
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
    getSwiperList(1, 10);
  }, []);

  const editSwiperData = async (record: Swiper) => {
    try {
      setEditLoading(true);
      setTab('operate');

      const { data } = await getSwiperDataAPI(record.id);
      setSwiper(data);
      form.setFieldsValue(record);

      setEditLoading(false);
    } catch (error) {
      setEditLoading(false);
    }
  };

  const delSwiperData = async (id: number) => {
    try {
      setBtnLoading(true);

      await delSwiperDataAPI(id);
      getSwiperList(1, 10);
      message.success('🎉 删除轮播图成功');

      setBtnLoading(false);
    } catch (error) {
      setBtnLoading(false);
    }
  };

  // 处理分页变化
  const handleTableChange = async (pagination: any) => {
    const pager = { ...pagination };
    await getSwiperList(pager.current, pager.pageSize);
  };

  const onSubmit = async () => {
    try {
      setBtnLoading(true);

      form.validateFields().then(async (values: Swiper) => {
        if (swiper.id) {
          await editSwiperDataAPI({ ...swiper, ...values });
          message.success('🎉 编辑轮播图成功');
        } else {
          await addSwiperDataAPI({ ...swiper, ...values });
          message.success('🎉 新增轮播图成功');
        }

        getSwiperList(1, 10);
        setTab('list');
        form.resetFields();
        setSwiper({} as Swiper);
      });

      setBtnLoading(false);
    } catch (error) {
      setBtnLoading(false);
    }
  };

  const handleTabChange = (key: string) => {
    setTab(key);
    form.resetFields();
    setSwiper({} as Swiper);
  };

  // 文件上传
  const UploadBtn = () => (
    <CloudUploadOutlined
      className="text-xl cursor-pointer"
      onClick={() => setIsMaterialModalOpen(true)}
    />
  );

  const tabItems = [
    {
      label: '轮播图列表',
      key: 'list',
      children: (
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
          className="w-full"
        />
      ),
    },
    {
      label: swiper.id ? '编辑轮播图' : '新增轮播图',
      key: 'operate',
      children: (
        <Spin spinning={editLoading}>
          <h2 className="text-xl pb-4 text-center">
            {swiper.id ? '编辑轮播图' : '新增轮播图'}
          </h2>

          <Form
            form={form}
            layout="vertical"
            initialValues={swiper}
            onFinish={onSubmit}
            size="large"
            className="max-w-md mx-auto"
          >
            <Form.Item
              label="标题"
              name="title"
              rules={[{ required: true, message: '轮播图标题不能为空' }]}
            >
              <Input placeholder="要么沉沦 要么巅峰!" />
            </Form.Item>

            <Form.Item label="描述" name="description">
              <Input placeholder="Either sink or peak!" />
            </Form.Item>

            <Form.Item label="链接" name="url">
              <Input placeholder="https://liuyuyang.net/" />
            </Form.Item>

            <Form.Item
              label="图片"
              name="image"
              rules={[{ required: true, message: '轮播图地址不能为空' }]}
            >
              <Input
                placeholder="https://liuyuyang.net/swiper.jpg"
                prefix={<PictureOutlined />}
                addonAfter={<UploadBtn />}
                className="customizeAntdInputAddonAfter"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={btnLoading}
                className="w-full"
              >
                {swiper.id ? '编辑轮播图' : '新增轮播图'}
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      ),
    },
  ];

  return (
    <div>
      <Title value="轮播图管理" />

      <Card className="[&>.ant-card-body]:!pt-0 mt-2 min-h-[calc(100vh-180px)]">
        <Tabs activeKey={tab} onChange={handleTabChange} items={tabItems} />
      </Card>

      <Material
        // multiple
        open={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onSelect={(url) => {
          form.setFieldValue('image', url.join('\n'));
          form.validateFields(['image']); // 手动触发 image 字段的校验
        }}
      />
    </div>
  );
};
