import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  notification,
  Popconfirm,
  Spin,
  Table,
  Tag,
} from 'antd';
import { titleSty } from '@/styles/sty';
import Title from '@/components/Title';
import {
  addFootprintDataAPI,
  delFootprintDataAPI,
  editFootprintDataAPI,
  getFootprintDataAPI,
  getFootprintPagingAPI,
} from '@/api/Footprint';
import type { FilterForm, Footprint } from '@/types/app/footprint';
import { GiPositionMarker } from 'react-icons/gi';
import { IoSearch } from 'react-icons/io5';
import dayjs from 'dayjs';
import axios from 'axios';
import { CloudUploadOutlined } from '@ant-design/icons';
import Material from '@/components/Material';

export default () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [footprintList, setFootprintList] = useState<Footprint[]>([]);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [footprint, setFootprint] = useState<Footprint>({} as Footprint);
  const [isMethod, setIsMethod] = useState<'create' | 'edit'>('create');
  const [form] = Form.useForm();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      width: 100,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      align: 'center',
      width: 200,
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      align: 'center',
      width: 250,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      align: 'center',
      width: 400,
      render: (value: string) => <div className="line-clamp-3">{value}</div>,
    },
    {
      title: '坐标纬度',
      dataIndex: 'position',
      key: 'position',
      align: 'center',
      width: 250,
      render: (value: string) => <Tag>{value}</Tag>,
    },
    {
      title: '时间',
      dataIndex: 'createTime',
      key: 'createTime',
      align: 'center',
      width: 230,
      render: (time: string) => dayjs(+time).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a: Footprint, b: Footprint) => +a.createTime! - +b.createTime!,
      showSorterTooltip: false,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      align: 'center',
      render: (_: string, record: Footprint) => (
        <div className="flex space-x-2">
          <Button onClick={() => editFootprintData(record.id!)}>修改</Button>
          <Popconfirm
            title="警告"
            description="你确定要删除吗"
            okText="确定"
            cancelText="取消"
            onConfirm={() => delFootprintData(record.id!)}
          >
            <Button type="primary" danger>
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const { RangePicker } = DatePicker;

  const getFootprintList = async (current: number, size: number) => {
    try {
      const values = form.getFieldsValue()
      const query: FilterData = {
        key: values.address,
        startDate: values.createTime && values.createTime[0].valueOf() + '',
        endDate: values.createTime && values.createTime[1].valueOf() + '',
      };
      const { data } = await getFootprintPagingAPI({
        query: query,
        pagination: {
          current,
          size,
        },
      });
      setFootprintList(data.records);
      setPagination({
        current: data.current,
        pageSize: data.size,
        total: data.total,
      });
    } catch (error) {
      setLoading(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    getFootprintList(1, 10);
  }, []);

  const reset = () => {
    setIsMethod('create');
    form.resetFields();
    setFootprint({} as Footprint);
    setIsModelOpen(false);
  };

  // 处理分页变化
  const handleTableChange = async (pagination: any) => {
    const pager = { ...pagination };
    await getFootprintList(pager.current, pager.pageSize);
  };

  const delFootprintData = async (id: number) => {
    setLoading(true);

    try {
      await delFootprintDataAPI(id);
      notification.success({ message: '🎉 删除足迹成功' });
      getFootprintList(1, 10);
    } catch (error) {
      setLoading(false);
    }
  };

  const addFootprintData = () => {
    setIsMethod('create');
    setIsModelOpen(true);
    form.resetFields();
    setFootprint({} as Footprint);
  };

  const editFootprintData = async (id: number) => {
    try {
      setEditLoading(true);

      setIsMethod('edit');
      setIsModelOpen(true);

      const { data } = await getFootprintDataAPI(id);

      data.images = (data.images as string[]).join('\n');
      data.createTime = dayjs(+data.createTime);

      setFootprint(data);
      form.setFieldsValue(data);

      setEditLoading(false);
    } catch (error) {
      setEditLoading(false);
    }
  };

  const onSubmit = async () => {
    try {
      setBtnLoading(true);

      form.validateFields().then(async (values: Footprint) => {
        values.createTime = values.createTime.valueOf();
        values.images = values.images
          ? (values.images as string).split('\n')
          : [];

        if (isMethod === 'edit') {
          await editFootprintDataAPI({ ...footprint, ...values });
          message.success('🎉 修改足迹成功');
        } else {
          await addFootprintDataAPI({ ...footprint, ...values });
          message.success('🎉 新增足迹成功');
        }

        setBtnLoading(false);
        await getFootprintList(1, 10);
        reset();
      });
    } catch (error) {
      setBtnLoading(false);
    }
  };

  const closeModel = () => reset();

  const onFilterSubmit = async (_: FilterForm) => {
    await getFootprintList(1, 10);
  };

  // 通过详细地址获取纬度
  const getGeocode = async () => {
    try {
      setSearchLoading(true);

      const address = form.getFieldValue('address');

      const { data } = await axios.get(
        'https://restapi.amap.com/v3/geocode/geo',
        {
          params: {
            address,
            key: import.meta.env.VITE_GAODE_WEB_API,
          },
        },
      );

      if (data.geocodes.length > 0) {
        const location = data.geocodes[0].location;
        form.setFieldValue('position', location);

        // 立即触发校验
        form.validateFields(['position']);

        setSearchLoading(false);
        return data.geocodes[0].location;
      } else {
        setSearchLoading(false);
        message.warning('未找到该地址的经纬度');
      }
    } catch (error) {
      setSearchLoading(false);
    }
  };

  return (
    <div>
      <Title value="足迹管理">
        <Button type="primary" size="large" onClick={addFootprintData}>
          新增足迹
        </Button>
      </Title>

      <Card className="my-2 overflow-scroll">
        <div className="flex">
          <Form
            layout="inline"
            onFinish={onFilterSubmit}
            autoComplete="off"
            className="flex-nowrap w-full"
          >
            <Form.Item label="地址" name="address" className="min-w-[200px]">
              <Input placeholder="请输入地址关键词" />
            </Form.Item>

            <Form.Item
              label="时间范围"
              name="createTime"
              className="min-w-[250px]"
            >
              <RangePicker placeholder={['选择起始时间', '选择结束时间']} />
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
        <Table
          rowKey="id"
          dataSource={footprintList}
          columns={columns as any}
          loading={loading}
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
        />
      </Card>

      <Modal
        loading={editLoading}
        title={isMethod === 'edit' ? '编辑足迹' : '新增足迹'}
        open={isModelOpen}
        onCancel={closeModel}
        destroyOnClose
        footer={null}
      >
        <Spin spinning={searchLoading}>
          <Form
            form={form}
            layout="vertical"
            initialValues={footprint}
            size="large"
            preserve={false}
            className="mt-6"
          >
            <Form.Item
              label="标题"
              name="title"
              rules={[{ required: true, message: '标题不能为空' }]}
            >
              <Input placeholder="请输入标题" />
            </Form.Item>

            <Form.Item
              label="地址"
              name="address"
              rules={[{ required: true, message: '地址不能为空' }]}
            >
              <Input placeholder="请输入地址" />
            </Form.Item>

            <Form.Item
              label="坐标纬度"
              name="position"
              rules={[{ required: true, message: '坐标纬度不能为空' }]}
            >
              <Input
                placeholder="请输入坐标纬度"
                prefix={<GiPositionMarker />}
                addonAfter={
                  <IoSearch onClick={getGeocode} className="cursor-pointer" />
                }
              />
            </Form.Item>

            <div className="relative">
              <Form.Item label="图片" name="images">
                <Input.TextArea
                  autoSize={{ minRows: 2, maxRows: 10 }}
                  placeholder="请输入图片链接"
                />
              </Form.Item>

              <div
                onClick={() => setIsMaterialModalOpen(true)}
                className="absolute bottom-2 right-2 bg-white rounded-full border border-[#eee] cursor-pointer"
              >
                <CloudUploadOutlined className="text-xl hover:text-primary transition-colors p-2" />
              </div>
            </div>

            <Form.Item label="内容" name="content">
              <Input.TextArea
                autoSize={{ minRows: 5, maxRows: 10 }}
                placeholder="请输入内容"
              />
            </Form.Item>

            <Form.Item
              label="时间"
              name="createTime"
              rules={[{ required: true, message: '时间不能为空' }]}
              className="!mb-4"
            >
              <DatePicker
                showTime
                placeholder="请选择时间"
                className="w-full"
              />
            </Form.Item>

            <Form.Item className="!mb-0 w-full">
              <Button
                type="primary"
                onClick={onSubmit}
                loading={btnLoading}
                className="w-full"
              >
                {isMethod === 'edit' ? '编辑足迹' : '新增足迹'}
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      <Material
        multiple
        open={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onSelect={(url) => {
          form.setFieldValue('images', url.join('\n'));
          form.validateFields(['images']);
        }}
      />
    </div>
  );
};
