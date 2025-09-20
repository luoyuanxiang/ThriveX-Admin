import { useEffect, useState } from 'react';

import { Button, Card, Form, message, notification, Pagination, Popconfirm, Table } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { ColumnType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';

import { titleSty } from '@/styles/sty';
import Title from '@/components/Title';

import { delBatchEmailLogsDataAPI, getEmailLogsPagingAPI } from '@/api/EmailLogs.ts';

import { EmailLogs } from '@/types/app/emailLogs';

export default () => {
  const [loading, setLoading] = useState<boolean>(false);

  const [form] = Form.useForm();
  const [articleList, setArticleList] = useState<EmailLogs[]>([]);

  const [total, setTotal] = useState<number>(0);
  const [paging, setPaging] = useState<Page>({
    page: 1,
    size: 8,
  });

  // 分页获取文章
  const getArticleList = async () => {
    try {
      setLoading(true);
      const { data } = await getEmailLogsPagingAPI({
        pagination: paging,
      });
      setTotal(data.total);
      setArticleList(data.result);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const delArticleData = async (id: number) => {
    try {
      setLoading(true);

      // 普通删除：可从回收站恢复
      await delBatchEmailLogsDataAPI([id]);
      await getArticleList();
      form.resetFields();
      notification.success({ message: '🎉 删除成功' });
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const columns: ColumnType<EmailLogs>[] = [
    {
      title: '收件人',
      dataIndex: 'recipient',
      key: 'recipient',
      align: 'center',
    },
    {
      title: '标题',
      dataIndex: 'subject',
      key: 'subject',
      align: 'center',
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      align: 'center',
      width: 350,
      render: (text: string) => <div className="line-clamp-2">{text ? text : ''}</div>,
    },
    {
      title: '错误日志',
      dataIndex: 'errorMessage',
      key: 'errorMessage',
      align: 'center',
    },
    {
      title: '邮件发送时间',
      dataIndex: 'sentAt',
      key: 'sentAt',
      align: 'center',
    },
    {
      title: '是否发送成功',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status: boolean) => (status ? <span>是</span> : <span>否</span>),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      align: 'center',
      render: (_: string, record: EmailLogs) => (
        <div className="flex justify-center space-x-2">
          <Popconfirm title="警告" description="你确定要删除吗" okText="确定" cancelText="取消" onConfirm={() => delArticleData(record.id!)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  // 删除选中
  const delSelected = async () => {
    if (!selectedRowKeys.length) {
      message.warning('请选择要删除的日志');
      return;
    }

    try {
      setLoading(true);
      const { code } = await delBatchEmailLogsDataAPI(selectedRowKeys as number[]);
      if (code === 200) {
        message.success('删除成功');
        await getArticleList();
      } else {
        message.error('删除失败');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // 选择行
  const rowSelection: TableRowSelection<EmailLogs> = {
    selectedRowKeys,
    onChange: onSelectChange,
    fixed: 'left',
  };

  useEffect(() => {
    getArticleList();
  }, [paging]);

  useEffect(() => {
    getArticleList();
  }, []);

  return (
    <div>
      <Title value="邮件日志管理" />

      <Card className="border-stroke my-2 overflow-scroll">
        <Popconfirm title="警告" description="你确定要删除选中的日志吗" okText="确定" cancelText="取消" onConfirm={() => delSelected()}>
          <Button type="primary" danger>
            删除选中
          </Button>
        </Popconfirm>
      </Card>

      <Card className={`${titleSty} min-h-[calc(100vh-250px)]`}>
        <Table rowKey="id" rowSelection={rowSelection} dataSource={articleList} columns={columns} pagination={false} loading={loading} scroll={{ x: 'max-content' }} className="[&_.ant-table-selection-column]:w-18" />

        <div className="flex justify-center my-5">
          <Pagination total={total} current={paging.page} pageSize={paging.size} onChange={(page, pageSize) => setPaging({ ...paging, page, size: pageSize })} />
        </div>
      </Card>
    </div>
  );
};
