import { useEffect, useState } from 'react';
import { Button, Card, Form, notification, Popconfirm, Table, Tag } from 'antd';
import { titleSty } from '@/styles/sty';
import Title from '@/components/Title';
import { Link } from 'react-router-dom';

import { delArticleDataAPI, getArticlePagingAPI } from '@/api/Article';
import type { Tag as ArticleTag } from '@/types/app/tag';
import type { Cate } from '@/types/app/cate';
import type { Article, FilterArticle } from '@/types/app/article';

import { useWebStore } from '@/stores';

export default () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const web = useWebStore((state) => state.web);
  const [articleList, setArticleList] = useState<Article[]>([]);
  const [form] = Form.useForm();

  const getArticleData = async (current: number, pageSize: number) => {
    try {
      setLoading(true);
      const query: FilterArticle = {
        isDraft: 1,
      };
      const { data } = await getArticlePagingAPI({
        query: query,
        pagination: {
          current: current ? current : 1,
          size: pageSize ? pageSize : 10,
        },
      });
      setArticleList(data.records);
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
    getArticleData(1, 10);
  }, []);

  const delArticleData = async (id: number) => {
    try {
      setLoading(true);

      await delArticleDataAPI(id);
      await getArticleData(1, 10);
      form.resetFields();
      notification.success({ message: '🎉 删除文章成功' });
    } catch (error) {
      setLoading(false);
    }
  };

  // 标签颜色
  const colors = ['', '#2db7f5', '#87d068', '#f50', '#108ee9'];

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
      width: 300,
      render: (text: string, record: Article) => (
        <a
          href={`${web.url}/article/${record.id}`}
          target="_blank"
          className="hover:text-primary line-clamp-1"
        >
          {text}
        </a>
      ),
    },
    {
      title: '摘要',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
      width: 350,
      render: (text: string) => (
        <div className="line-clamp-2">
          {text ? text : '该文章暂未设置文章摘要'}
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'cateList',
      key: 'cateList',
      align: 'center',
      render: (cates: Cate[]) =>
        cates.map((item, index) => (
          <Tag key={item.id} color={colors[index]}>
            {item.name}
          </Tag>
        )),
    },
    {
      title: '标签',
      dataIndex: 'tagList',
      key: 'tagList',
      align: 'center',
      render: (tags: ArticleTag[]) =>
        tags.map((item, index) => (
          <Tag key={item.id} color={colors[index]}>
            {item.name}
          </Tag>
        )),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      align: 'center',
      render: (_: string, record: Article) => (
        <div className="flex justify-center space-x-2">
          <Link to={`/create?id=${record.id}&draft=true`}>
            <Button>编辑</Button>
          </Link>

          <Popconfirm
            title="警告"
            description="你确定要删除吗"
            okText="确定"
            cancelText="取消"
            onConfirm={() => delArticleData(record.id!)}
          >
            <Button type="primary" danger>
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // 处理分页变化
  const handleTableChange = async (pagination: any) => {
    const pager = { ...pagination };
    await getArticleData(pager.current, pager.pageSize);
  };

  return (
    <div>
      <Title value="草稿箱" />

      <Card className={`${titleSty} mt-2 min-h-[calc(100vh-180px)]`}>
        <Table
          rowKey="id"
          dataSource={articleList}
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
    </div>
  );
};
