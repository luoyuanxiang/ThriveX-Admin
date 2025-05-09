import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tag,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import {
  delWallDataAPI,
  getWallCateListAPI,
  getWallPagingAPI,
  updateChoiceAPI,
} from '@/api/Wall';
import { titleSty } from '@/styles/sty';
import Title from '@/components/Title';
import type { Cate, FilterForm, FilterWall, Wall } from '@/types/app/wall';
import dayjs from 'dayjs';
import TextArea from 'antd/es/input/TextArea';
import { sendReplyWallEmailAPI } from '@/api/Email';
import { useWebStore } from '@/stores';

export default () => {
  const web = useWebStore((state) => state.web);

  const [loading, setLoading] = useState(false);

  const [wall, setWall] = useState<Wall>({} as Wall);
  const [list, setList] = useState<Wall[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyInfo, setReplyInfo] = useState('');
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [form] = Form.useForm();

  const getWallList = async (current: number, size: number) => {
    try {
      setLoading(true);

      const values = form.getFieldsValue();

      const query: FilterWall = {
        key: values.content,
        cateId: values.cateId,
        startDate: values.createTime && values.createTime[0].valueOf() + '',
        endDate: values.createTime && values.createTime[1].valueOf() + '',
      };

      const { data } = await getWallPagingAPI({
        pagination: {
          current,
          size,
        },
        query: query,
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

  const delWallData = async (id: number) => {
    setLoading(true);

    try {
      await delWallDataAPI(id);
      getWallList(1, 10);
      message.success('🎉 删除留言成功');
    } catch (error) {
      setLoading(false);
    }

    setLoading(false);
  };

  // 获取留言的分类列表
  const [cateList, setCateList] = useState<Cate[]>([]);
  const getCateList = async () => {
    const { data } = await getWallCateListAPI();
    setCateList((data as Cate[]).filter((item) => item.id !== 1));
  };

  useEffect(() => {
    getWallList(1, 10);
    getCateList();
  }, []);

  const columns: ColumnsType<Wall> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
    },
    {
      title: '分类',
      dataIndex: 'cate',
      key: 'cate',
      render: ({ name }, { color }) => (
        <Tag
          bordered={false}
          color={color}
          className="!text-[#565656] dark:!text-white"
        >
          {name}
        </Tag>
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      width: 400,
      render: (text: string, record: Wall) => (
        <span
          className="hover:text-primary cursor-pointer line-clamp-2"
          onClick={() => {
            setWall(record);
            setIsModalOpen(true);
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => (text ? text : '暂无邮箱'),
    },
    {
      title: '留言时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (date: string) => dayjs(+date).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a: Wall, b: Wall) => +a.createTime! - +b.createTime!,
      showSorterTooltip: false,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      align: 'center',
      render: (_: string, record: Wall) => (
        <div className="flex justify-center space-x-2">
          <Button
            type={record.isChoice === 1 ? 'primary' : 'default'}
            onClick={async () => {
              try {
                setLoading(true);
                await updateChoiceAPI(record.id);
                message.success('🎉 操作成功');
                getWallList(1, 10);
                setLoading(false);
              } catch (error) {
                setLoading(false);
              }
            }}
          >
            {record.isChoice === 1 ? '取消精选' : '设置精选'}
          </Button>

          <Button
            onClick={() => {
              setWall(record);
              setIsReplyModalOpen(true);
            }}
          >
            回复
          </Button>

          <Popconfirm
            title="警告"
            description="你确定要删除吗"
            okText="确定"
            cancelText="取消"
            onConfirm={() => delWallData(record.id)}
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

  const onFilterSubmit = async (_: FilterForm) => {
    await getWallList(1, 10);
  };

  // 回复留言
  const onHandleReply = async () => {
    try {
      setLoading(true);

      await sendReplyWallEmailAPI({
        to: wall?.email!,
        recipient: wall?.name!,
        your_content: wall?.content!,
        reply_content: replyInfo,
        time: dayjs(+wall?.createTime!).format('YYYY-MM-DD HH:mm:ss'),
        url: web.url + '/wall/all',
      });

      message.success('🎉 回复留言成功');
      setIsReplyModalOpen(false);
      setReplyInfo('');
      await getWallList(1, 10);

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  // 处理分页变化
  const handleTableChange = async (pagination: any) => {
    const pager = { ...pagination };
    await getWallList(pager.current, pager.pageSize);
  };

  return (
    <div>
      <Title value="留言管理" />

      <Card className="my-2 overflow-scroll">
        <Form
          form={form}
          layout="inline"
          onFinish={onFilterSubmit}
          autoComplete="off"
          className="flex-nowrap"
        >
          <Form.Item label="内容" name="content" className="min-w-[200px]">
            <Input placeholder="请输入内容关键词" />
          </Form.Item>

          <Form.Item label="分类" name="cateId" className="min-w-[200px]">
            <Select
              allowClear
              options={cateList}
              fieldNames={{ label: 'name', value: 'id' }}
              placeholder="请选择分类"
            />
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
      </Card>

      <Card className={`${titleSty} mt-2 min-h-[calc(100vh-180px)]`}>
        <Table
          rowKey="id"
          dataSource={list}
          columns={columns}
          loading={loading}
          expandable={{ defaultExpandAllRows: true }}
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
        title="留言详情"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <div className="pt-2 space-y-2">
          <div>
            <b>留言时间：</b>{' '}
            {dayjs(+wall?.createTime!).format('YYYY-MM-DD HH:mm:ss')}
          </div>
          <div>
            <b>留言用户：</b> {wall?.name}
          </div>
          <div>
            <b>内容：</b> {wall?.content}
          </div>
        </div>
      </Modal>

      <Modal
        title="回复留言"
        open={isReplyModalOpen}
        footer={null}
        onCancel={() => setIsReplyModalOpen(false)}
      >
        <TextArea
          value={replyInfo}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setReplyInfo(e.target.value)
          }
          placeholder="请输入回复内容"
          autoSize={{ minRows: 3, maxRows: 5 }}
        />

        <div className="flex space-x-4">
          <Button
            className="w-full mt-2"
            onClick={() => setIsReplyModalOpen(false)}
          >
            取消
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={onHandleReply}
            className="w-full mt-2"
          >
            确定
          </Button>
        </div>
      </Modal>
    </div>
  );
};
