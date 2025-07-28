import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

import { Card, message, Table, Popconfirm, Button, Modal, Form, Input, DatePicker } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, SendOutlined } from '@ant-design/icons';

import { addCommentDataAPI, getCommentListAPI, delCommentDataAPI } from '@/api/Comment';
import { titleSty } from '@/styles/sty';
import Title from '@/components/Title';
import { Comment, FilterForm } from '@/types/app/comment';
import { useWebStore, useUserStore } from '@/stores';

export default () => {
  const [loading, setLoading] = useState(false);

  const web = useWebStore((state) => state.web);
  const user = useUserStore((state) => state.user);

  const [btnLoading, setBtnLoading] = useState(false);

  const [comment, setComment] = useState<Comment>({} as Comment);
  const [list, setList] = useState<Comment[]>([]);

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const getCommentList = async () => {
    try {
      setLoading(true);
      const { data } = await getCommentListAPI();
      setList(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getCommentList();
  }, []);

  const columns: ColumnsType<Comment> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
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
      render: (text: string, record: Comment) => (
        <span
          className="hover:text-primary cursor-pointer line-clamp-2"
          onClick={() => {
            setComment(record);
            setIsCommentModalOpen(true);
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
      title: '网站',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) =>
        url ? (
          <a href={url} target="_blank" className="hover:text-primary" rel="noreferrer">
            {url}
          </a>
        ) : (
          '无网站'
        ),
    },
    {
      title: '所属文章',
      dataIndex: 'articleTitle',
      key: 'articleTitle',
      render: (text: string, record: Comment) =>
        text ? (
          <a href={`${web.url}/article/${record.articleId}`} target="_blank" className="hover:text-primary" rel="noreferrer">
            {text}
          </a>
        ) : (
          '该评论暂未绑定文章'
        ),
    },
    {
      title: '评论时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (date: string) => dayjs(+date).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a: Comment, b: Comment) => +a.createTime! - +b.createTime!,
      showSorterTooltip: false,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      align: 'center',
      render: (_: string, record: Comment) => (
        <div className="flex justify-center space-x-2">
          <Button
            onClick={() => {
              setComment(record);
              setIsReplyModalOpen(true);
            }}
            icon={<SendOutlined />}
          />

          <Popconfirm title="警告" description="你确定要删除吗" okText="确定" cancelText="取消" onConfirm={() => delCommentData(record.id!)}>
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const { RangePicker } = DatePicker;

  const delCommentData = async (id: number) => {
    setLoading(true);

    try {
      await delCommentDataAPI(id);
      await getCommentList();
      message.success('🎉 删除评论成功');
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const onSubmit = async (values: FilterForm) => {
    setLoading(true);

    try {
      const query: FilterData = {
        key: values?.title,
        content: values?.content,
        startDate: values.createTime && values.createTime[0].valueOf() + '',
        endDate: values.createTime && values.createTime[1].valueOf() + '',
      };

      const { data } = await getCommentListAPI({ query });
      setList(data);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }

    setLoading(false);
  };

  // 回复内容
  const [replyInfo, setReplyInfo] = useState('');
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const onHandleReply = async () => {
    try {
      setBtnLoading(true);

      await addCommentDataAPI({
        avatar: user.avatar,
        url: web.url,
        content: replyInfo,
        commentId: comment?.id ?? 0,
        auditStatus: 1,
        email: user.email,
        name: user.name,
        articleId: comment?.articleId ?? 0,
        createTime: new Date().getTime().toString(),
      });

      message.success('🎉 回复评论成功');
      getCommentList();
      setIsReplyModalOpen(false);
      setReplyInfo('');

      setBtnLoading(true);
    } catch (error) {
      console.error(error);
      setBtnLoading(false);
    }
  };

  return (
    <div>
      <Title value="评论管理" />

      <Card className="my-2 overflow-scroll">
        <Form layout="inline" onFinish={onSubmit} autoComplete="off" className="flex-nowrap">
          <Form.Item label="标题" name="title" className="min-w-[200px]">
            <Input placeholder="请输入标题关键词" />
          </Form.Item>

          <Form.Item label="内容" name="content" className="min-w-[200px]">
            <Input placeholder="请输入内容关键词" />
          </Form.Item>

          <Form.Item label="时间范围" name="createTime" className="min-w-[250px]">
            <RangePicker placeholder={['选择起始时间', '选择结束时间']} />
          </Form.Item>

          <Form.Item className="pr-6">
            <Button type="primary" htmlType="submit">
              查询
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card className={`${titleSty} mt-2 min-h-[calc(100vh-270px)]`}>
        <Table
          rowKey="id"
          dataSource={list}
          columns={columns}
          expandable={{ defaultExpandAllRows: true }}
          scroll={{ x: 'max-content' }}
          pagination={{
            position: ['bottomCenter'],
            defaultPageSize: 8,
          }}
          loading={loading}
        />
      </Card>

      <Modal title="评论详情" open={isCommentModalOpen} onCancel={() => setIsCommentModalOpen(false)} footer={null}>
        <div className="pt-2 space-y-2">
          <div>
            <b>所属文章：</b> {comment?.articleTitle}
          </div>

          <div>
            <b>评论时间：</b> {dayjs(+comment?.createTime).format('YYYY-MM-DD HH:mm:ss')}
          </div>

          <div>
            <b>评论用户：</b> {comment?.name}
          </div>

          <div>
            <b>邮箱：</b> {comment?.email ? comment?.email : '暂无邮箱'}
          </div>

          <div>
            <b>网站：</b>{' '}
            {comment?.url ? (
              <a href={comment?.url} className="hover:text-primary">
                {comment?.url}
              </a>
            ) : (
              '无网站'
            )}
          </div>

          <div>
            <b>内容：</b> {comment?.content}
          </div>
        </div>

        <Button type="primary" loading={btnLoading} onClick={() => setIsReplyModalOpen(true)} className="w-full mt-4">
          回复
        </Button>
      </Modal>

      <Modal title="回复评论" open={isReplyModalOpen} footer={null} onCancel={() => setIsReplyModalOpen(false)}>
        <TextArea value={replyInfo} onChange={(e) => setReplyInfo(e.target.value)} placeholder="请输入回复内容" autoSize={{ minRows: 3, maxRows: 5 }} />

        <div className="flex space-x-4">
          <Button className="w-full mt-2" onClick={() => setIsReplyModalOpen(false)}>
            取消
          </Button>
          <Button type="primary" loading={btnLoading} onClick={onHandleReply} className="w-full mt-2">
            确定
          </Button>
        </div>
      </Modal>
    </div>
  );
};
